export type BookingPolicyErrorReason = 'cannot_book_own_listing';

export type BookingPolicyResult =
  | { readonly ok: true }
  | { readonly ok: false; readonly reason: BookingPolicyErrorReason };

// Bloquea la reserva si quien la solicita es también dueño del anuncio (capa extra de booking:request)
export function canRequestBooking(actorId: string, listingOwnerId: string): BookingPolicyResult {
  if (actorId === listingOwnerId) {
    return { ok: false, reason: 'cannot_book_own_listing' };
  }
  return { ok: true };
}