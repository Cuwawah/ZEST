import { prisma } from "@/lib/prisma";
import { fetchKudaEmails } from "./imap";
import { parseKudaEmail } from "./parser";
import { matchPendingOrders } from "./matcher";
import { activateSubscription } from "@/lib/subscription";

const globalForKuda = globalThis as unknown as {
  kudaPollInterval?: NodeJS.Timeout;
  kudaPolling?: boolean;
};

export function kudaEnabled(): boolean {
  return Boolean(
    process.env.GMAIL_IMAP_USER &&
      process.env.GMAIL_IMAP_PASS &&
      !process.env.KUDA_DISABLED
  );
}

function isDryRun(): boolean {
  return process.env.KUDA_DRY_RUN === "1";
}

function lookbackHours(): number {
  const raw = parseInt(process.env.KUDA_LOOKBACK_HOURS || "168", 10);
  return Number.isFinite(raw) && raw > 0 ? raw : 168;
}

export async function pollOnce(): Promise<{
  fetched: number;
  processed: number;
  skipped: number;
  dryRun: boolean;
  busy?: boolean;
}> {
  if (globalForKuda.kudaPolling) {
    return {
      fetched: 0,
      processed: 0,
      skipped: 0,
      dryRun: isDryRun(),
      busy: true,
    };
  }

  const dryRun = isDryRun();
  const since = new Date(
    Date.now() - lookbackHours() * 60 * 60 * 1000
  );

  globalForKuda.kudaPolling = true;
  try {
    const emails = await fetchKudaEmails(
      {
        user: process.env.GMAIL_IMAP_USER!,
        pass: process.env.GMAIL_IMAP_PASS!,
      },
      since
    );

    let processed = 0;
    let skipped = 0;

    for (const mail of emails) {
      let existing = null;
      try {
        existing = await prisma.paymentTransaction.findUnique({
          where: { messageId: mail.messageId },
        });
      } catch {
        existing = null;
      }

      if (existing) {
        skipped++;
        continue;
      }

      const parsed = parseKudaEmail(mail);

      // Only consider credit alerts explicitly referencing Kuda.
      if (!parsed.isFromKuda) {
        if (!dryRun) await persist(mail, parsed, "not_from_kuda", null, null, null);
        skipped++;
        continue;
      }

      if (parsed.parseError === "newsletter") {
        if (!dryRun) await persist(mail, parsed, "newsletter", null, null, null);
        skipped++;
        continue;
      }

      if (parsed.parseError === "debit_email" || !parsed.isCredit) {
        if (!dryRun) await persist(mail, parsed, "no_credit", null, null, null);
        skipped++;
        continue;
      }

      const match = await matchPendingOrders(parsed);
      if (!dryRun) {
        await persist(
          mail,
          parsed,
          match.status,
          match.matchedUserId,
          match.refMatch,
          parsed.parseError
        );

        if (match.status === "matched" && match.matchedUserId) {
          await prisma.paymentTransaction.update({
            where: { messageId: mail.messageId },
            data: { status: "activated" },
          });
          await activateSubscription(match.matchedUserId);
        }
      }

      processed++;
    }

    return { fetched: emails.length, processed, skipped, dryRun };
  } finally {
    globalForKuda.kudaPolling = false;
  }
}

async function persist(
  mail: {
    messageId: string;
    from: string;
    fromName: string;
    subject: string;
    receivedAt: Date | null;
    bodyText: string;
    rawSource: string;
  },
  parsed: Awaited<ReturnType<typeof parseKudaEmail>>,
  status: string,
  matchedUserId: string | null,
  refMatch: string | null,
  parseError: string | null
): Promise<void> {
  if (
    parseError !== null &&
    !["manual_review", "matched", "no_credit", "not_from_kuda"].includes(status)
  ) {
    status = "parse_error";
  }

  try {
    await prisma.paymentTransaction.create({
      data: {
        messageId: mail.messageId,
        sender: mail.fromName || mail.from || mail.subject,
        receivedAt: mail.receivedAt,
        amountKobo: parsed.amountKobo,
        senderName: mail.fromName || parsed.senderName,
        narration: parsed.narration,
        rawBody: mail.rawSource || mail.bodyText,
        refMatch,
        status,
        matchedUserId,
      },
    });
  } catch (err) {
    const code = (err as { code?: string }).code;
    if (code !== "P2002") {
      throw err;
    }
    // P2002: messageId collision — already persisted by a concurrent run
  }
}

export function startKudaPoller(): void {
  if (!kudaEnabled()) return;
  if (process.env.KUDA_IN_PROCESS_POLL === "0") return;
  if (globalForKuda.kudaPollInterval) return;

  const intervalMs = parseInt(
    process.env.KUDA_POLL_INTERVAL_MS || "90000",
    10
  );

  const run = async () => {
    try {
      const res = await pollOnce();
      console.log(
        `[kuda-poller] fetched=${res.fetched} processed=${res.processed} skipped=${res.skipped} dry_run=${res.dryRun}${res.busy ? " busy=true" : ""}`
      );
    } catch (err) {
      console.error("[kuda-poller] poll failed:", err);
    }
  };

  void run();
  globalForKuda.kudaPollInterval = setInterval(run, intervalMs);
}