import { prisma } from "@/lib/prisma";
import { PRICE_KOBO } from "@/lib/plan";
import type { ParsedKudaEmail } from "./parser";

export interface MatchResult {
  status: "matched" | "manual_review" | "unmatched";
  matchedUserId: string | null;
  refMatch: string | null;
  reason: string;
}

export interface MatchCandidate {
  id: string;
  email: string | null;
  name: string | null;
  paymentRef: string | null;
  paymentAmountKobo: number | null;
}

export function normalizeTerm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9@.]/g, "")
    .trim();
}

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

export function matchAgainstCandidates(
  email: ParsedKudaEmail,
  candidates: MatchCandidate[]
): MatchResult {
  if (email.amountKobo === null) {
    return {
      status: "unmatched",
      matchedUserId: null,
      refMatch: null,
      reason: "no_amount_to_match",
    };
  }

  const byAmount = candidates.filter(
    (c) => c.paymentAmountKobo === email.amountKobo
  );

  if (byAmount.length === 1) {
    return {
      status: "matched",
      matchedUserId: byAmount[0].id,
      refMatch: null,
      reason: "unique_amount_match",
    };
  }

  if (byAmount.length > 1) {
    return {
      status: "manual_review",
      matchedUserId: null,
      refMatch: null,
      reason: "multiple_amount_matches",
    };
  }

  const expected = parseInt(
    process.env.KUDA_EXPECTED_AMOUNT_KOBO || `${PRICE_KOBO}`,
    10
  );

  if (email.amountKobo !== expected) {
    return {
      status: "unmatched",
      matchedUserId: null,
      refMatch: null,
      reason: "amount_does_not_match_expected",
    };
  }

  const narration = email.narration ? normalizeTerm(email.narration) : "";

  if (!narration) {
    if (candidates.length === 0) {
      return {
        status: "unmatched",
        matchedUserId: null,
        refMatch: null,
        reason: "no_pending_orders",
      };
    }
    return {
      status: "manual_review",
      matchedUserId: null,
      refMatch: null,
      reason: "amount_matches_no_reference",
    };
  }

  const byRef = candidates.filter((u) =>
    [u.email, u.paymentRef].some(
      (t) => t && t.length > 0 && narration.includes(normalizeTerm(t))
    )
  );

  if (byRef.length === 1) {
    return {
      status: "matched",
      matchedUserId: byRef[0].id,
      refMatch: narration,
      reason:
        byRef[0].paymentRef &&
        narration.includes(normalizeTerm(byRef[0].paymentRef))
          ? "payment_reference_match"
          : "narration_email_match",
    };
  }

  if (byRef.length > 1) {
    return {
      status: "manual_review",
      matchedUserId: null,
      refMatch: narration,
      reason: "multiple_reference_matches",
    };
  }

  return {
    status: "manual_review",
    matchedUserId: null,
    refMatch: null,
    reason: "amount_matches_no_reference",
  };
}
