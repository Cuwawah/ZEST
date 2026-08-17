import { SignJWT, jwtVerify } from "jose";

export const MIN_MANAGE_TOKEN_DAYS = 14;
const DAY_MS = 24 * 60 * 60 * 1000;
const PURPOSE = "booking-manage";

export interface BookingTokenPayload {
  bookingId: string;
  eventTypeId: string;
}

/**
 * Manage-link expiry: 1 day after the event start, with a 14-day floor,
 * so a booking made weeks ahead keeps a working link.
 */
export function bookingManageExpiry(
  startTime: number,
  now: number = Date.now()
): Date {
  const startPlusDay = startTime + DAY_MS;
  const floor = now + MIN_MANAGE_TOKEN_DAYS * DAY_MS;
  return new Date(Math.max(startPlusDay, floor));
}

function secretKey(secret?: string): Uint8Array {
  const s = secret || process.env.AUTH_SECRET;
  if (!s) throw new Error("AUTH_SECRET is not set");
  return new TextEncoder().encode(s);
}

export async function signBookingToken(
  bookingId: string,
  eventTypeId: string,
  expiresAt?: Date,
  secret?: string
): Promise<string> {
  return new SignJWT({ bookingId, eventTypeId, purpose: PURPOSE })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresAt ?? new Date(Date.now() + MIN_MANAGE_TOKEN_DAYS * DAY_MS))
    .sign(secretKey(secret));
}

export async function verifyBookingToken(
  token: string,
  secret?: string
): Promise<BookingTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey(secret));
    if (payload.purpose !== PURPOSE) return null;
    if (
      typeof payload.bookingId !== "string" ||
      typeof payload.eventTypeId !== "string"
    ) {
      return null;
    }
    return { bookingId: payload.bookingId, eventTypeId: payload.eventTypeId };
  } catch {
    return null;
  }
}