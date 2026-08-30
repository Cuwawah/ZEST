"use server";

import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export async function getTags() {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  return prisma.clientTag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export async function createTag(name: string, color: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const trimmed = name.trim();
  if (!trimmed) throw new Error("Tag name is required");

  return prisma.clientTag.create({
    data: { userId, name: trimmed, color },
  });
}

export async function deleteTag(tagId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const tag = await prisma.clientTag.findFirst({
    where: { id: tagId, userId },
  });
  if (!tag) throw new Error("Tag not found");

  await prisma.clientTagAssignment.deleteMany({ where: { tagId } });
  await prisma.clientTag.delete({ where: { id: tagId } });
}

export async function assignTag(clientId: string, tagId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId },
  });
  if (!client) throw new Error("Client not found");

  const tag = await prisma.clientTag.findFirst({
    where: { id: tagId, userId },
  });
  if (!tag) throw new Error("Tag not found");

  await prisma.clientTagAssignment.upsert({
    where: { clientId_tagId: { clientId, tagId } },
    create: { clientId, tagId },
    update: {},
  });
}

export async function removeTag(clientId: string, tagId: string) {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const client = await prisma.client.findFirst({
    where: { id: clientId, userId },
  });
  if (!client) throw new Error("Client not found");

  await prisma.clientTagAssignment.deleteMany({
    where: { clientId, tagId },
  });
}
