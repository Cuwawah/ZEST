"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId, getCurrentUser } from "@/lib/auth";
import { effectiveTier } from "@/lib/plan";

export { getCurrentUser };

export async function updateUser(data: {
  name?: string;
  businessName?: string;
  slug?: string;
  timezone?: string;
  bufferTime?: number;
  minNotice?: number;
  phone?: string;
  logoUrl?: string;
  accentColor?: string;
  hideBranding?: boolean;
}) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  if (data.slug && data.slug !== user.slug) {
    const existing = await prisma.user.findUnique({
      where: { slug: data.slug },
    });
    if (existing) throw new Error("This booking link is already taken");
  }

  const clean: {
    name?: string;
    businessName?: string;
    slug?: string;
    timezone?: string;
    bufferTime?: number;
    minNotice?: number;
    phone?: string | null;
    logoUrl?: string | null;
    accentColor?: string;
    hideBranding?: boolean;
  } = {};

  if (data.name !== undefined) clean.name = data.name;
  if (data.businessName !== undefined) clean.businessName = data.businessName;
  if (data.slug !== undefined) clean.slug = data.slug;
  if (data.timezone !== undefined) clean.timezone = data.timezone;
  if (data.bufferTime !== undefined) {
    const clamped = Math.min(1440, Math.max(0, Math.round(data.bufferTime)));
    clean.bufferTime = clamped;
  }
  if (data.minNotice !== undefined) {
    const clamped = Math.min(720, Math.max(1, Math.round(data.minNotice)));
    clean.minNotice = clamped;
  }
  if (data.phone !== undefined) clean.phone = data.phone.trim() || null;

  const isPro = effectiveTier(user.plan, user.trialEndsAt) === "pro";
  if (data.logoUrl !== undefined || data.accentColor !== undefined || data.hideBranding !== undefined) {
    if (!isPro) {
      throw new Error("Custom branding is a Pro feature. Upgrade to use it.");
    }
    if (data.logoUrl !== undefined) clean.logoUrl = data.logoUrl.trim() || null;
    if (data.accentColor !== undefined) {
      if (!/^#[0-9a-fA-F]{6}$/.test(data.accentColor)) {
        throw new Error("Accent color must be a hex color like #f5c518");
      }
      clean.accentColor = data.accentColor;
    }
    if (data.hideBranding !== undefined) clean.hideBranding = data.hideBranding;
  }

  return prisma.user.update({
    where: { id: user.id },
    data: clean,
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({ where: { id: userId } });
}

export async function deleteAccount() {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const eventTypeIds = (
    await prisma.eventType.findMany({
      where: { userId: user.id },
      select: { id: true },
    })
  ).map((et) => et.id);

  for (const etId of eventTypeIds) {
    await prisma.response.deleteMany({
      where: { booking: { eventTypeId: etId } },
    });
    await prisma.booking.deleteMany({ where: { eventTypeId: etId } });
    await prisma.intakeQuestion.deleteMany({ where: { eventTypeId: etId } });
    await prisma.availabilityRule.deleteMany({ where: { eventTypeId: etId } });
  }
  await prisma.eventType.deleteMany({ where: { userId: user.id } });

  await prisma.paymentTransaction.updateMany({
    where: { matchedUserId: user.id },
    data: { matchedUserId: null, status: "manual_review" },
  });

  await prisma.user.delete({ where: { id: user.id } });

  return user.id;
}
