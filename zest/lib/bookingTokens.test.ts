import assert from "node:assert";
import { SignJWT } from "jose";
import {
  bookingManageExpiry,
  signBookingToken,
  verifyBookingToken,
} from "./bookingTokens";

const SECRET = "test-secret-123";
const DAY_MS = 24 * 60 * 60 * 1000;

async function main() {
  const token = await signBookingToken("b1", "e1", undefined, SECRET);
  assert.deepStrictEqual(await verifyBookingToken(token, SECRET), {
    bookingId: "b1",
    eventTypeId: "e1",
  });
  console.log("ok: sign and verify round-trip");

  assert.strictEqual(await verifyBookingToken("not-a-token", SECRET), null);
  console.log("ok: garbage token rejected");

  assert.strictEqual(await verifyBookingToken(token, "wrong-secret"), null);
  console.log("ok: wrong secret rejected");

  const expired = await new SignJWT({
    bookingId: "b1",
    eventTypeId: "e1",
    purpose: "booking-manage",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("-1m")
    .sign(new TextEncoder().encode(SECRET));
  assert.strictEqual(await verifyBookingToken(expired, SECRET), null);
  console.log("ok: expired token rejected");

  const wrongPurpose = await new SignJWT({ bookingId: "b1", purpose: "other" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(SECRET));
  assert.strictEqual(await verifyBookingToken(wrongPurpose, SECRET), null);
  console.log("ok: token with wrong purpose rejected");

  const now = Date.parse("2026-08-20T12:00:00Z");
  ok("event 2 days out gets 14-day floor (link valid at least 14d)", () => {
    const exp = bookingManageExpiry(now + 2 * DAY_MS, now);
    assert.strictEqual(exp.getTime(), now + 14 * DAY_MS);
  });

  ok("event 20 days out gets start + 1 day", () => {
    const exp = bookingManageExpiry(now + 20 * DAY_MS, now);
    assert.strictEqual(exp.getTime(), now + 21 * DAY_MS);
  });

  ok("event exactly 13 days out = floor boundary", () => {
    const exp = bookingManageExpiry(now + 13 * DAY_MS, now);
    assert.strictEqual(exp.getTime(), now + 14 * DAY_MS);
  });

  ok("token signed with custom expiry is valid until then", async () => {
    const t = await signBookingToken(
      "b1",
      "e1",
      new Date(now + 60 * DAY_MS),
      SECRET
    );
    assert.deepStrictEqual(await verifyBookingToken(t, SECRET), {
      bookingId: "b1",
      eventTypeId: "e1",
    });
    console.log("ok: custom expiry sign/verify");
  });

  console.log("booking-tokens self-test complete");
}

function ok(name: string, fn: () => void) {
  try {
    fn();
    console.log(`ok: ${name}`);
  } catch (err) {
    console.error(`FAIL: ${name}`);
    throw err;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});