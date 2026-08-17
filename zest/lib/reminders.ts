import { prisma } from "@/lib/prisma";
import { sendMail, appUrl } from "@/lib/mail";
import {
  bookingManageExpiry,
  signBookingToken,
} from "@/lib/bookingTokens";
import { formatDateTimeInTz } from "@/lib/dates";

export interface ReminderCandidate {
  id: string;
  startTime: Date;
  reminderHours: number;
  reminderSentAt: Date | null;
}

export function selectBookingsForReminder(
  bookings: ReminderCandidate[],
  now: Date = new Date()
): ReminderCandidate[] {
  return bookings.filter((b) => {
    if (b.reminderSentAt) return false;
    const start = b.startTime.getTime();
    const windowStart = start - b.reminderHours * 3600000;
    return now.getTime() >= windowStart && now.getTime() < start;
  });
}

export async function sendReminders(now: Date = new Date()): Promise<{
  sent: number;
  skipped: number;
}> {
  const bookings = (await prisma.booking.findMany({
    where: { status: "confirmed", startTime: { gt: now } },
    select: {
      id: true,
      eventTypeId: true,
      clientName: true,
      clientEmail: true,
      phone: true,
      startTime: true,
      endTime: true,
      reminderSentAt: true,
      eventType: {
        select: {
          name: true,
          reminderHours: true,
          user: {
            select: {
              name: true,
              businessName: true,
              timezone: true,
            },
          },
        },
      },
    },
  })) as unknown as Array<{
    id: string;
    eventTypeId: string;
    clientName: string;
    clientEmail: string;
    phone: string | null;
    startTime: Date;
    endTime: Date;
    reminderSentAt: Date | null;
    eventType: {
      name: string;
      reminderHours: number;
      user: { name: string | null; businessName: string | null; timezone: string };
    };
  }>;

  const due = selectBookingsForReminder(
    bookings.map((b) => ({
      id: b.id,
      startTime: b.startTime,
      reminderHours: b.eventType.reminderHours,
      reminderSentAt: b.reminderSentAt,
    })),
    now
  );

  let sent = 0;
  for (const b of bookings) {
    if (!due.some((d) => d.id === b.id)) continue;
    const token = await signBookingToken(
      b.id,
      b.eventTypeId,
      bookingManageExpiry(b.startTime.getTime(), now.getTime())
    );
    const when = formatDateTimeInTz(
      b.startTime.getTime(),
      b.eventType.user.timezone
    );
    const ok = await sendMail(
      b.clientEmail,
      `Reminder: "${b.eventType.name}" ${when}`,
      [
        `Hi ${b.clientName},`,
        "",
        `This is a reminder for your upcoming booking:`,
        `Event: ${b.eventType.name}`,
        `When: ${when}`,
        b.phone ? `Your phone: ${b.phone}` : null,
        "",
        `Need to cancel or reschedule? ${appUrl()}/book/manage?t=${token}`,
        "",
        `— ${b.eventType.user.businessName || b.eventType.user.name || "Zest"}`,
      ]
        .filter((l) => l !== null)
        .join("\n")
    );
    if (ok) {
      await prisma.booking.update({
        where: { id: b.id },
        data: { reminderSentAt: now },
      });
      sent++;
    } else {
      console.error(`[reminders] mail failed for booking ${b.id}`);
    }
  }

  return { sent, skipped: due.length - sent };
}