function partsInTz(
  ts: number,
  tz: string
): { year: number; month: number; day: number; hour: number; minute: number } {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const parts = dtf.formatToParts(ts);
  const get = (type: string) =>
    parseInt(parts.find((p) => p.type === type)?.value || "0", 10);
  return {
    year: get("year"),
    month: get("month"),
    day: get("day"),
    hour: get("hour"),
    minute: get("minute"),
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

/** Wall-clock "HH:MM" (or "HH:MM:SS") in `tz` -> epoch millis. */
export function zonedTimestamp(tz: string, dateStr: string, time: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const [hh, mm] = time.split(":").map(Number);
  let candidate = Date.UTC(y, m - 1, d, hh, mm);
  for (let i = 0; i < 5; i++) {
    const parts = partsInTz(candidate, tz);
    const target = hh * 60 + (mm || 0);
    const actual = parts.hour * 60 + parts.minute;
    const delta = target - actual;
    if (delta === 0) break;
    candidate += delta * 60000;
  }
  return candidate;
}

/** Date in `tz` as "YYYY-MM-DD". */
export function zonedDateString(ts: number, tz: string): string {
  const p = partsInTz(ts, tz);
  return `${p.year}-${pad(p.month)}-${pad(p.day)}`;
}

/** Date parts (year/month/day) in `tz`. */
export function zonedDateParts(
  ts: number,
  tz: string
): { year: number; month: number; day: number } {
  const p = partsInTz(ts, tz);
  return { year: p.year, month: p.month, day: p.day };
}

/** Day of week (0=Sunday..6=Saturday) of a calendar date in `tz`. */
export function zonedDayOfWeek(ts: number, tz: string): number {
  const p = partsInTz(ts, tz);
  return new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay();
}

function addDays(year: number, month: number, day: number, days: number) {
  const dt = new Date(Date.UTC(year, month - 1, day + days, 12));
  return {
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth() + 1,
    day: dt.getUTCDate(),
  };
}

/** Consecutive `count` days starting from "today" in `tz`. */
export function nextDaysInTz(
  tz: string,
  count: number
): Array<{ date: string; day: string; dayNum: number; month: string; ts: number }> {
  const today = new Date();
  const p = partsInTz(today.getTime(), tz);
  const out: Array<{ date: string; day: string; dayNum: number; month: string; ts: number }> = [];
  for (let i = 0; i < count; i++) {
    const t = addDays(p.year, p.month, p.day, i);
    const dateStr = `${t.year}-${pad(t.month)}-${pad(t.day)}`;
    const ts = zonedTimestamp(tz, dateStr, "00:00");
    const display = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      weekday: "short",
      month: "short",
    }).format(ts);
    const [day, month] = display.split(", ");
    out.push({ date: dateStr, day, dayNum: t.day, month, ts });
  }
  return out;
}

export function formatDateTimeInTz(
  ts: number,
  tz: string | null | undefined,
  style?: {
    weekday?: "long" | "short";
    month?: "long" | "short" | "2-digit";
    day?: "numeric" | "2-digit";
    year?: "numeric" | "2-digit";
    hour?: "numeric" | "2-digit";
    minute?: "2-digit";
    hour12?: boolean;
  }
): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz || undefined,
    weekday: style?.weekday ?? "long",
    month: style?.month ?? "long",
    day: style?.day ?? "numeric",
    year: style?.year ?? "numeric",
    hour: style?.hour ?? "numeric",
    minute: style?.minute ?? "2-digit",
    hour12: style?.hour12 ?? true,
  }).format(ts);
}

export function formatTimeInTz(ts: number, tz: string | null | undefined): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: tz || undefined,
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(ts);
}