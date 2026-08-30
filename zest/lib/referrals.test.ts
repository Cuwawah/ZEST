import {
  generateReferralCode,
  referralRewardMs,
  computeReferralTrialEnds,
  REFERRAL_REWARD_DAYS,
} from "./referrals";
import { TRIAL_DAYS } from "./plan";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

// generateReferralCode
const codes = Array.from({ length: 100 }, () => generateReferralCode());

assert(
  codes.every((c) => c.length === 8),
  "referral codes are 8 characters"
);

assert(
  codes.every((c) => /^[A-Z0-9]+$/.test(c)),
  "referral codes are uppercase alphanumeric"
);

assert(
  new Set(codes).size === codes.length,
  "referral codes are unique (100 samples)"
);

// referralRewardMs
const expectedMs = (TRIAL_DAYS + REFERRAL_REWARD_DAYS) * 24 * 60 * 60 * 1000;
assert(
  referralRewardMs() === expectedMs,
  "referralRewardMs equals trial + reward days in ms"
);

assert(
  referralRewardMs() === 37 * 24 * 60 * 60 * 1000,
  "referralRewardMs is 37 days"
);

// computeReferralTrialEnds
const now = new Date("2026-08-30T12:00:00Z");
const rewardMs = referralRewardMs();

// Case 1: no current trial
const result1 = computeReferralTrialEnds(null, rewardMs, now);
assert(
  result1.getTime() === now.getTime() + rewardMs,
  "no current trial: extends from now"
);

// Case 2: current trial already expired
const past = new Date("2026-08-01T00:00:00Z");
const result2 = computeReferralTrialEnds(past, rewardMs, now);
assert(
  result2.getTime() === now.getTime() + rewardMs,
  "expired trial: extends from now"
);

// Case 3: current trial still active (future)
const future = new Date("2026-09-15T00:00:00Z");
const result3 = computeReferralTrialEnds(future, rewardMs, now);
assert(
  result3.getTime() === future.getTime() + rewardMs,
  "active trial: extends from current trial end"
);

// Case 4: current trial ends after now but before now + reward
const soon = new Date("2026-09-01T00:00:00Z");
const result4 = computeReferralTrialEnds(soon, rewardMs, now);
assert(
  result4.getTime() === soon.getTime() + rewardMs,
  "trial ending soon: extends from trial end"
);

console.log("referrals self-test complete.");
