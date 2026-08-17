"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

async function verifyBookingAccess(bookingId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { eventType: { include: { user: { select: { id: true } } } } },
  });
  if (!booking) throw new Error("Booking not found");
  if (booking.eventType.user.id !== userId)
    throw new Error("Not authorized");
}

async function verifyQuestionAccess(questionId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const question = await prisma.intakeQuestion.findUnique({
    where: { id: questionId },
    include: { eventType: { include: { user: { select: { id: true } } } } },
  });
  if (!question) throw new Error("Question not found");
  if (question.eventType.user.id !== userId)
    throw new Error("Not authorized");
}

export async function getResponsesByBooking(bookingId: string) {
  await verifyBookingAccess(bookingId);
  return prisma.response.findMany({
    where: { bookingId },
  });
}

export async function getResponsesByQuestion(questionId: string) {
  await verifyQuestionAccess(questionId);
  return prisma.response.findMany({
    where: { questionId },
  });
}

export async function deleteResponsesByBooking(bookingId: string) {
  await verifyBookingAccess(bookingId);
  await prisma.response.deleteMany({
    where: { bookingId },
  });
}
