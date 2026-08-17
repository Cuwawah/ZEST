import { matchAgainstCandidates } from "./matcher";
import type { ParsedKudaEmail } from "./parser";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

function email(overrides: Partial<ParsedKudaEmail>): ParsedKudaEmail {
  return {
    isFromKuda: true,
    isCredit: true,
    amountKobo: 350100,
    senderName: "Craig Uwawah",
    narration: null,
    timestamp: new Date("2026-08-15T17:28:34Z"),
    rawBody: "",
    parseError: null,
    ...overrides,
  };
}

const candidates = [
  {
    id: "u1",
    email: "a@gmail.com",
    name: "User A",
    paymentRef: "ZEST-AAAAAA",
    paymentAmountKobo: 350100,
  },
  {
    id: "u2",
    email: "b@gmail.com",
    name: "User B",
    paymentRef: "ZEST-BBBBBB",
    paymentAmountKobo: 350200,
  },
  {
    id: "u3",
    email: "c@gmail.com",
    name: "User C",
    paymentRef: "ZEST-CCCCCC",
    paymentAmountKobo: null,
  },
];

// Unique amount match auto-activates without narration
const m1 = matchAgainstCandidates(email({ amountKobo: 350200 }), candidates);
assert(m1.status === "matched", "unique amount matches");
assert(m1.matchedUserId === "u2", "unique amount picks right user");
assert(m1.reason === "unique_amount_match", "unique amount reason");

// Flat 3,500 with no narration and pending users -> manual review
const m2 = matchAgainstCandidates(email({ amountKobo: 350000 }), candidates);
assert(m2.status === "manual_review", "flat amount -> manual review");
assert(m2.reason === "amount_matches_no_reference", "flat amount reason");

// Amount matching nobody and not expected -> unmatched
const m3 = matchAgainstCandidates(email({ amountKobo: 99999 }), candidates);
assert(m3.status === "unmatched", "random amount unmatched");
assert(m3.reason === "amount_does_not_match_expected", "random amount reason");

// No amount -> unmatched
const m4 = matchAgainstCandidates(email({ amountKobo: null }), candidates);
assert(m4.status === "unmatched", "null amount unmatched");
assert(m4.reason === "no_amount_to_match", "null amount reason");

// Collision: two users with the same unique amount -> manual review
const colliding = [
  ...candidates,
  {
    id: "u4",
    email: "d@gmail.com",
    name: "User D",
    paymentRef: "ZEST-DDDDDD",
    paymentAmountKobo: 350100,
  },
];
const m5 = matchAgainstCandidates(email({ amountKobo: 350100 }), colliding);
assert(m5.status === "manual_review", "collision -> manual review");
assert(m5.reason === "multiple_amount_matches", "collision reason");

// Narration fallback still works on flat expected amount
const m6 = matchAgainstCandidates(
  email({ amountKobo: 350000, narration: "ZEST-BBBBBB" }),
  candidates
);
assert(m6.status === "matched", "narration ref fallback matches");
assert(m6.matchedUserId === "u2", "narration ref fallback picks right user");
assert(m6.reason === "payment_reference_match", "narration ref fallback reason");

// Narration matching user email
const m7 = matchAgainstCandidates(
  email({ amountKobo: 350000, narration: "b@gmail.com" }),
  candidates
);
assert(m7.status === "matched", "narration email fallback matches");
assert(m7.reason === "narration_email_match", "narration email fallback reason");

// Narration matching two users -> manual review
const m8 = matchAgainstCandidates(
  email({ amountKobo: 350000, narration: "ZEST-BBBBBB and ZEST-CCCCCC" }),
  [...candidates, {
    id: "u5",
    email: "e@gmail.com",
    name: "User E",
    paymentRef: "ZEST-BBBBBB",
    paymentAmountKobo: 359900,
  }]
);
assert(m8.status === "manual_review", "multiple narration matches -> manual review");
assert(m8.reason === "multiple_reference_matches", "multiple narration matches reason");

// No pending users at all
const m9 = matchAgainstCandidates(email({ amountKobo: 350000 }), []);
assert(m9.status === "unmatched", "no pending orders unmatched");
assert(m9.reason === "no_pending_orders", "no pending orders reason");

// User with null unique amount cannot be matched by amount
const m10 = matchAgainstCandidates(
  email({ amountKobo: 350300, narration: "ZEST-CCCCCC" }),
  candidates
);
assert(m10.status === "unmatched", "null unique amount not matched by amount");
assert(m10.reason === "amount_does_not_match_expected", "null unique amount reason");

console.log("matcher self-test complete.");
