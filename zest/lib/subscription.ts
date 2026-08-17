import { prisma } from "@/lib/prisma";
import { sendMail, appUrl } from "@/lib/mail";
import { formatPaymentAmount } from "@/lib/plan";

export const SUBSCRIPTION_DAYS = 30;
export const REMINDER_BEFORE_DAYS = 3;
export const REMINDER_AFTER_DAYS = 1;

export type ReminderKey =
  | "trial_expiring"
  | "trial_expired"
  | "renew_expiring"
  | "renew_expired";

export interface RenewalCandidate {
  id: string;
  email: string;
  name: string | null;
  plan: string;
  trialEndsAt: Date | null;
  planExpiresAt: Date | null;
  sentReminders: string | null;
  paymentAmountKobo: number | null;
  paymentRef: string | null;
}

export type RenewalAction =
  | { type: "none" }
  | { type: "trial_expiring" }
  | { type: "trial_expired" }
  | { type: "renew_expiring" }
  | { type: "expire_plan" }
  | { type: "renew_expired" };

export function subscriptionDays(): number {
  const raw = parseInt(process.env.SUBSCRIPTION_DAYS || `${SUBSCRIPTION_DAYS}`, 10);
  return Number.isFinite(raw) && raw > 0 ? raw : SUBSCRIPTION_DAYS;
}

export function reminderBeforeDays(): number {
  const raw = parseInt(
    process.env.REMINDER_BEFORE_DAYS || `${REMINDER_BEFORE_DAYS}`,
    10
  );
  return Number.isFinite(raw) && raw >= 0 ? raw : REMINDER_BEFORE_DAYS;
}

export function reminderAfterDays(): number {
  const raw = parseInt(
    process.env.REMINDER_AFTER_DAYS || `${REMINDER_AFTER_DAYS}`,
    10
  );
  return Number.isFinite(raw) && raw >= 0 ? raw : REMINDER_AFTER_DAYS;
}

export function planRenewalActions(
  user: RenewalCandidate,
  now: Date = new Date()
): RenewalAction[] {
  const sent = new Set((user.sentReminders || "").split(",").filter(Boolean));
  const actions: RenewalAction[] = [];

  if (user.plan === "free" && user.trialEndsAt) {
    const before = reminderBeforeDays();
    const after = reminderAfterDays();
    if (
      now.getTime() >= user.trialEndsAt.getTime() - before * 24 * 60 * 60 * 1000 &&
      now.getTime() < user.trialEndsAt.getTime() &&
      !sent.has("trial_expiring")
    ) {
      actions.push({ type: "trial_expiring" });
    }
    if (
      now.getTime() >= user.trialEndsAt.getTime() + after * 24 * 60 * 60 * 1000 &&
      !sent.has("trial_expired")
    ) {
      actions.push({ type: "trial_expired" });
    }
  }

  if (user.plan === "active" && user.planExpiresAt) {
    const before = reminderBeforeDays();
    if (
      now.getTime() >= user.planExpiresAt.getTime() - before * 24 * 60 * 60 * 1000 &&
      now.getTime() < user.planExpiresAt.getTime() &&
      !sent.has("renew_expiring")
    ) {
      actions.push({ type: "renew_expiring" });
    }
    if (now.getTime() >= user.planExpiresAt.getTime()) {
      actions.push({ type: "expire_plan" });
      if (!sent.has("renew_expired")) {
        actions.push({ type: "renew_expired" });
      }
    }
  }

  if (actions.length === 0) actions.push({ type: "none" });
  return actions;
}

function addReminderKey(userId: string, keys: ReminderKey[]): Promise<unknown> {
  return prisma.user.update({
    where: { id: userId },
    data: {
      sentReminders: keys.join(","),
    },
  });
}

export async function activateSubscription(userId: string): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      plan: "active",
      trialEndsAt: null,
      planExpiresAt: new Date(
        Date.now() + subscriptionDays() * 24 * 60 * 60 * 1000
      ),
      sentReminders: null,
      renewalNoticeDismissedAt: null,
    },
  });
}

export async function runRenewalSweep(now: Date = new Date()): Promise<{
  trialExpiring: number;
  trialExpired: number;
  renewExpiring: number;
  expired: number;
  renewExpired: number;
}> {
  const users = (await prisma.user.findMany({
    where: {
      OR: [
        { plan: "active" },
        { plan: "free", trialEndsAt: { not: null } },
      ],
    },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      trialEndsAt: true,
      planExpiresAt: true,
      sentReminders: true,
      paymentAmountKobo: true,
      paymentRef: true,
    },
  })) as RenewalCandidate[];

  const counts = {
    trialExpiring: 0,
    trialExpired: 0,
    renewExpiring: 0,
    expired: 0,
    renewExpired: 0,
  };

  for (const user of users) {
    const actions = planRenewalActions(user, now);
    for (const action of actions) {
      if (action.type === "none") continue;

      const sentKeys = new Set(
        (user.sentReminders || "").split(",").filter(Boolean)
      );

      if (action.type === "trial_expiring") {
        sentKeys.add("trial_expiring");
        counts.trialExpiring++;
        await sendMail(
          user.email,
          "Your Zest Pro trial ends soon",
          trialExpiringEmail(user)
        );
      } else if (action.type === "trial_expired") {
        sentKeys.add("trial_expired");
        counts.trialExpired++;
        await sendMail(
          user.email,
          "Your Zest Pro trial has ended",
          trialExpiredEmail(user)
        );
      } else if (action.type === "renew_expiring") {
        sentKeys.add("renew_expiring");
        counts.renewExpiring++;
        await sendMail(
          user.email,
          "Your Zest Pro subscription renews soon",
          renewExpiringEmail(user)
        );
      } else if (action.type === "expire_plan") {
        counts.expired++;
        await prisma.user.update({
          where: { id: user.id },
          data: { plan: "inactive" },
        });
      } else if (action.type === "renew_expired") {
        sentKeys.add("renew_expired");
        counts.renewExpired++;
        await sendMail(
          user.email,
          "Your Zest Pro subscription has expired",
          renewExpiredEmail(user)
        );
      }

      await addReminderKey(user.id, [...sentKeys] as ReminderKey[]);
    }
  }

  return counts;
}

function daysText(ms: number): string {
  const days = Math.max(1, Math.ceil(ms / (24 * 60 * 60 * 1000)));
  return `${days} day${days === 1 ? "" : "s"}`;
}

function baseEmail(user: RenewalCandidate): string {
  return `Hi ${user.name || "there"},

`;
}

function billingLink(user: RenewalCandidate): string {
  const amount = user.paymentAmountKobo
    ? formatPaymentAmount(user.paymentAmountKobo)
    : "your unique amount";
  return `Transfer ${amount} to Zestbook Digital Limited (Kuda) to keep your subscription active. Your reference is ${user.paymentRef || "ZEST-XXXX"}.

Renew here: ${appUrl()}/dashboard/billing`;
}

function trialExpiringEmail(user: RenewalCandidate): string {
  const left = user.trialEndsAt
    ? daysText(user.trialEndsAt.getTime() - Date.now())
    : "a few";
  return `${baseEmail(user)}Your Zest Pro trial ends in ${left}. After it ends, you'll keep the free plan (1 event type) but lose unlimited event types and WhatsApp notify.

${billingLink(user)}

— The Zest team`;
}

function trialExpiredEmail(user: RenewalCandidate): string {
  return `${baseEmail(user)}Your Zest Pro trial has ended. You're now on the free plan (1 event type).

Want unlimited event types and WhatsApp notify back? Upgrade to Pro:
${billingLink(user)}

— The Zest team`;
}

function renewExpiringEmail(user: RenewalCandidate): string {
  const left = user.planExpiresAt
    ? daysText(user.planExpiresAt.getTime() - Date.now())
    : "a few";
  return `${baseEmail(user)}Your Zest Pro subscription renews in ${left}. To keep unlimited event types and WhatsApp notify, renew your payment before it lapses.

${billingLink(user)}

— The Zest team`;
}

function renewExpiredEmail(user: RenewalCandidate): string {
  return `${baseEmail(user)}Your Zest Pro subscription has expired, so your account has been placed on hold — you can no longer accept bookings.

Renew to reactivate instantly:
${billingLink(user)}

— The Zest team`;
}
