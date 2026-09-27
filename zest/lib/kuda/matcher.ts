import { prisma } from "@/lib/prisma";
import type { ParsedKudaEmail } from "./parser";
import { matchAgainstCandidates } from "./match";
import type { MatchCandidate, MatchResult } from "./match";

export { matchAgainstCandidates, normalizeTerm } from "./match";
export type { MatchCandidate, MatchResult } from "./match";

export async function matchPendingOrders(
  email: ParsedKudaEmail
): Promise<MatchResult> {
  const candidates: MatchCandidate[] = await prisma.user.findMany({
    where: { plan: { in: ["inactive", "free"] } },
    select: {
      id: true,
      email: true,
      name: true,
      paymentRef: true,
      paymentAmountKobo: true,
    },
    take: 500,
  });

  return matchAgainstCandidates(email, candidates);
}
