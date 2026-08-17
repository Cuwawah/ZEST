"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";
import { ADMIN_EMAIL, requireAdmin } from "@/lib/admin";
import {
  kudaAccountNumber,
  kudaAccountName,
  kudaBankName,
  PRICE,
  PRICE_LABEL,
} from "@/lib/plan";
import { activateSubscription } from "@/lib/subscription";

export async function isAdmin() {
  const userId = await getSessionUserId();
  if (!userId) return false;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user?.email === ADMIN_EMAIL;
}

export async function getCurrentUserPlan() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      plan: true,
      email: true,
      paymentRef: true,
      paymentAmountKobo: true,
      trialEndsAt: true,
      planExpiresAt: true,
      renewalNoticeDismissedAt: true,
      phone: true,
    },
  });
  return user;
}

export async function getBillingDetails() {
  const userId = await getSessionUserId();
  if (!userId) return null;

  return {
    accountNumber: kudaAccountNumber(),
    accountName: kudaAccountName(),
    bankName: kudaBankName(),
    price: PRICE,
    priceLabel: PRICE_LABEL,
  };
}

export async function getAllUsers() {
  await requireAdmin();

  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      trialEndsAt: true,
      paymentRef: true,
      paymentAmountKobo: true,
      createdAt: true,
      slug: true,
    },
  });
}

export async function activateUser(email: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  await activateSubscription(user.id);
  return prisma.user.findUnique({ where: { id: user.id } });
}

export async function deactivateUser(email: string) {
  await requireAdmin();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("User not found");

  return prisma.user.update({
    where: { email },
    data: { plan: "inactive", trialEndsAt: null },
  });
}

export async function searchUsers(query: string) {
  await requireAdmin();

  return prisma.user.findMany({
    where: {
      OR: [
        { email: { contains: query, mode: "insensitive" } },
        { name: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      plan: true,
      trialEndsAt: true,
      paymentRef: true,
      paymentAmountKobo: true,
      createdAt: true,
      slug: true,
    },
  });
}

export async function getPendingUsers() {
  await requireAdmin();

  return prisma.user.findMany({
    where: { plan: "inactive", NOT: { trialEndsAt: { gt: new Date() } } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      email: true,
      name: true,
      paymentRef: true,
      paymentAmountKobo: true,
      createdAt: true,
    },
  });
}
