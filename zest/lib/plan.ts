export const TRIAL_DAYS = 7;
export const FREE_EVENT_TYPES_LIMIT = 1;
export const PRICE = "NGN 3,500";
export const PRICE_LABEL = `${PRICE}/month`;
export const PRICE_KOBO = 350000;
export const UNIQUE_AMOUNT_OFFSET_MIN = 1;
export const UNIQUE_AMOUNT_OFFSET_MAX = 99;

export type AccountStatus = "active" | "trial" | "inactive";
export type Tier = "free" | "pro";

export function trialEndsAtFor(base: Date): Date {
  return new Date(base.getTime() + TRIAL_DAYS * 24 * 60 * 60 * 1000);
}

export function accountStatus(
  plan: string,
  trialEndsAt: Date | null | undefined
): AccountStatus {
  if (plan === "active") return "active";
  if (plan === "free") {
    return trialEndsAt && trialEndsAt.getTime() > Date.now()
      ? "trial"
      : "active";
  }
  return "inactive";
}

export function canAcceptBookings(
  plan: string,
  trialEndsAt: Date | null | undefined
): boolean {
  return accountStatus(plan, trialEndsAt) !== "inactive";
}

export function effectiveTier(
  plan: string,
  trialEndsAt: Date | null | undefined
): Tier {
  if (plan === "active") return "pro";
  if (plan === "free") {
    return trialEndsAt && trialEndsAt.getTime() > Date.now()
      ? "pro"
      : "free";
  }
  return "free";
}

export function isPaid(
  plan: string,
  trialEndsAt: Date | null | undefined
): boolean {
  return effectiveTier(plan, trialEndsAt) === "pro";
}

export function daysLeft(trialEndsAt: Date | null | undefined): number {
  if (!trialEndsAt) return 0;
  return Math.max(
    0,
    Math.ceil((trialEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
  );
}

export function generatePaymentAmountKobo(): number {
  const offset =
    UNIQUE_AMOUNT_OFFSET_MIN +
    Math.floor(
      Math.random() *
        (UNIQUE_AMOUNT_OFFSET_MAX - UNIQUE_AMOUNT_OFFSET_MIN + 1)
    );
  return PRICE_KOBO + offset * 100;
}

export function formatPaymentAmount(amountKobo: number | null | undefined): string {
  if (!amountKobo) return PRICE;
  const naira = amountKobo / 100;
  return Number.isInteger(naira)
    ? `₦${naira.toLocaleString("en-NG")}`
    : `₦${naira.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;
}

export function kudaAccountNumber(): string {
  return process.env.KUDA_ACCOUNT_NUMBER || "";
}

export function kudaAccountName(): string {
  return process.env.KUDA_ACCOUNT_NAME || "ZESTBOOK DIGITAL LIMITED";
}

export function kudaBankName(): string {
  return process.env.KUDA_BANK_NAME || "Kuda";
}
