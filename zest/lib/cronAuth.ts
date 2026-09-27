export const CRON_SECRET_HEADER = "x-kuda-secret";

export type CronAuthResult =
  | { ok: true }
  | { ok: false; status: 401 | 503; error: string };

/**
 * Guard for the scheduled-job endpoints (/api/kuda/poll, /api/reminders,
 * /api/renewals). These mutate data and send mail, so they must never run
 * for an unauthenticated caller.
 *
 * Fails closed in two cases that previously failed open:
 *
 * 1. When the secret is missing or blank it returns 503 without running the
 *    job. The old `if (secret && ...)` skipped the check entirely in that
 *    case and let anyone trigger a sweep.
 * 2. There is no header-based bypass. The old `x-vercel-cron: 1` escape
 *    hatch was spoofable by any client, so it made the endpoints public
 *    even when the secret was correctly configured. The Netlify functions
 *    in netlify/functions/ send the secret, so it is never needed.
 *
 * The secret is injectable so tests do not depend on the local .env.
 */
export function checkCronAuth(
  headers: { get(name: string): string | null },
  secret: string | undefined = process.env.KUDA_POLL_SECRET
): CronAuthResult {
  const expected = secret?.trim();
  if (!expected) {
    return {
      ok: false,
      status: 503,
      error: "cron auth is not configured",
    };
  }

  if (headers.get(CRON_SECRET_HEADER)?.trim() !== expected) {
    return { ok: false, status: 401, error: "unauthorized" };
  }

  return { ok: true };
}
