import {
  computeClientInsights,
  computePracticeInsights,
  type ClientInput,
  type PracticeInput,
} from "./intelligence";

function assert(cond: boolean, msg: string) {
  if (!cond) {
    console.error("FAIL:", msg);
    process.exitCode = 1;
  } else {
    console.log("ok:", msg);
  }
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

// computeClientInsights: empty bookings
const emptyClient: ClientInput = {
  name: "Test",
  email: "test@example.com",
  createdAt: new Date(),
  bookings: [],
};
const emptyResult = computeClientInsights(emptyClient);
assert(emptyResult.length === 0, "empty bookings returns no insights");

// computeClientInsights: single recent booking
const recentClient: ClientInput = {
  name: "Recent",
  email: "recent@example.com",
  createdAt: daysAgo(10),
  bookings: [
    {
      startTime: daysAgo(5),
      status: "confirmed",
      responses: [],
    },
  ],
};
const recentResult = computeClientInsights(recentClient);
assert(recentResult.length > 0, "single recent booking returns insights");
assert(
  recentResult.some((i) => i.type === "loyalty"),
  "single booking has loyalty insight"
);
assert(
  recentResult.some((i) => i.type === "recency"),
  "single booking has recency insight"
);

// computeClientInsights: stale client (30+ days)
const staleClient: ClientInput = {
  name: "Stale",
  email: "stale@example.com",
  createdAt: daysAgo(60),
  bookings: [
    { startTime: daysAgo(45), status: "confirmed", responses: [] },
    { startTime: daysAgo(40), status: "confirmed", responses: [] },
  ],
};
const staleResult = computeClientInsights(staleClient);
assert(
  staleResult.some((i) => i.type === "followup"),
  "stale client has followup insight"
);
assert(
  staleResult.some((i) => i.text.includes("2 bookings")),
  "stale client shows booking count"
);

// computeClientInsights: loyal client (5+ bookings)
const loyalClient: ClientInput = {
  name: "Loyal",
  email: "loyal@example.com",
  createdAt: daysAgo(100),
  bookings: Array.from({ length: 7 }, (_, i) => ({
    startTime: daysAgo(100 - i * 14),
    status: "confirmed",
    responses: [],
  })),
};
const loyalResult = computeClientInsights(loyalClient);
assert(
  loyalResult.some((i) => i.type === "loyalty" && i.text.includes("most loyal")),
  "loyal client shows loyalty insight"
);

// computeClientInsights: frequency with 2+ bookings
const freqClient: ClientInput = {
  name: "Frequent",
  email: "freq@example.com",
  createdAt: daysAgo(60),
  bookings: [
    { startTime: daysAgo(50), status: "confirmed", responses: [] },
    { startTime: daysAgo(30), status: "confirmed", responses: [] },
    { startTime: daysAgo(10), status: "confirmed", responses: [] },
  ],
};
const freqResult = computeClientInsights(freqClient);
assert(
  freqResult.some((i) => i.type === "frequency"),
  "3 bookings shows frequency insight"
);

// computeClientInsights: intake answer changes
const changeClient: ClientInput = {
  name: "Changer",
  email: "change@example.com",
  createdAt: daysAgo(30),
  bookings: [
    {
      startTime: daysAgo(20),
      status: "confirmed",
      responses: [
        {
          answer: "I want to lose weight",
          question: { label: "Goal" },
        },
      ],
    },
    {
      startTime: daysAgo(5),
      status: "confirmed",
      responses: [
        {
          answer: "I want to build muscle",
          question: { label: "Goal" },
        },
      ],
    },
  ],
};
const changeResult = computeClientInsights(changeClient);
assert(
  changeResult.some((i) => i.type === "change"),
  "changed intake answer shows change insight"
);

// computeClientInsights: no change when answers are same
const sameClient: ClientInput = {
  name: "Same",
  email: "same@example.com",
  createdAt: daysAgo(30),
  bookings: [
    {
      startTime: daysAgo(20),
      status: "confirmed",
      responses: [
        {
          answer: "I want to lose weight",
          question: { label: "Goal" },
        },
      ],
    },
    {
      startTime: daysAgo(5),
      status: "confirmed",
      responses: [
        {
          answer: "I want to lose weight",
          question: { label: "Goal" },
        },
      ],
    },
  ],
};
const sameResult = computeClientInsights(sameClient);
assert(
  !sameResult.some((i) => i.type === "change"),
  "same intake answers shows no change insight"
);

// computeClientInsights: ignores cancelled bookings
const cancelledClient: ClientInput = {
  name: "Cancelled",
  email: "cancelled@example.com",
  createdAt: daysAgo(30),
  bookings: [
    { startTime: daysAgo(20), status: "cancelled", responses: [] },
    { startTime: daysAgo(5), status: "cancelled", responses: [] },
  ],
};
const cancelledResult = computeClientInsights(cancelledClient);
assert(
  cancelledResult.length === 0,
  "cancelled bookings return no insights"
);

// computePracticeInsights: empty data
const emptyPractice: PracticeInput = { clients: [], bookings: [] };
const emptyPracticeResult = computePracticeInsights(emptyPractice);
assert(emptyPracticeResult.length === 0, "empty practice returns no insights");

// computePracticeInsights: with stale clients
const practiceWithStale: PracticeInput = {
  clients: [
    { id: "1", name: "Active", lastBookingAt: daysAgo(5), bookingCount: 3 },
    { id: "2", name: "Stale", lastBookingAt: daysAgo(45), bookingCount: 2 },
    { id: "3", name: "Lost", lastBookingAt: daysAgo(60), bookingCount: 1 },
  ],
  bookings: [],
};
const stalePracticeResult = computePracticeInsights(practiceWithStale);
assert(
  stalePracticeResult.some((i) => i.type === "followup" && i.text.includes("2")),
  "stale practice shows followup count"
);

// computePracticeInsights: rebooking rate
const practiceWithReturning: PracticeInput = {
  clients: [
    { id: "1", name: "A", lastBookingAt: daysAgo(5), bookingCount: 3 },
    { id: "2", name: "B", lastBookingAt: daysAgo(10), bookingCount: 2 },
    { id: "3", name: "C", lastBookingAt: daysAgo(15), bookingCount: 1 },
  ],
  bookings: [],
};
const rebookResult = computePracticeInsights(practiceWithReturning);
assert(
  rebookResult.some(
    (i) => i.type === "rebooking" && i.text.includes("67%")
  ),
  "rebooking rate is calculated correctly"
);

// computePracticeInsights: seasonality
const monthBookings = Array.from({ length: 10 }, (_, i) => ({
  createdAt: daysAgo(300 - i * 10),
  startTime: daysAgo(300 - i * 10),
  status: "confirmed" as const,
  clientId: "1",
}));
// Add 5 bookings in the same month (month with most bookings)
for (let i = 0; i < 5; i++) {
  const baseDate = new Date("2026-03-10");
  baseDate.setDate(baseDate.getDate() + i * 2);
  monthBookings.push({
    createdAt: baseDate,
    startTime: baseDate,
    status: "confirmed",
    clientId: "1",
  });
}
const seasonPractice: PracticeInput = {
  clients: [
    { id: "1", name: "A", lastBookingAt: daysAgo(5), bookingCount: 15 },
  ],
  bookings: monthBookings,
};
const seasonResult = computePracticeInsights(seasonPractice);
assert(
  seasonResult.some((i) => i.type === "seasonality"),
  "multiple bookings shows seasonality insight"
);

// computePracticeInsights: new vs returning
const mixedPractice: PracticeInput = {
  clients: [
    { id: "1", name: "A", lastBookingAt: daysAgo(5), bookingCount: 3 },
    { id: "2", name: "B", lastBookingAt: daysAgo(10), bookingCount: 2 },
    { id: "3", name: "C", lastBookingAt: daysAgo(15), bookingCount: 1 },
    { id: "4", name: "D", lastBookingAt: daysAgo(20), bookingCount: 1 },
  ],
  bookings: [],
};
const mixedResult = computePracticeInsights(mixedPractice);
assert(
  mixedResult.some(
    (i) =>
      i.type === "newreturning" &&
      i.text.includes("2 returning") &&
      i.text.includes("2 first-timer")
  ),
  "new vs returning count is correct"
);

console.log("intelligence self-test complete.");
