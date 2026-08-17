import {
  generatePaymentAmountKobo,
  formatPaymentAmount,
  PRICE_KOBO,
  UNIQUE_AMOUNT_OFFSET_MAX,
  UNIQUE_AMOUNT_OFFSET_MIN,
} from "./plan";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

const amounts = Array.from({ length: 200 }, () => generatePaymentAmountKobo());

assert(
  amounts.every((a) => a >= PRICE_KOBO + UNIQUE_AMOUNT_OFFSET_MIN * 100),
  "generated amounts above minimum"
);
assert(
  amounts.every((a) => a <= PRICE_KOBO + UNIQUE_AMOUNT_OFFSET_MAX * 100),
  "generated amounts below maximum"
);
assert(
  amounts.every((a) => a % 100 === 0),
  "generated amounts are whole naira"
);

assert(formatPaymentAmount(350000) === "₦3,500", "formats whole naira");
assert(formatPaymentAmount(350100) === "₦3,501", "formats offset naira");
assert(formatPaymentAmount(359900) === "₦3,599", "formats max offset naira");
assert(formatPaymentAmount(null) === "NGN 3,500", "formats null fallback");
assert(formatPaymentAmount(undefined) === "NGN 3,500", "formats undefined fallback");

console.log("plan self-test complete.");
