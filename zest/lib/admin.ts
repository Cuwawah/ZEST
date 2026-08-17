import { prisma } from "@/lib/prisma";
import { getSessionUserId } from "@/lib/auth";

export const ADMIN_EMAIL =
  process.env.KUDA_ADMIN_EMAIL || "cuwawah@gmail.com";

export async function requireAdmin(): Promise<void> {
  const userId = await getSessionUserId();
  if (!userId) throw new Error("Not authenticated");

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.email !== ADMIN_EMAIL) throw new Error("Not authorized");
}