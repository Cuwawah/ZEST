import { ImapFlow } from "imapflow";
import { simpleParser } from "mailparser";

export interface FetchedEmail {
  messageId: string;
  from: string;
  fromName: string;
  subject: string;
  receivedAt: Date | null;
  bodyText: string;
  rawSource: string;
}

export interface MailboxConfig {
  user: string;
  pass: string;
  host?: string;
  port?: number;
}

export function htmlToReadable(html: string | false | undefined): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;|&amp;|&lt;|&gt;|&#39;|&quot;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function withRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      if (attempt === retries) break;
      await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)));
    }
  }
  throw lastErr;
}

export async function fetchKudaEmails(
  cfg: MailboxConfig,
  since: Date,
  limit?: number
): Promise<FetchedEmail[]> {
  const rawLimit =
    limit ?? parseInt(process.env.KUDA_FETCH_LIMIT || "50", 10);
  const max = Number.isFinite(rawLimit) && rawLimit > 0 ? rawLimit : 50;

  const run = async (): Promise<FetchedEmail[]> => {
    const client = new ImapFlow({
      host: cfg.host || "imap.gmail.com",
      port: cfg.port || 993,
      secure: true,
      auth: { user: cfg.user, pass: cfg.pass },
      logger: false,
    });

    const results: FetchedEmail[] = [];

    try {
      await client.connect();
      const lock = await client.getMailboxLock("INBOX");

      try {
        const uidList = await client.search(
          { since, from: "kuda.com" },
          { uid: true }
        );
        const uids = (uidList || []).slice(-max);

        const envelopes = await Promise.all(
          uids.map(async (uid) => {
            try {
              const msg = await client.fetchOne(
                String(uid),
                { envelope: true },
                { uid: true }
              );
              if (!msg) return null;
              const env = msg.envelope;
              const from = env?.from?.[0];
              return {
                uid,
                address: from?.address || "",
                name: from?.name || "",
                subject: env?.subject || "",
                date: msg.internalDate ? new Date(msg.internalDate) : null,
              };
            } catch {
              return null;
            }
          })
        );

        const kudaUids = envelopes
          .flatMap((c) =>
            c && (/kuda/i.test(c.address) || /kuda/i.test(c.name)) ? [c] : []
          )
          .slice(0, max);

        for (const c of kudaUids) {
          if (!c) continue;
          try {
            const msg = await client.fetchOne(
              String(c.uid),
              { source: true },
              { uid: true }
            );
            if (!msg || !msg.source) continue;

            const parsed = await simpleParser(msg.source);

            results.push({
              messageId:
                parsed.messageId || String(c.uid) || `${Date.now()}-${c.uid}`,
              from: c.address,
              fromName: c.name || "",
              subject: c.subject || parsed.subject || "",
              receivedAt: c.date || parsed.date || null,
              bodyText: htmlToReadable(parsed.html) || parsed.text || "",
              rawSource: String(msg.source || ""),
            });
          } catch {
            // skip unparseable message
          }
        }
      } finally {
        lock.release();
      }
    } finally {
      await client.logout().catch(() => {});
    }

    return results;
  };

  return withRetry(run, 2);
}