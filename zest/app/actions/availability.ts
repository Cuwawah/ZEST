"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import {
  formatTimeInTz,
  zonedDateString,
  zonedTimestamp,
} from "@/lib/dates";
import { matchesRule } from "@/lib/availabilityRules";
import { spotsLeftFor } from "@/lib/capacity";

function parseDateStr(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split("-").map(Number);
  return { year: y, month: m, day: d };
}

function addDays(year: number, month: number, day: number, days: number) {
  const dt = new Date(Date.UTC(year, month - 1, day + days, 12));
  return {
    year: dt.getUTCFullYear(),
    month: dt.getUTCMonth() + 1,
    day: dt.getUTCDate(),
  };
}

export async function saveAvailability(
  eventTypeId: string,
  rules: Array<{
    type: string;
    dayOfWeek?: number;
    date?: string;
    everyNDays?: number;
    dayOfMonth?: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>
) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: { user: { select: { id: true } } },
  });
  if (!eventType || eventType.user.id !== userId)
    throw new Error("Not authorized");

  await prisma.availabilityRule.deleteMany({
    where: { eventTypeId },
  });

  for (const rule of rules) {
    await prisma.availabilityRule.create({
      data: {
        ...rule,
        eventTypeId,
      },
    });
  }
}

export async function getAvailability(eventTypeId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: { user: { select: { id: true } } },
  });
  if (!eventType || eventType.user.id !== userId)
    throw new Error("Not authorized");

  return prisma.availabilityRule.findMany({
    where: { eventTypeId },
  });
}

export async function getAvailableSlots(
  eventTypeId: string,
  startDate: string,
  endDate: string
) {
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
    include: {
      user: { select: { bufferTime: true, minNotice: true, timezone: true } },
    },
  });
  if (!eventType) throw new Error("Event type not found");

  const tz = eventType.user.timezone || "Africa/Lagos";

  const rules = await prisma.availabilityRule.findMany({
    where: { eventTypeId },
  });

  const bookings = await prisma.booking.findMany({
    where: { eventTypeId, status: "confirmed" },
  });

  const bufferMs = eventType.user.bufferTime * 60000;
  const minNoticeMs = eventType.user.minNotice * 3600000;
  const now = Date.now();
  const capacity = Math.max(1, eventType.capacity || 1);

  const slots: {
    date: string;
    time: string;
    timestamp: number;
    spotsLeft: number;
  }[] = [];
  const start = parseDateStr(startDate);
  const end = parseDateStr(endDate);
  const durationMs = eventType.duration * 60000;

  let d = addDays(start.year, start.month, start.day, 0);
  while (
    d.year < end.year ||
    (d.year === end.year &&
      (d.month < end.month || (d.month === end.month && d.day <= end.day)))
  ) {
    const dateStr = `${d.year}-${String(d.month).padStart(2, "0")}-${String(
      d.day
    ).padStart(2, "0")}`;
    const dayOfWeek = new Date(Date.UTC(d.year, d.month - 1, d.day)).getUTCDay();

    const dayRules = rules.filter((r) =>
      matchesRule(r, dateStr, dayOfWeek, d.day)
    );

    for (const rule of dayRules) {
      if (!rule.isAvailable) continue;

      const slotStart = zonedTimestamp(tz, dateStr, rule.startTime);
      const slotEnd = zonedTimestamp(tz, dateStr, rule.endTime);

      let current = slotStart;
      while (current < slotEnd) {
        const slotEndTime = current + durationMs;
        if (slotEndTime <= slotEnd) {
          const timestamp = current;

          if (timestamp - now < minNoticeMs) {
            current = slotEndTime;
            continue;
          }

          const spotsLeft = spotsLeftFor(
            timestamp,
            timestamp + durationMs,
            bufferMs,
            bookings.map((b) => ({
              startTime: b.startTime.getTime(),
              endTime: b.endTime.getTime(),
            })),
            capacity
          );

          if (spotsLeft > 0) {
            slots.push({
              date: zonedDateString(timestamp, tz),
              time: formatTimeInTz(timestamp, tz),
              timestamp,
              spotsLeft,
            });
          }
        }
        current = slotEndTime;
      }
    }

    d = addDays(d.year, d.month, d.day, 1);
  }

  return slots;
}
