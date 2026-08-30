"use server";

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import {
  canAcceptBookings,
  effectiveTier,
  FREE_EVENT_TYPES_LIMIT,
} from "@/lib/plan";

async function uniqueSlug(base: string, excludeId?: string): Promise<string> {
  let slug = base || "event";
  let exists = await prisma.eventType.findFirst({
    where: { slug, id: excludeId ? { not: excludeId } : undefined },
    select: { id: true },
  });
  let i = 2;
  while (exists) {
    slug = `${base}-${i}`;
    exists = await prisma.eventType.findFirst({
      where: { slug, id: excludeId ? { not: excludeId } : undefined },
      select: { id: true },
    });
    i++;
  }
  return slug;
}

export async function createEventType(data: {
  name: string;
  description?: string;
  duration: number;
  slug: string;
  isActive: boolean;
  capacity?: number;
  reminderHours?: number;
  availability?: Array<{
    type: string;
    dayOfWeek?: number;
    date?: string;
    everyNDays?: number;
    dayOfMonth?: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
  questions?: Array<{
    order: number;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
  }>;
}) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) throw new Error("User not found");

  if (effectiveTier(user.plan, user.trialEndsAt) === "free") {
    const count = await prisma.eventType.count({ where: { userId: user.id } });
    if (count >= FREE_EVENT_TYPES_LIMIT) {
      throw new Error(
        `The free plan includes ${FREE_EVENT_TYPES_LIMIT} event type. Upgrade to Pro for unlimited event types.`
      );
    }
  }

  const slug = await uniqueSlug(data.slug || "event");

  return prisma.$transaction(async (tx) => {
    const eventType = await tx.eventType.create({
      data: {
        name: data.name,
        description: data.description,
        duration: data.duration,
        slug,
        isActive: data.isActive,
        userId: user.id,
      },
    });

    if (data.availability && data.availability.length > 0) {
      for (const rule of data.availability) {
        await tx.availabilityRule.create({
          data: { ...rule, eventTypeId: eventType.id },
        });
      }
    }

    if (data.questions && data.questions.length > 0) {
      for (const question of data.questions) {
        await tx.intakeQuestion.create({
          data: {
            eventTypeId: eventType.id,
            order: question.order,
            type: question.type,
            label: question.label,
            required: question.required,
            options: question.options ? JSON.stringify(question.options) : null,
          },
        });
      }
    }

    return eventType;
  });
}

export async function getMyEventTypes() {
  const userId = await getSessionUserId();
  if (!userId) return [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) return [];

  return prisma.eventType.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { bookings: true } } },
  });
}

export async function getEventTypeById(id: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const eventType = await prisma.eventType.findUnique({ where: { id } });
  if (!eventType) throw new Error("Event type not found");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || eventType.userId !== user.id)
    throw new Error("Not authorized");

  return eventType;
}

export async function getEventTypeBySlug(slug: string) {
  const eventType = await prisma.eventType.findFirst({
    where: { slug, isActive: true },
  });
  if (!eventType) return null;

  const user = await prisma.user.findUnique({
    where: { id: eventType.userId },
  });

  if (!user || !canAcceptBookings(user.plan, user.trialEndsAt)) return null;

  return {
    ...eventType,
    views: eventType.views,
    businessName: user.businessName,
    timezone: user.timezone,
    phone: user.phone,
    logoUrl: user.logoUrl,
    accentColor: user.accentColor,
    hideBranding: user.hideBranding,
    referralCode: user.referralCode,
  };
}

export async function recordEventTypeView(slug: string): Promise<boolean> {
  const eventType = await prisma.eventType.findFirst({
    where: { slug, isActive: true },
  });
  if (!eventType) return false;

  const user = await prisma.user.findUnique({
    where: { id: eventType.userId },
  });
  if (!user || !canAcceptBookings(user.plan, user.trialEndsAt)) return false;

  const userId = await getSessionUserId();
  if (userId === eventType.userId) return false;

  const cookieStore = await cookies();
  const cookieName = `zest_v_${slug.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
  if (cookieStore.get(cookieName)) return false;

  await prisma.eventType.update({
    where: { id: eventType.id },
    data: { views: { increment: 1 } },
  });

  cookieStore.set(cookieName, "1", {
    maxAge: 60 * 60 * 24,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });

  return true;
}

export async function updateEventType(
  id: string,
  data: {
    name?: string;
    description?: string;
    duration?: number;
    slug?: string;
    isActive?: boolean;
  }
) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const eventType = await prisma.eventType.findUnique({ where: { id } });
  if (!eventType) throw new Error("Event type not found");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || eventType.userId !== user.id)
    throw new Error("Not authorized");

  if (data.slug && data.slug !== eventType.slug) {
    data.slug = await uniqueSlug(data.slug, id);
  }

  return prisma.eventType.update({ where: { id }, data });
}

export async function updateEventTypeFull(
  id: string,
  data: {
    name?: string;
    description?: string;
    duration?: number;
    slug?: string;
    isActive?: boolean;
    capacity?: number;
    reminderHours?: number;
    availability?: Array<{
      type: string;
      dayOfWeek?: number;
      date?: string;
      everyNDays?: number;
      dayOfMonth?: number;
      startTime: string;
      endTime: string;
      isAvailable: boolean;
    }>;
    questions?: Array<{
      order: number;
      type: string;
      label: string;
      required: boolean;
      options?: string[];
    }>;
  }
) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const eventType = await prisma.eventType.findUnique({ where: { id } });
  if (!eventType) throw new Error("Event type not found");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || eventType.userId !== user.id)
    throw new Error("Not authorized");

  if (data.slug && data.slug !== eventType.slug) {
    data.slug = await uniqueSlug(data.slug, id);
  }

  return prisma.$transaction(async (tx) => {
    const { availability, questions, ...rest } = data;
    await tx.eventType.update({ where: { id }, data: rest });

    if (availability) {
      await tx.availabilityRule.deleteMany({ where: { eventTypeId: id } });
      if (availability.length > 0) {
        await tx.availabilityRule.createMany({
          data: availability.map((rule) => ({
            ...rule,
            eventTypeId: id,
          })),
        });
      }
    }

    if (questions) {
      await tx.intakeQuestion.deleteMany({ where: { eventTypeId: id } });
      if (questions.length > 0) {
        await tx.intakeQuestion.createMany({
          data: questions.map((question) => ({
            eventTypeId: id,
            order: question.order,
            type: question.type,
            label: question.label,
            required: question.required,
            options: question.options
              ? JSON.stringify(question.options)
              : null,
          })),
        });
      }
    }

    return id;
  });
}

export async function deleteEventType(id: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const eventType = await prisma.eventType.findUnique({ where: { id } });
  if (!eventType) throw new Error("Event type not found");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || eventType.userId !== user.id)
    throw new Error("Not authorized");

  const confirmedBookings = await prisma.booking.findMany({
    where: { eventTypeId: id, status: "confirmed" },
  });
  if (confirmedBookings.length > 0)
    throw new Error("Cannot delete event type with existing bookings");

  await prisma.response.deleteMany({
    where: { booking: { eventTypeId: id } },
  });
  await prisma.booking.deleteMany({ where: { eventTypeId: id } });
  await prisma.intakeQuestion.deleteMany({ where: { eventTypeId: id } });
  await prisma.availabilityRule.deleteMany({ where: { eventTypeId: id } });
  await prisma.eventType.delete({ where: { id } });
  return id;
}
