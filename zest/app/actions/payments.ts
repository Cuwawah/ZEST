"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getSessionUserId } from "@/lib/auth";
import { pollOnce, kudaEnabled } from "@/lib/kuda/poller";
import { activateSubscription } from "@/lib/subscription";

export async function getPaymentTransactions() {
  await requireAdmin();

  return prisma.paymentTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      matchedUser: { select: { email: true, name: true } },
    },
  });
}

export async function approvePayment(
  transactionId: string,
  targetUserId: string
) {
  await requireAdmin();

  const tx = await prisma.paymentTransaction.findUnique({
    where: { id: transactionId },
  });
  if (!tx) throw new Error("Transaction not found");

  const target = await prisma.user.findUnique({
    where: { id: targetUserId },
  });
  if (!target) throw new Error("Target user not found");

  await prisma.paymentTransaction.update({
    where: { id: transactionId },
    data: { status: "activated", matchedUserId: targetUserId },
  });

  await activateSubscription(targetUserId);
  return prisma.user.findUnique({ where: { id: targetUserId } });
}

export async function rejectPayment(transactionId: string) {
  await requireAdmin();

  return prisma.paymentTransaction.update({
    where: { id: transactionId },
    data: { status: "rejected" },
  });
}

export async function checkKudaPayment(): Promise<{
  ok: boolean;
  error?: string;
  status?: string;
}> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  if (!kudaEnabled()) {
    return {
      ok: false,
      error:
        "Automatic payment checking is not enabled. Contact support to confirm your payment.",
    };
  }

  try {
    await pollOnce();
    const latest = await prisma.paymentTransaction.findFirst({
      where: { matchedUserId: userId },
      orderBy: { createdAt: "desc" },
      select: { status: true },
    });
    return { ok: true, status: latest?.status };
  } catch (err) {
    return {
      ok: false,
      error: (err as Error).message || "Payment check failed. Try again.",
    };
  }
}