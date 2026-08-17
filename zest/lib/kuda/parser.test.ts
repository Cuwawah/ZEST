import { parseKudaEmail, normalizeAmount } from "./parser";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

const base = {
  messageId: "test-1",
  from: "no-reply@kuda.com",
  fromName: "Kuda",
  subject: "Transaction Notification",
  receivedAt: new Date("2026-08-08T12:00:00Z"),
  bodyText: "",
};

// Real format from the inbox (credit)
const realCredit = `
Transaction Notification
Sporty Bet just sent you ₦17,487.00 - From SportyBet.
Love, The Kuda Team.
`;

const r1 = parseKudaEmail({ ...base, bodyText: realCredit });
assert(r1.isFromKuda === true, "detects kuda sender");
assert(r1.isCredit === true, "detects credit via 'just sent you'");
assert(r1.amountKobo === 1748700, "parses ₦17,487.00 -> 1748700 kobo");
assert(r1.senderName === "Sporty Bet", "extracts sender name before 'just sent you'");
assert(r1.parseError === null, "no parse error");

// Credit with explicit NGN and narration
const cred2 =
  "John Doe just sent you NGN 3,500.00. Reference: ZEST-ABC123. Love, The Kuda Team.";
const r2 = parseKudaEmail({ ...base, bodyText: cred2 });
assert(r2.isCredit === true, "credit variant 2 is credit");
assert(r2.amountKobo === 350000, "parses NGN 3,500.00 -> 350000 kobo");
assert(r2.narration === "ZEST-ABC123", "extracts narration ref");

// Real debit format
const debit = `
Transaction Notification
Hi Uwawah Oritsesholukunmi Craig,
You just sent ₦18,000.00 to Craig Oritsesholukunmi Uwawah - stuff.
Love, The Kuda Team.
`;
const r3 = parseKudaEmail({ ...base, bodyText: debit });
assert(r3.isFromKuda === true, "kuda sender on debit");
assert(r3.isCredit === false, "debit not a credit");
assert(r3.parseError === "debit_email", "flags debit email");

// Newsletter must be ignored
const news = parseKudaEmail({
  ...base,
  from: "hello@news.kuda.com",
  fromName: "The Kuda Times",
  subject: "More Life Is Almost Here",
  bodyText: "Kuda Times Issue 6: Something big is coming!",
});
assert(news.isFromKuda === true, "newsletter still from kuda domain");
assert(news.parseError === "newsletter", "flags newsletter");
assert(news.isCredit === false, "newsletter not credit");

// Non-kuda sender rejected
const r5 = parseKudaEmail({
  messageId: "test-5",
  from: "newsletter@random.com",
  fromName: "Random Store",
  subject: "Sale",
  receivedAt: null,
  bodyText: "NGN 3,500.00 charge on your card.",
});
assert(r5.isFromKuda === false, "rejects non-kuda sender");

assert(normalizeAmount("3,500") === 350000, "normalize 3,500");
assert(normalizeAmount("3500.00") === 350000, "normalize 3500.00");
assert(normalizeAmount("12.50") === 1250, "normalize 12.50");
assert(normalizeAmount("0") === null, "reject zero");

// Missing amount on credit
const r6 = parseKudaEmail({
  ...base,
  bodyText: "Someone just sent you money. Love, The Kuda Team.",
});
assert(r6.parseError === "amount_not_found", "flags missing amount");

// Narration with email address must not be truncated at '@'
const r7 = parseKudaEmail({
  ...base,
  bodyText:
    "John Doe just sent you NGN 3,500.00. Reference: user@example.com. Love, The Kuda Team.",
});
assert(r7.narration === "user@example.com", "parses email narration with @ and .");

// Narration with ZEST ref still parses
const r8 = parseKudaEmail({
  ...base,
  bodyText:
    "John Doe just sent you NGN 3,500.00. Narration: ZEST-AB12CD - subscription. Love, The Kuda Team.",
});
assert(r8.narration === "ZEST-AB12CD - subscription", "parses ref narration with hyphen and dash");

console.log("parser self-test complete.");