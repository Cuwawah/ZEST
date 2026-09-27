import assert from "node:assert";
import { matchesRule, WEEKDAYS, WEEKDAYS_FULL } from "./availabilityRules";

function rule(type: string, extra: Record<string, unknown> = {}) {
  return { type, ...extra } as Parameters<typeof matchesRule>[0];
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

void test();

function test() {
  // Thursday within a weekly rule
  const thu = { dateStr: "2026-08-20", dayOfWeek: 4, dayNum: 20 };
  // A different Thursday, one week later
  const thuNext = { dateStr: "2026-08-27", dayOfWeek: 4, dayNum: 27 };

  ok("weekly matches correct weekday", () => {
    assert.strictEqual(
      matchesRule(rule("weekly", { dayOfWeek: 4 }), thu.dateStr, thu.dayOfWeek, thu.dayNum),
      true
    );
  });

  ok("weekly rejects wrong weekday", () => {
    assert.strictEqual(
      matchesRule(rule("weekly", { dayOfWeek: 1 }), thu.dateStr, thu.dayOfWeek, thu.dayNum),
      false
    );
  });

  ok("every 2 weeks matches anchor week", () => {
    // 2026-08-27: 238 days from epoch -> weekIndex 34 (even)
    assert.strictEqual(
      matchesRule(rule("weekly", { dayOfWeek: 4, everyNDays: 2 }), "2026-08-27", 4, 27),
      true
    );
  });

  ok("every 2 weeks skips the off week", () => {
    // 2026-08-20: 231 days -> weekIndex 33 (odd)
    assert.strictEqual(
      matchesRule(rule("weekly", { dayOfWeek: 4, everyNDays: 2 }), "2026-08-20", 4, 20),
      false
    );
  });

  ok("every 2 weeks matches the on week again", () => {
    // 2026-09-03: 245 days -> weekIndex 35 (odd), off
    assert.strictEqual(
      matchesRule(rule("weekly", { dayOfWeek: 4, everyNDays: 2 }), "2026-09-03", 4, 3),
      false
    );
    // 2026-09-10: 252 days -> weekIndex 36 (even), on
    assert.strictEqual(
      matchesRule(rule("weekly", { dayOfWeek: 4, everyNDays: 2 }), "2026-09-10", 4, 10),
      true
    );
  });

  ok("every 3 weeks pattern repeats", () => {
    // 2026-08-01 (30), 2026-08-22 (33), 2026-09-12 (36): all %3 == 0, Saturdays
    const r = rule("weekly", { dayOfWeek: 6, everyNDays: 3 });
    assert.strictEqual(matchesRule(r, "2026-08-01", 6, 1), true);
    assert.strictEqual(matchesRule(r, "2026-08-22", 6, 22), true);
    assert.strictEqual(matchesRule(r, "2026-09-12", 6, 12), true);
  });

  ok("every 3 weeks skips in-between weeks", () => {
    // 2026-08-08: 219 days -> weekIndex 31 (%3 == 1), Saturday
    const r = rule("weekly", { dayOfWeek: 6, everyNDays: 3 });
    assert.strictEqual(matchesRule(r, "2026-08-08", 6, 8), false);
  });

  ok("everyNDays=1 behaves like plain weekly", () => {
    assert.strictEqual(
      matchesRule(rule("weekly", { dayOfWeek: 4, everyNDays: 1 }), thuNext.dateStr, thuNext.dayOfWeek, thuNext.dayNum),
      true
    );
  });

  ok("monthly matches day of month", () => {
    assert.strictEqual(
      matchesRule(rule("monthly", { dayOfMonth: 20 }), thu.dateStr, thu.dayOfWeek, thu.dayNum),
      true
    );
  });

  ok("monthly rejects other days", () => {
    assert.strictEqual(
      matchesRule(rule("monthly", { dayOfMonth: 21 }), thu.dateStr, thu.dayOfWeek, thu.dayNum),
      false
    );
  });

  ok("monthly matches on every month", () => {
    const d15 = { dateStr: "2026-09-15", dayOfWeek: 2, dayNum: 15 };
    assert.strictEqual(
      matchesRule(rule("monthly", { dayOfMonth: 15 }), d15.dateStr, d15.dayOfWeek, d15.dayNum),
      true
    );
  });

  ok("dateOverride matches exact date", () => {
    assert.strictEqual(
      matchesRule(rule("dateOverride", { date: "2026-08-20" }), thu.dateStr, thu.dayOfWeek, thu.dayNum),
      true
    );
  });

  ok("dateOverride rejects other dates", () => {
    assert.strictEqual(
      matchesRule(rule("dateOverride", { date: "2026-08-19" }), thu.dateStr, thu.dayOfWeek, thu.dayNum),
      false
    );
  });

  ok("unknown rule type never matches", () => {
    assert.strictEqual(
      matchesRule(rule("unknown"), thu.dateStr, thu.dayOfWeek, thu.dayNum),
      false
    );
  });

  ok("WEEKDAYS index equals Date.getUTCDay for all seven days", () => {
    for (let offset = 0; offset < 21; offset += 1) {
      const date = new Date(Date.UTC(2026, 8, 20 + offset));
      assert.strictEqual(
        WEEKDAYS[date.getUTCDay()],
        date.toLocaleDateString("en-US", { weekday: "short", timeZone: "UTC" }),
        `mismatch on ${date.toISOString().slice(0, 10)}`
      );
    }
  });

  ok("WEEKDAYS_FULL aligns with WEEKDAYS", () => {
    assert.strictEqual(WEEKDAYS.length, 7);
    assert.strictEqual(WEEKDAYS_FULL.length, 7);
    for (let i = 0; i < 7; i += 1) {
      assert.strictEqual(WEEKDAYS_FULL[i].slice(0, 3), WEEKDAYS[i]);
    }
  });

  ok("a Monday-first UI index would be off by one from the engine", () => {
    const mon = { dateStr: "2026-08-24", dayOfWeek: 1, dayNum: 24 };
    assert.strictEqual(
      matchesRule(rule("weekly", { dayOfWeek: WEEKDAYS.indexOf("Mon") }), mon.dateStr, mon.dayOfWeek, mon.dayNum),
      true
    );
    assert.strictEqual(
      matchesRule(rule("weekly", { dayOfWeek: 0 }), mon.dateStr, mon.dayOfWeek, mon.dayNum),
      false
    );
  });

  ok("default selected days 1-5 resolve to Monday through Friday", () => {
    const expected = [1, 2, 3, 4, 5].map((d) => WEEKDAYS[d]);
    assert.deepStrictEqual(expected, ["Mon", "Tue", "Wed", "Thu", "Fri"]);
  });

  console.log("availability-rules self-test complete");
}