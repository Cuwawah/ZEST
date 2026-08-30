"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import {
  computeClientInsights,
  computePracticeInsights,
  type ClientInsight,
  type PracticeInsight,
} from "@/lib/intelligence";

export async function getClientInsights(
  clientId: string
): Promise<ClientInsight[]> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId },
    include: {
      bookings: {
        where: { status: "confirmed" },
        include: {
          responses: {
            include: { question: { select: { label: true } } },
          },
        },
        orderBy: { startTime: "asc" },
      },
    },
  });

  if (!client) return [];

  return computeClientInsights({
    name: client.name,
    email: client.email,
    createdAt: client.createdAt,
    bookings: client.bookings,
  });
}

export async function getPracticeInsights(): Promise<PracticeInsight[]> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const eventTypes = await prisma.eventType.findMany({
    where: { userId },
    select: { id: true },
  });
  const eventTypeIds = eventTypes.map((et) => et.id);

  const [clients, bookings] = await Promise.all([
    prisma.client.findMany({
      where: { userId },
      include: {
        bookings: {
          where: { status: "confirmed" },
          select: { startTime: true },
          orderBy: { startTime: "desc" },
          take: 1,
        },
        _count: { select: { bookings: { where: { status: "confirmed" } } } },
      },
    }),
    prisma.booking.findMany({
      where: { eventTypeId: { in: eventTypeIds }, status: "confirmed" },
      select: {
        createdAt: true,
        startTime: true,
        status: true,
        clientId: true,
      },
    }),
  ]);

  return computePracticeInsights({
    clients: clients.map((c) => ({
      id: c.id,
      name: c.name,
      lastBookingAt: c.bookings[0]?.startTime || null,
      bookingCount: c._count.bookings,
    })),
    bookings,
  });
}
