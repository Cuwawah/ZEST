"use server";

import { prisma } from "@/lib/prisma";
import { effectiveTier } from "@/lib/plan";

export interface UserProfile {
  name: string | null;
  businessName: string | null;
  bio: string | null;
  website: string | null;
  socialLinks: string | null;
  coverImage: string | null;
  logoUrl: string | null;
  accentColor: string | null;
  hideBranding: boolean;
  phone: string | null;
  slug: string;
}

export interface ProfileEventType {
  id: string;
  name: string;
  description: string | null;
  duration: number;
  slug: string;
  views: number;
}

export async function getUserProfile(profileSlug: string): Promise<{
  user: UserProfile;
  eventTypes: ProfileEventType[];
} | null> {
  const user = await prisma.user.findUnique({
    where: { profileSlug },
  });

  if (!user) return null;

  const tier = effectiveTier(user.plan, user.trialEndsAt);
  if (tier !== "pro") return null;

  const eventTypes = await prisma.eventType.findMany({
    where: { userId: user.id, isActive: true },
    select: {
      id: true,
      name: true,
      description: true,
      duration: true,
      slug: true,
      views: true,
    },
    orderBy: { createdAt: "asc" },
  });

  return {
    user: {
      name: user.name,
      businessName: user.businessName,
      bio: user.bio,
      website: user.website,
      socialLinks: user.socialLinks,
      coverImage: user.coverImage,
      logoUrl: user.logoUrl,
      accentColor: user.accentColor,
      hideBranding: user.hideBranding,
      phone: user.phone,
      slug: user.slug,
    },
    eventTypes,
  };
}

export async function getAllProfileSlugs(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      profileSlug: { not: null },
    },
    select: { profileSlug: true },
  });

  return users
    .map((u) => u.profileSlug)
    .filter((s): s is string => s !== null);
}
