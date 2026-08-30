"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function getReferralStats(): Promise<{
  referralCode: string | null;
  referralCount: number;
  referralLink: string;
}> {
  const userId = await getSessionUserId();
  if (!userId) {
    return { referralCode: null, referralCount: 0, referralLink: "" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referralCode: true },
  });

  const referralCount = await prisma.user.count({
    where: { referredById: userId },
  });

  const baseUrl = process.env.APP_URL || "https://zestbook.org.ng";
  const referralLink = user?.referralCode
    ? `${baseUrl}?ref=${user.referralCode}`
    : "";

  return {
    referralCode: user?.referralCode || null,
    referralCount,
    referralLink,
  };
}
