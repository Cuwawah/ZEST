export interface AvailabilityRuleInput {
  type: string;
  dayOfWeek?: number | null;
  date?: string | null;
  everyNDays?: number | null;
  dayOfMonth?: number | null;
}

const REFERENCE_EPOCH = Date.UTC(2026, 0, 1);
const DAY_MS = 24 * 60 * 60 * 1000;

function weekIndex(dateStr: string): number {
  const [y, m, d] = dateStr.split("-").map(Number);
  const days = Math.floor((Date.UTC(y, m - 1, d) - REFERENCE_EPOCH) / DAY_MS);
  return Math.floor(days / 7);
}

export function matchesRule(
  rule: AvailabilityRuleInput,
  dateStr: string,
  dayOfWeek: number,
  dayNum: number
): boolean {
  if (rule.type === "dateOverride") {
    return rule.date === dateStr;
  }

  if (rule.type === "weekly") {
    if (rule.dayOfWeek !== dayOfWeek) return false;
    const every = rule.everyNDays;
    if (every && every > 1) {
      if (weekIndex(dateStr) % every !== 0) return false;
    }
    return true;
  }

  if (rule.type === "monthly") {
    return rule.dayOfMonth === dayNum;
  }

  return false;
}