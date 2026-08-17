export interface CapacityBooking {
  startTime: number;
  endTime: number;
}

export function overlaps(
  slotStart: number,
  slotEnd: number,
  bufferMs: number,
  booking: CapacityBooking
): boolean {
  return booking.startTime < slotEnd && booking.endTime > slotStart - bufferMs;
}

export function spotsLeftFor(
  slotStart: number,
  slotEnd: number,
  bufferMs: number,
  bookings: CapacityBooking[],
  capacity: number
): number {
  const used = bookings.filter((b) =>
    overlaps(slotStart, slotEnd, bufferMs, b)
  ).length;
  return Math.max(0, capacity - used);
}