"use server";

import { prisma } from "@/lib/prisma";
import {
  createSession,
  destroySession,
  getSessionUserId,
  hashPassword,
  verifyPassword,
  createResetToken,
  verifyResetToken,
} from "@/lib/auth";
import { sendMail, appUrl } from "@/lib/mail";
import { trialEndsAtFor, generatePaymentAmountKobo, TRIAL_DAYS } from "@/lib/plan";
import { generateReferralCode, referralRewardMs, computeReferralTrialEnds } from "@/lib/referrals";

function isAdminEmail(email: string): boolean {
  return email === (process.env.ADMIN_EMAIL || "cuwawah@gmail.com");
}

export async function signup(data: {
  name: string;
  email: string;
  password: string;
  referralCode?: string;
}): Promise<{ error?: string }> {
  const email = data.email.trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return { error: "Please enter a valid email address" };
  }
  if (!data.password || data.password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with this email already exists" };

  let slug = email
    .split("@")[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "")
    .slice(0, 30);
  if (!slug) slug = "user";

  try {
    const slugTaken = await prisma.user.findUnique({ where: { slug } });
    if (slugTaken) {
      slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
    }
  } catch (err) {
    console.error("signup db error:", err);
    return {
      error: "Could not reach the database. Please wait a moment and try again.",
    };
  }

  const passwordHash = await hashPassword(data.password);

  let paymentAmountKobo: number | null = null;
  for (let i = 0; i < 10; i++) {
    const candidate = generatePaymentAmountKobo();
    const taken = await prisma.user.findFirst({
      where: { paymentAmountKobo: candidate },
      select: { id: true },
    });
    if (!taken) {
      paymentAmountKobo = candidate;
      break;
    }
  }

  let newReferralCode: string | null = null;
  for (let i = 0; i < 10; i++) {
    const candidate = generateReferralCode();
    const taken = await prisma.user.findUnique({
      where: { referralCode: candidate },
      select: { id: true },
    });
    if (!taken) {
      newReferralCode = candidate;
      break;
    }
  }

  let referredById: string | null = null;
  if (data.referralCode) {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: data.referralCode },
      select: { id: true },
    });
    if (referrer) {
      referredById = referrer.id;
    }
  }

  try {
    const user = await prisma.user.create({
      data: {
        email,
        name: data.name.trim() || null,
        slug,
        passwordHash,
        plan: isAdminEmail(email) ? "active" : "free",
        trialEndsAt: isAdminEmail(email) ? null : trialEndsAtFor(new Date()),
        paymentRef: `ZEST-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        paymentAmountKobo,
        timezone: "Africa/Lagos",
        bufferTime: 0,
        minNotice: 24,
        referralCode: newReferralCode,
        referredById,
      },
    });

    if (referredById) {
      const now = new Date();
      const rewardMsVal = referralRewardMs();

      const referrer = await prisma.user.findUnique({
        where: { id: referredById },
        select: { trialEndsAt: true },
      });

      const newTrialEnds = computeReferralTrialEnds(
        referrer?.trialEndsAt,
        rewardMsVal,
        now
      );

      await prisma.user.update({
        where: { id: referredById },
        data: { trialEndsAt: newTrialEnds },
      });

      await prisma.user.update({
        where: { id: user.id },
        data: { trialEndsAt: new Date(now.getTime() + rewardMsVal) },
      });
    }

    await createSession(user.id);
    return {};
  } catch (err) {
    console.error("signup db error:", err);
    return {
      error: "Could not reach the database. Please wait a moment and try again.",
    };
  }
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<{ error?: string }> {
  const email = data.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user?.passwordHash) return { error: "Invalid email or password" };

  const ok = await verifyPassword(data.password, user.passwordHash);
  if (!ok) return { error: "Invalid email or password" };

  await createSession(user.id);
  return {};
}

export async function signOut(): Promise<void> {
  await destroySession();
}

export async function changePassword(data: {
  currentPassword: string;
  newPassword: string;
}): Promise<{ error?: string }> {
  const userId = await getSessionUserId();
  if (!userId) return { error: "Not authenticated" };

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.passwordHash) return { error: "User not found" };

  if (!data.newPassword || data.newPassword.length < 8) {
    return { error: "New password must be at least 8 characters" };
  }

  const ok = await verifyPassword(data.currentPassword, user.passwordHash);
  if (!ok) return { error: "Current password is incorrect" };

  const passwordHash = await hashPassword(data.newPassword);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return {};
}

export async function requestPasswordReset(data: {
  email: string;
}): Promise<{ ok: boolean }> {
  const email = data.email.trim().toLowerCase();
  if (!email || !/^\S+@\S+\.\S+$/.test(email)) return { ok: true };

  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.passwordHash) {
    const token = await createResetToken(user.id);
    const link = `${appUrl()}/reset-password?token=${encodeURIComponent(token)}`;
    await sendMail(
      email,
      "Reset your Zest password",
      [
        "Hi,",
        "",
        `We received a request to reset your Zest password.`,
        "",
        `Open this link to choose a new password (valid for 30 minutes):`,
        "",
        link,
        "",
        "If you didn't request this, you can safely ignore this email.",
        "",
        "— Zest",
      ].join("\n")
    );
  }
  return { ok: true };
}

export async function resetPassword(data: {
  token: string;
  password: string;
}): Promise<{ error?: string }> {
  if (!data.password) return { error: "Password is required" };
  if (data.password.length < 8) {
    return { error: "Password must be at least 8 characters" };
  }

  const userId = await verifyResetToken(data.token);
  if (!userId) return { error: "This reset link is invalid or has expired" };

  const passwordHash = await hashPassword(data.password);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash },
  });

  return {};
}
