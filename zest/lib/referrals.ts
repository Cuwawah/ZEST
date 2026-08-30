import { TRIAL_DAYS } from "./plan";

export const REFERRAL_REWARD_DAYS = 30;

export function generateReferralCode(): string {
  return Math.random().toString(36).slice(2, 10).toUpperCase();
}

export function referralRewardMs(): number {
  return (TRIAL_DAYS + REFERRAL_REWARD_DAYS) * 24 * 60 * 60 * 1000;
}

export function computeReferralTrialEnds(
  currentTrialEndsAt: Date | null | undefined,
  rewardMs: number,
  now: Date
): Date {
  const base = Math.max(
    currentTrialEndsAt instanceof Date ? currentTrialEndsAt.getTime() : 0,
    now.getTime()
  );
  return new Date(base + rewardMs);
}
