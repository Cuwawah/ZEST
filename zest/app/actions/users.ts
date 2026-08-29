"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId, getCurrentUser } from "@/lib/auth";
import { effectiveTier } from "@/lib/plan";

export { getCurrentUser };

const BLOCKED_PROFILE_SLUGS = [
  "blog", "book", "dashboard", "api", "auth", "payment", "privacy",
  "terms", "tutorial", "admin", "favicon.ico", "sitemap.xml", "robots.txt",
  "signup", "login", "settings", "profile",
];

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
  profileSlug?: string;
  bio?: string;
  website?: string;
  socialLinks?: string;
  coverImage?: string;
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

  if (data.profileSlug !== undefined && data.profileSlug !== user.profileSlug) {
    const raw = data.profileSlug.trim().toLowerCase();
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(raw)) {
      throw new Error("Profile URL can only contain lowercase letters, numbers, and hyphens. It must start and end with a letter or number.");
    }
    if (raw.length < 2 || raw.length > 50) {
      throw new Error("Profile URL must be between 2 and 50 characters.");
    }
    if (BLOCKED_PROFILE_SLUGS.includes(raw)) {
      throw new Error("This URL is reserved. Please choose a different one.");
    }
    const existing = await prisma.user.findUnique({
      where: { profileSlug: raw },
    });
    if (existing) throw new Error("This business page URL is already taken. Please choose another.");
    data.profileSlug = raw;
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
    profileSlug?: string | null;
    bio?: string | null;
    website?: string | null;
    socialLinks?: string | null;
    coverImage?: string | null;
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

  if (data.profileSlug !== undefined) {
    if (!isPro) {
      throw new Error("Business page is a Pro feature. Upgrade to use it.");
    }
    clean.profileSlug = data.profileSlug ? data.profileSlug.trim().toLowerCase() : null;
  }
  if (data.bio !== undefined) {
    if (!isPro) {
      throw new Error("Business page is a Pro feature. Upgrade to use it.");
    }
    clean.bio = data.bio.trim() || null;
  }
  if (data.website !== undefined) {
    if (!isPro) {
      throw new Error("Business page is a Pro feature. Upgrade to use it.");
    }
    clean.website = data.website.trim() || null;
  }
  if (data.socialLinks !== undefined) {
    if (!isPro) {
      throw new Error("Business page is a Pro feature. Upgrade to use it.");
    }
    clean.socialLinks = data.socialLinks.trim() || null;
  }
  if (data.coverImage !== undefined) {
    if (!isPro) {
      throw new Error("Business page is a Pro feature. Upgrade to use it.");
    }
    clean.coverImage = data.coverImage.trim() || null;
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
