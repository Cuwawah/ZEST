"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function dismissRenewalNotice() {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.user.update({
    where: { id: userId },
    data: { renewalNoticeDismissedAt: new Date() },
  });
}
