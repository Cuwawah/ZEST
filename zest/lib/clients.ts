import { prisma } from "@/lib/prisma";
import { PrismaClient } from "@/app/generated/prisma/client";

type PrismaTx = Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0];

export async function findOrCreateClient(
  tx: PrismaTx,
  userId: string,
  data: { name: string; email: string; phone?: string }
): Promise<string> {
  const email = data.email.trim().toLowerCase();
  const existing = await tx.client.findUnique({
    where: { userId_email: { userId, email } },
    select: { id: true, name: true },
  });
  if (existing) {
    const updates: { name?: string; phone?: string } = {};
    if (data.name && data.name !== existing.name) updates.name = data.name;
    if (data.phone) updates.phone = data.phone;
    if (Object.keys(updates).length > 0) {
      await tx.client.update({ where: { id: existing.id }, data: updates });
    }
    return existing.id;
  }
  const client = await tx.client.create({
    data: {
      userId,
      name: data.name || null,
      email,
      phone: data.phone || null,
    },
  });
  return client.id;
}

export async function backfillClients(userId: string): Promise<number> {
  const unlinked = await prisma.booking.findMany({
    where: {
      clientId: null,
      eventType: { userId },
    },
    select: { id: true, clientName: true, clientEmail: true, phone: true },
  });

  const byEmail = new Map<string, typeof unlinked>();
  for (const b of unlinked) {
    const key = b.clientEmail.trim().toLowerCase();
    if (!byEmail.has(key)) byEmail.set(key, []);
    byEmail.get(key)!.push(b);
  }

  let count = 0;
  for (const [email, bookings] of byEmail) {
    const first = bookings[0];
    const client = await prisma.client.upsert({
      where: { userId_email: { userId, email } },
      update: { name: first.clientName, phone: first.phone },
      create: {
        userId,
        name: first.clientName,
        email,
        phone: first.phone,
      },
    });
    await prisma.booking.updateMany({
      where: { id: { in: bookings.map((b) => b.id) } },
      data: { clientId: client.id },
    });
    count += bookings.length;
  }
  return count;
}
