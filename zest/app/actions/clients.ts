"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { backfillClients } from "@/lib/clients";

export async function getClients(search?: string): Promise<
  Array<{
    id: string;
    name: string | null;
    email: string;
    phone: string | null;
    createdAt: Date;
    bookingCount: number;
    lastBookingAt: Date | null;
    tags: Array<{ id: string; name: string; color: string }>;
  }>
> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const where: Record<string, unknown> = { userId };
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];
  }

  const clients = await prisma.client.findMany({
    where,
    include: {
      bookings: {
        select: { startTime: true },
        orderBy: { startTime: "desc" },
        take: 1,
      },
      _count: { select: { bookings: true } },
      tags: {
        include: { tag: { select: { id: true, name: true, color: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt,
    bookingCount: c._count.bookings,
    lastBookingAt: c.bookings[0]?.startTime || null,
    tags: c.tags.map((ct) => ct.tag),
  }));
}

export async function getClientById(clientId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId },
    include: {
      bookings: {
        include: {
          eventType: { select: { name: true, slug: true } },
          responses: {
            include: { question: { select: { label: true, type: true } } },
          },
        },
        orderBy: { startTime: "desc" },
      },
      tags: {
        include: { tag: { select: { id: true, name: true, color: true } } },
      },
    },
  });

  if (!client) return null;

  return {
    ...client,
    tags: client.tags.map((ct) => ct.tag),
  };
}

export async function getClientPublicInfo(clientId: string) {
  const client = await prisma.client.findUnique({
    where: { id: clientId },
    select: { name: true, email: true, phone: true },
  });
  return client;
}

export async function runBackfill(): Promise<{ linked: number }> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");
  const linked = await backfillClients(userId);
  return { linked };
}
