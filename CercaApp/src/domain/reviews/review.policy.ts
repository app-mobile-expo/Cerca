import type { Booking } from '@/domain/bookings/booking';

export type ReviewBlockedReason =
  | 'not_your_booking'
  | 'not_completed'
  | 'already_reviewed'
  | 'window_closed';

export type ReviewEligibility =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: ReviewBlockedReason };

// Número de días tras completarse una reserva durante los que todavía se puede reseñar
export const REVIEW_WINDOW_DAYS = 30;

// Cuenta los días transcurridos entre una fecha ISO y `now`; pura, para que la ventana de tiempo se pueda testear sin relojes reales
function daysBetween(fromIso: string, now: Date): number {
  const fromMs = new Date(fromIso).getTime();
  return (now.getTime() - fromMs) / (1000 * 60 * 60 * 24);
}

// La función estrella: aplica relación, estado, unicidad y plazo, en ese orden, y devuelve el motivo exacto si bloquea
export function canReviewBooking(actorId: string, booking: Booking, now: Date): ReviewEligibility {
  if (booking.customerId !== actorId) {
    return { ok: false, reason: 'not_your_booking' };
  }
  if (booking.status.kind !== 'completed') {
    return { ok: false, reason: 'not_completed' };
  }
  if (booking.reviewId !== null) {
    return { ok: false, reason: 'already_reviewed' };
  }
  if (daysBetween(booking.status.completedAt, now) > REVIEW_WINDOW_DAYS) {
    return { ok: false, reason: 'window_closed' };
  }
  return { ok: true };
}
