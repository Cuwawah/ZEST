"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function saveQuestions(
  eventTypeId: string,
  questions: Array<{
    order: number;
    type: string;
    label: string;
    required: boolean;
    options?: string[];
  }>
) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
  });
  if (!eventType) throw new Error("Event type not found");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || eventType.userId !== user.id)
    throw new Error("Not authorized");

  await prisma.intakeQuestion.deleteMany({
    where: { eventTypeId },
  });

  const questionIds: string[] = [];
  for (const question of questions) {
    const q = await prisma.intakeQuestion.create({
      data: {
        eventTypeId,
        order: question.order,
        type: question.type,
        label: question.label,
        required: question.required,
        options: question.options ? JSON.stringify(question.options) : null,
      },
    });
    questionIds.push(q.id);
  }

  return questionIds;
}

export async function getQuestions(eventTypeId: string) {
  return prisma.intakeQuestion.findMany({
    where: { eventTypeId },
    orderBy: { order: "asc" },
  });
}

export async function getPublicQuestions(eventTypeId: string) {
  const eventType = await prisma.eventType.findUnique({
    where: { id: eventTypeId },
  });
  if (!eventType || !eventType.isActive) return [];

  return prisma.intakeQuestion.findMany({
    where: { eventTypeId },
    orderBy: { order: "asc" },
  });
}

export async function updateQuestion(
  id: string,
  data: {
    order?: number;
    type?: string;
    label?: string;
    required?: boolean;
    options?: string[];
  }
) {
  const question = await prisma.intakeQuestion.findUnique({
    where: { id },
    include: { eventType: { select: { userId: true } } },
  });
  if (!question) throw new Error("Question not found");

  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || question.eventType.userId !== user.id)
    throw new Error("Not authorized");

  return prisma.intakeQuestion.update({
    where: { id },
    data: {
      ...data,
      options: data.options ? JSON.stringify(data.options) : undefined,
    },
  });
}

export async function deleteQuestion(id: string) {
  const question = await prisma.intakeQuestion.findUnique({
    where: { id },
    include: { eventType: { select: { userId: true } } },
  });
  if (!question) throw new Error("Question not found");

  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || question.eventType.userId !== user.id)
    throw new Error("Not authorized");

  await prisma.intakeQuestion.delete({ where: { id } });
}
