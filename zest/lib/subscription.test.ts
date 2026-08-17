import assert from "node:assert";
import {
  planRenewalActions,
  type RenewalCandidate,
} from "./subscription";

const DAY = 24 * 60 * 60 * 1000;

function makeUser(overrides: Partial<RenewalCandidate> = {}): RenewalCandidate {
  return {
    id: "u1",
    email: "user@example.com",
    name: "Test",
    plan: "active",
    trialEndsAt: null,
    planExpiresAt: new Date(Date.now() + 30 * DAY),
    sentReminders: null,
    paymentAmountKobo: 354500,
    paymentRef: "ZEST-TEST",
    ...overrides,
  };
}

function ok(name: string, fn: () => void) {
  try {
    fn();
    console.log(`  ✓ ${name}`);
  } catch (err) {
    console.error(`  ✗ FAIL: ${name}`);
    throw err;
  }
}

function types(actions: ReturnType<typeof planRenewalActions>): string[] {
  return actions.map((a) => a.type);
}

function test() {
  const now = new Date("2026-08-15T12:00:00Z");

  ok("trial user more than 3 days out: none", () => {
    const u = makeUser({
      plan: "free",
      trialEndsAt: new Date(now.getTime() + 5 * DAY),
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["none"]);
  });

  ok("trial user within 3 days: trial_expiring", () => {
    const u = makeUser({
      plan: "free",
      trialEndsAt: new Date(now.getTime() + 2 * DAY),
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["trial_expiring"]);
  });

  ok("trial_expiring fires only once (sentReminders)", () => {
    const u = makeUser({
      plan: "free",
      trialEndsAt: new Date(now.getTime() + 2 * DAY),
      sentReminders: "trial_expiring",
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["none"]);
  });

  ok("trial ended after reminder-after window: trial_expired", () => {
    const u = makeUser({
      plan: "free",
      trialEndsAt: new Date(now.getTime() - 2 * DAY),
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["trial_expired"]);
  });

  ok("trial ended but inside after window: none yet", () => {
    const u = makeUser({
      plan: "free",
      trialEndsAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["none"]);
  });

  ok("trial_expired fires only once", () => {
    const u = makeUser({
      plan: "free",
      trialEndsAt: new Date(now.getTime() - 2 * DAY),
      sentReminders: "trial_expired",
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["none"]);
  });

  ok("plain free user (no trial): none", () => {
    const u = makeUser({ plan: "free", trialEndsAt: null, planExpiresAt: null });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["none"]);
  });

  ok("active user more than 3 days out: none", () => {
    const u = makeUser({
      plan: "active",
      planExpiresAt: new Date(now.getTime() + 5 * DAY),
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["none"]);
  });

  ok("active user within 3 days: renew_expiring", () => {
    const u = makeUser({
      plan: "active",
      planExpiresAt: new Date(now.getTime() + 2 * DAY),
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["renew_expiring"]);
  });

  ok("renew_expiring fires only once", () => {
    const u = makeUser({
      plan: "active",
      planExpiresAt: new Date(now.getTime() + 2 * DAY),
      sentReminders: "renew_expiring",
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["none"]);
  });

  ok("active user at expiry: expire_plan + renew_expired", () => {
    const u = makeUser({
      plan: "active",
      planExpiresAt: new Date(now.getTime() - 1 * 60 * 60 * 1000),
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), [
      "expire_plan",
      "renew_expired",
    ]);
  });

  ok("expiry actions fire only once", () => {
    const u = makeUser({
      plan: "active",
      planExpiresAt: new Date(now.getTime() - DAY),
      sentReminders: "renew_expired",
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["expire_plan"]);
  });

  ok("inactive user (already expired, no expiry date): none", () => {
    const u = makeUser({ plan: "inactive", planExpiresAt: null });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["none"]);
  });

  ok("exactly at 3-day boundary: renew_expiring", () => {
    const u = makeUser({
      plan: "active",
      planExpiresAt: new Date(now.getTime() + 3 * DAY),
    });
    assert.deepStrictEqual(types(planRenewalActions(u, now)), ["renew_expiring"]);
  });
}

test();
console.log("subscription self-test complete");
