import assert from "node:assert";
import { overlaps, spotsLeftFor } from "./capacity";

function ok(name: string, fn: () => void) {
  try {
    fn();
    console.log(`ok: ${name}`);
  } catch (err) {
    console.error(`FAIL: ${name}`);
    throw err;
  }
}

void test();

function test() {
  const slotStart = Date.parse("2026-08-20T10:00:00Z");
  const slotEnd = Date.parse("2026-08-20T10:30:00Z");

  ok("identical time overlaps", () => {
    assert.strictEqual(
      overlaps(slotStart, slotEnd, 0, {
        startTime: slotStart,
        endTime: slotEnd,
      }),
      true
    );
  });

  ok("inside slot overlaps", () => {
    assert.strictEqual(
      overlaps(slotStart, slotEnd, 0, {
        startTime: slotStart + 60000,
        endTime: slotEnd - 60000,
      }),
      true
    );
  });

  ok("adjacent booking does not overlap", () => {
    assert.strictEqual(
      overlaps(slotStart, slotEnd, 0, {
        startTime: slotEnd,
        endTime: slotEnd + 30 * 60000,
      }),
      false
    );
  });

  ok("buffer extends the overlap window", () => {
    assert.strictEqual(
      overlaps(slotStart, slotEnd, 15 * 60000, {
        startTime: slotEnd - 10 * 60000,
        endTime: slotEnd + 20 * 60000,
      }),
      true
    );
  });

  ok("booking ending right at buffer edge still overlaps", () => {
    assert.strictEqual(
      overlaps(slotStart, slotEnd, 15 * 60000, {
        startTime: slotEnd - 70000,
        endTime: slotEnd + 70000,
      }),
      true
    );
  });

  ok("capacity 1 with one booking: zero left", () => {
    assert.strictEqual(
      spotsLeftFor(
        slotStart,
        slotEnd,
        0,
        [{ startTime: slotStart, endTime: slotEnd }],
        1
      ),
      0
    );
  });

  ok("capacity 1 with no bookings: one left", () => {
    assert.strictEqual(spotsLeftFor(slotStart, slotEnd, 0, [], 1), 1);
  });

  ok("capacity 3 with two overlapping: one left", () => {
    assert.strictEqual(
      spotsLeftFor(slotStart, slotEnd, 0, [
        { startTime: slotStart, endTime: slotEnd },
        { startTime: slotStart + 60000, endTime: slotEnd },
      ], 3),
      1
    );
  });

  ok("non-overlapping bookings do not consume capacity", () => {
    assert.strictEqual(
      spotsLeftFor(slotStart, slotEnd, 0, [
        { startTime: slotStart - 60000, endTime: slotStart },
        { startTime: slotEnd, endTime: slotEnd + 60000 },
      ], 1),
      1
    );
  });

  ok("never negative", () => {
    assert.strictEqual(
      spotsLeftFor(slotStart, slotEnd, 0, [
        { startTime: slotStart, endTime: slotEnd },
        { startTime: slotStart, endTime: slotEnd },
      ], 1),
      0
    );
  });

  console.log("capacity self-test complete");
}