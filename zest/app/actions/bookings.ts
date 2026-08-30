"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { Prisma } from "@/app/generated/prisma/client";
import { canAcceptBookings } from "@/lib/plan";
import { sendMail, appUrl } from "@/lib/mail";
import { formatDateTimeInTz } from "@/lib/dates";
import {
  bookingManageExpiry,
  signBookingToken,
  verifyBookingToken,
} from "@/lib/bookingTokens";
import { overlaps } from "@/lib/capacity";
import { findOrCreateClient } from "@/lib/clients";

async function verifyBookingOwner(bookingId: string): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { eventType: { select: { userId: true } } },
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.eventType.userId !== userId) throw new Error("Not authorized");
}

export async function createBooking(data: {
  eventTypeId: string;
  clientName: string;
  clientEmail: string;
  phone?: string;
  startTime: number;
  endTime: number;
  responses: Array<{ questionId: string; answer: string }>;
}) {
  const eventType = await prisma.eventType.findUnique({
    where: { id: data.eventTypeId },
    include: {
      user: {
        select: {
          bufferTime: true,
          minNotice: true,
          plan: true,
          trialEndsAt: true,
          email: true,
          name: true,
          businessName: true,
          timezone: true,
        },
      },
    },
  });
  if (!eventType) throw new Error("Event type not found");
  if (!canAcceptBookings(eventType.user.plan, eventType.user.trialEndsAt)) throw new Error("This account is inactive. The owner needs an active subscription to accept bookings.");

  const start = new Date(data.startTime);
  const end = new Date(data.endTime);

  const minNoticeMs = eventType.user.minNotice * 3600000;
  if (start.getTime() - Date.now() < minNoticeMs) {
    throw new Error("This time slot requires more advance notice");
  }

  const bufferMs = eventType.user.bufferTime * 60000;
  const capacity = Math.max(1, eventType.capacity || 1);

  return prisma.$transaction(
    async (tx) => {
      const booked = await tx.booking.findMany({
        where: {
          eventTypeId: data.eventTypeId,
          status: "confirmed",
          startTime: { lt: end },
          endTime: { gt: new Date(start.getTime() - bufferMs) },
        },
      });

      const used = booked.filter((b) =>
        overlaps(
          start.getTime(),
          end.getTime(),
          bufferMs,
          {
            startTime: b.startTime.getTime(),
            endTime: b.endTime.getTime(),
          }
        )
      ).length;

      if (used >= capacity)
        throw new Error("This time slot is no longer available");

      const clientId = await findOrCreateClient(tx, eventType.userId, {
        name: data.clientName,
        email: data.clientEmail,
        phone: data.phone,
      });

      const booking = await tx.booking.create({
        data: {
          eventTypeId: data.eventTypeId,
          clientId,
          clientName: data.clientName,
          clientEmail: data.clientEmail,
          phone: data.phone || null,
          startTime: start,
          endTime: end,
          status: "confirmed",
        },
      });

      for (const response of data.responses) {
        await tx.response.create({
          data: {
            bookingId: booking.id,
            questionId: response.questionId,
            answer: response.answer,
          },
        });
      }

      return booking.id;
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  ).then(async (bookingId) => {
    const when = formatDateTimeInTz(
      start.getTime(),
      eventType.user.timezone
    );
    const manageToken = await signBookingToken(
      bookingId,
      data.eventTypeId,
      bookingManageExpiry(start.getTime())
    );
    const manageLink = `${appUrl()}/book/manage?t=${manageToken}`;
    await sendMail(
      data.clientEmail,
      `Booking confirmed: "${eventType.name}"`,
      [
        `Hi ${data.clientName},`,
        "",
        `You're booked for "${eventType.name}".`,
        `When: ${when}`,
        data.phone ? `Your phone: ${data.phone}` : null,
        "",
        `Need to cancel or reschedule? ${manageLink}`,
        "",
        `— ${eventType.user.businessName || eventType.user.name || "Zest"}`,
      ]
        .filter((l) => l !== null)
        .join("\n")
    );
    await sendMail(
      eventType.user.email,
      `New booking for "${eventType.name}"`,
      [
        `Hi ${eventType.user.name || eventType.user.businessName || "there"},`,
        "",
        `${data.clientName} booked "${eventType.name}".`,
        `When: ${when}`,
        data.phone ? `Phone: ${data.phone}` : null,
        `Email: ${data.clientEmail}`,
        "",
        `Manage it in your dashboard: ${appUrl()}/dashboard`,
        "",
        "— Zest",
      ]
        .filter((l) => l !== null)
        .join("\n")
    );
    return bookingId;
  });
}

export async function getBookingsByEventType(eventTypeId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
  });
  if (!eventType || eventType.userId !== userId)
    throw new Error("Not authorized");

  return prisma.booking.findMany({
    where: { eventTypeId, status: "confirmed" },
    orderBy: { startTime: "desc" },
  });
}

export async function getUpcomingBookings() {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) return [];

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user.id },
  });

  const eventTypeIds = eventTypes.map((et) => et.id);
  const now = new Date();

  const bookings = await prisma.booking.findMany({
    where: {
      eventTypeId: { in: eventTypeIds },
      status: "confirmed",
      startTime: { gt: now },
    },
    include: {
      eventType: { select: { name: true } },
    },
    orderBy: { startTime: "asc" },
  });

  return bookings;
}

export async function getBookingWithResponses(bookingId: string) {
  await verifyBookingOwner(bookingId);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  });
  if (!booking) return null;

  const responses = await prisma.response.findMany({
    where: { bookingId },
    include: {
      question: { select: { label: true, type: true } },
    },
  });

  return { ...booking, responses };
}

export async function updateBookingNotes(
  bookingId: string,
  notes: string
): Promise<void> {
  await verifyBookingOwner(bookingId);
  await prisma.booking.update({
    where: { id: bookingId },
    data: { notes: notes || null },
  });
}

export async function cancelBooking(bookingId: string) {
  await verifyBookingOwner(bookingId);

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      eventType: {
        select: {
          name: true,
          userId: true,
          user: {
            select: { email: true, name: true, businessName: true, timezone: true },
          },
        },
      },
    },
  });
  if (!booking) throw new Error("Booking not found");

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { status: "cancelled" },
  });

  const when = formatDateTimeInTz(
    booking.startTime.getTime(),
    booking.eventType.user.timezone
  );
  await sendMail(
    booking.eventType.user.email,
    `Booking cancelled: "${booking.eventType.name}"`,
    [
      `Hi ${booking.eventType.user.name || booking.eventType.user.businessName || "there"},`,
      "",
      `${booking.clientName}'s booking for "${booking.eventType.name}" was cancelled.`,
      `It was scheduled for: ${when}`,
      "",
      "— Zest",
    ].join("\n")
  );

  return updated;
}

async function loadTokenBooking(token: string) {
  const payload = await verifyBookingToken(token);
  if (!payload) throw new Error("This link is invalid or has expired");

  const booking = await prisma.booking.findUnique({
    where: { id: payload.bookingId },
    include: {
      eventType: {
        select: {
          id: true,
          name: true,
          slug: true,
          duration: true,
          capacity: true,
          user: {
            select: {
              email: true,
              bufferTime: true,
              minNotice: true,
              name: true,
              businessName: true,
              timezone: true,
            },
          },
        },
      },
    },
  });
  if (!booking) throw new Error("Booking not found");
  return { booking, eventType: booking.eventType };
}

export async function getBookingByToken(token: string) {
  const { booking, eventType } = await loadTokenBooking(token);

  return {
    id: booking.id,
    clientId: booking.clientId,
    clientName: booking.clientName,
    clientEmail: booking.clientEmail,
    phone: booking.phone,
    startTime: booking.startTime,
    endTime: booking.endTime,
    status: booking.status,
    eventType: {
      id: eventType.id,
      name: eventType.name,
      slug: eventType.slug,
      duration: eventType.duration,
      timezone: eventType.user.timezone,
      owner: eventType.user.businessName || eventType.user.name || "Zest",
    },
    manageLink: `${appUrl()}/book/manage?t=${await signBookingToken(
      booking.id,
      eventType.id,
      bookingManageExpiry(booking.startTime.getTime())
    )}`,
  };
}

export async function cancelClientBooking(token: string) {
  const { booking, eventType } = await loadTokenBooking(token);
  if (booking.status !== "confirmed")
    throw new Error("This booking is no longer active");

  const now = Date.now();
  if (now >= booking.startTime.getTime())
    throw new Error("This booking has already started");

  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "cancelled", cancelledAt: new Date() },
  });

  const when = formatDateTimeInTz(
    booking.startTime.getTime(),
    eventType.user.timezone
  );
  await sendMail(
    booking.clientEmail,
    `Booking cancelled: "${eventType.name}"`,
    [
      `Hi ${booking.clientName},`,
      "",
      `Your booking for "${eventType.name}" has been cancelled.`,
      `It was scheduled for: ${when}`,
      "",
      "— Zest",
    ].join("\n")
  );
  await sendMail(
    eventType.user.email,
    `Booking cancelled: "${eventType.name}"`,
    [
      `Hi ${eventType.user.name || eventType.user.businessName || "there"},`,
      "",
      `${booking.clientName}'s booking for "${eventType.name}" was cancelled.`,
      `It was scheduled for: ${when}`,
      "",
      "— Zest",
    ].join("\n")
  );

  return { ok: true };
}

export async function rescheduleBooking(
  token: string,
  startTime: number
) {
  const { booking, eventType } = await loadTokenBooking(token);
  if (booking.status !== "confirmed")
    throw new Error("This booking is no longer active");

  const start = new Date(startTime);
  const end = new Date(start.getTime() + eventType.duration * 60000);

  const minNoticeMs = eventType.user.minNotice * 3600000;
  if (start.getTime() - Date.now() < minNoticeMs) {
    throw new Error("This time slot requires more advance notice");
  }

  const bufferMs = eventType.user.bufferTime * 60000;
  const capacity = Math.max(1, eventType.capacity || 1);

  await prisma.$transaction(
    async (tx) => {
      const booked = await tx.booking.findMany({
        where: {
          eventTypeId: eventType.id,
          status: "confirmed",
          NOT: { id: booking.id },
          startTime: { lt: end },
          endTime: { gt: new Date(start.getTime() - bufferMs) },
        },
      });

      const used = booked.filter((b) =>
        overlaps(
          start.getTime(),
          end.getTime(),
          bufferMs,
          {
            startTime: b.startTime.getTime(),
            endTime: b.endTime.getTime(),
          }
        )
      ).length;

      if (used >= capacity)
        throw new Error("This time slot is no longer available");

      await tx.booking.update({
        where: { id: booking.id },
        data: { startTime: start, endTime: end },
      });
    },
    { isolationLevel: Prisma.TransactionIsolationLevel.Serializable }
  );

  const when = formatDateTimeInTz(start.getTime(), eventType.user.timezone);
  await sendMail(
    booking.clientEmail,
    `Booking rescheduled: "${eventType.name}"`,
    [
      `Hi ${booking.clientName},`,
      "",
      `Your booking for "${eventType.name}" has been moved.`,
      `New time: ${when}`,
      "",
      `Manage it here: ${appUrl()}/book/manage?t=${await signBookingToken(
        booking.id,
        eventType.id,
        bookingManageExpiry(start.getTime())
      )}`,
      "",
      "— Zest",
    ].join("\n")
  );
  await sendMail(
    eventType.user.email,
    `Booking rescheduled: "${eventType.name}"`,
    [
      `Hi ${eventType.user.name || eventType.user.businessName || "there"},`,
      "",
      `${booking.clientName}'s booking for "${eventType.name}" was moved.`,
      `New time: ${when}`,
      "",
      "— Zest",
    ].join("\n")
  );

  return { ok: true };
}
