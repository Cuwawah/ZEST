export interface ClientInsight {
  type: "recency" | "loyalty" | "frequency" | "change" | "followup";
  icon: string;
  text: string;
  priority: number;
}

export interface PracticeInsight {
  type: "followup" | "rebooking" | "seasonality" | "newreturning";
  icon: string;
  text: string;
  detail?: string;
  priority: number;
}

interface BookingData {
  startTime: Date;
  status: string;
  responses: Array<{
    answer: string;
    question: { label: string };
  }>;
}

interface ClientInput {
  name: string | null;
  email: string;
  createdAt: Date;
  bookings: BookingData[];
}

interface PracticeInput {
  clients: Array<{
    id: string;
    name: string | null;
    lastBookingAt: Date | null;
    bookingCount: number;
  }>;
  bookings: Array<{
    createdAt: Date;
    startTime: Date;
    status: string;
    clientId: string | null;
  }>;
}

function daysBetween(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

function formatDays(days: number): string {
  if (days < 1) return "today";
  if (days === 1) return "1 day";
  if (days < 7) return `${Math.round(days)} days`;
  const weeks = Math.round(days / 7);
  if (weeks === 1) return "1 week";
  if (weeks < 5) return `${weeks} weeks`;
  const months = Math.round(days / 30);
  if (months === 1) return "1 month";
  return `${months} months`;
}

export function computeClientInsights(client: ClientInput): ClientInsight[] {
  const insights: ClientInsight[] = [];
  const now = new Date();
  const confirmed = client.bookings.filter((b) => b.status === "confirmed");
  const sorted = [...confirmed].sort(
    (a, b) => a.startTime.getTime() - b.startTime.getTime()
  );

  if (sorted.length === 0) return insights;

  const lastBooking = sorted[sorted.length - 1];
  const daysSinceLast = daysBetween(now, lastBooking.startTime);

  if (daysSinceLast > 30) {
    insights.push({
      type: "followup",
      icon: "📣",
      text: `No booking in ${formatDays(daysSinceLast)} — consider reaching out`,
      priority: 100,
    });
  } else if (daysSinceLast > 14) {
    insights.push({
      type: "recency",
      icon: "🕐",
      text: `Last booked ${formatDays(daysSinceLast)} ago`,
      priority: 50,
    });
  } else {
    insights.push({
      type: "recency",
      icon: "🕐",
      text: `Booked ${formatDays(daysSinceLast)} ago`,
      priority: 10,
    });
  }

  if (sorted.length >= 5) {
    insights.push({
      type: "loyalty",
      icon: "⭐",
      text: `${sorted.length} bookings — one of your most loyal clients`,
      priority: 70,
    });
  } else {
    insights.push({
      type: "loyalty",
      icon: "📋",
      text: `${sorted.length} booking${sorted.length !== 1 ? "s" : ""} total`,
      priority: 20,
    });
  }

  if (sorted.length >= 2) {
    const gaps: number[] = [];
    for (let i = 1; i < sorted.length; i++) {
      gaps.push(daysBetween(sorted[i].startTime, sorted[i - 1].startTime));
    }
    const avgGap = gaps.reduce((a, b) => a + b, 0) / gaps.length;
    if (avgGap >= 1) {
      insights.push({
        type: "frequency",
        icon: "🔁",
        text: `Books every ~${formatDays(avgGap)} on average`,
        priority: 30,
      });
    }
  }

  if (sorted.length >= 2) {
    const questionAnswers = new Map<string, string[]>();
    for (const booking of sorted) {
      for (const r of booking.responses) {
        const key = r.question.label;
        if (!questionAnswers.has(key)) questionAnswers.set(key, []);
        questionAnswers.get(key)!.push(r.answer);
      }
    }

    for (const [label, answers] of questionAnswers) {
      if (answers.length >= 2) {
        const first = answers[0].toLowerCase().trim();
        const last = answers[answers.length - 1].toLowerCase().trim();
        if (first !== last && last.length > 0) {
          insights.push({
            type: "change",
            icon: "📝",
            text: `Answers changed: "${label}" shifted from "${answers[0]}" to "${answers[answers.length - 1]}"`,
            priority: 60,
          });
          break;
        }
      }
    }
  }

  return insights.sort((a, b) => b.priority - a.priority);
}

export function computePracticeInsights(input: PracticeInput): PracticeInsight[] {
  const insights: PracticeInsight[] = [];
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const staleClients = input.clients.filter(
    (c) => c.lastBookingAt && c.lastBookingAt < thirtyDaysAgo
  );
  if (staleClients.length > 0) {
    const names = staleClients
      .slice(0, 3)
      .map((c) => c.name || "Unnamed")
      .join(", ");
    const suffix =
      staleClients.length > 3
        ? ` and ${staleClients.length - 3} more`
        : "";
    insights.push({
      type: "followup",
      icon: "📣",
      text: `${staleClients.length} client${staleClients.length !== 1 ? "s" : ""} need follow-up`,
      detail: `${names}${suffix} — no booking in 30+ days`,
      priority: 100,
    });
  }

  const confirmedClients = input.clients.filter((c) => c.bookingCount > 0);
  if (confirmedClients.length > 0) {
    const returning = confirmedClients.filter((c) => c.bookingCount > 1).length;
    const rate = Math.round((returning / confirmedClients.length) * 100);
    insights.push({
      type: "rebooking",
      icon: "🔁",
      text: `${rate}% of your clients book again`,
      detail: `${returning} of ${confirmedClients.length} clients have booked more than once`,
      priority: 60,
    });
  }

  if (input.bookings.length >= 3) {
    const monthCounts = new Map<string, number>();
    for (const b of input.bookings) {
      const d = new Date(b.startTime);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
    }

    let busiestKey = "";
    let busiestCount = 0;
    for (const [key, count] of monthCounts) {
      if (count > busiestCount) {
        busiestCount = count;
        busiestKey = key;
      }
    }

    if (busiestKey) {
      const [year, month] = busiestKey.split("-");
      const monthName = new Date(Number(year), Number(month) - 1).toLocaleDateString("en-US", { month: "long" });
      const pct = Math.round((busiestCount / input.bookings.length) * 100);
      insights.push({
        type: "seasonality",
        icon: "📅",
        text: `Your busiest month is ${monthName} — ${pct}% of bookings came then`,
        priority: 40,
      });
    }
  }

  const firstTimers = input.clients.filter((c) => c.bookingCount === 1).length;
  const returningCount = input.clients.filter((c) => c.bookingCount > 1).length;
  if (input.clients.length > 0) {
    insights.push({
      type: "newreturning",
      icon: "👥",
      text: `${returningCount} returning client${returningCount !== 1 ? "s" : ""}, ${firstTimers} first-timer${firstTimers !== 1 ? "s" : ""}`,
      priority: 30,
    });
  }

  return insights.sort((a, b) => b.priority - a.priority);
}
