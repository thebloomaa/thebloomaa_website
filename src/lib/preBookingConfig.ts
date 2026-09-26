// Pre-booking configuration and lock timer
// 12:00 AM Midnight IST tonight (26-27 Sept transition) = 2026-09-26T18:30:00.000Z
export const PRE_BOOKING_OPENS_AT =
  process.env.NEXT_PUBLIC_PRE_BOOKING_START_TIME || '2026-09-26T18:30:00.000Z';

export function isPreBookingLocked(_targetTimeIso?: string): boolean {
  return false;
}

export function getPreBookingTimeRemaining(_targetTimeIso?: string) {
  return {
    diff: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLocked: false,
    formattedTime: 'Open Now',
  };
}
