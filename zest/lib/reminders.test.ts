import assert from "node:assert";
import {
  selectBookingsForReminder,
  type ReminderCandidate,
} from "./reminders";

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

function makeCandidate(
  overrides: Partial<ReminderCandidate> = {}
): ReminderCandidate {
  return {
    id: "bk1",
    startTime: new Date(),
    reminderHours: 24,
    reminderSentAt: null,
    ...overrides,
  };
}

function test() {
  const now = Date.parse("2026-08-20T12:00:00Z");

  ok("booking in 24h reminder window is selected", () => {
    const b = makeCandidate({
      startTime: new Date(now + 24 * 3600000),
      reminderHours: 24,
    });
    assert.deepStrictEqual(
      selectBookingsForReminder([b], new Date(now)).map((x) => x.id),
      ["bk1"]
    );
  });

  ok("booking at exact reminder boundary is selected", () => {
    const b = makeCandidate({
      startTime: new Date(now + 24 * 3600000),
      reminderHours: 24,
    });
    assert.deepStrictEqual(
      selectBookingsForReminder([b], new Date(now)).map((x) => x.id),
      ["bk1"]
    );
  });

  ok("booking beyond window is skipped", () => {
    const b = makeCandidate({
      startTime: new Date(now + 24 * 3600000 + 60000 * 30),
      reminderHours: 24,
    });
    assert.deepStrictEqual(selectBookingsForReminder([b], new Date(now)), []);
  });

  ok("booking already started is skipped", () => {
    const b = makeCandidate({
      startTime: new Date(now - 3600000),
      reminderHours: 1,
    });
    assert.deepStrictEqual(selectBookingsForReminder([b], new Date(now)), []);
  });

  ok("already reminded booking is skipped", () => {
    const b = makeCandidate({
      startTime: new Date(now + 24 * 3600000),
      reminderHours: 24,
      reminderSentAt: new Date(now - 3600000),
    });
    assert.deepStrictEqual(selectBookingsForReminder([b], new Date(now)), []);
  });

  ok("3h reminder window works", () => {
    const b = makeCandidate({
      startTime: new Date(now + 3 * 3600000),
      reminderHours: 3,
    });
    assert.deepStrictEqual(
      selectBookingsForReminder([b], new Date(now)).map((x) => x.id),
      ["bk1"]
    );
  });

  ok("booking inside window but for different hours skipped", () => {
    const b = makeCandidate({
      startTime: new Date(now + 5 * 3600000),
      reminderHours: 3,
    });
    assert.deepStrictEqual(selectBookingsForReminder([b], new Date(now)), []);
  });

  ok("multiple bookings: only due ones selected", () => {
    const due1 = makeCandidate({
      id: "a",
      startTime: new Date(now + 24 * 3600000),
      reminderHours: 24,
    });
    const notDue = makeCandidate({
      id: "b",
      startTime: new Date(now + 25 * 3600000),
      reminderHours: 24,
    });
    const due2 = makeCandidate({
      id: "c",
      startTime: new Date(now + 48 * 3600000),
      reminderHours: 48,
    });
    assert.deepStrictEqual(
      selectBookingsForReminder([due1, notDue, due2], new Date(now)).map(
        (x) => x.id
      ),
      ["a", "c"]
    );
  });

  console.log("reminders self-test complete");
}