import { OwnListingBookingError } from '@/domain/bookings/booking.errors';
import { ApiError, ApiNetworkError } from '@/infrastructure/api/api-error';

// Traduce cualquier error del flujo de reservas a una clave de i18n legible, nunca un "Error 500" crudo
export function getBookingErrorMessageKey(error: unknown): string {
  if (error instanceof OwnListingBookingError) {
    return 'bookings.blocked.cannot_book_own_listing';
  }

  if (error instanceof ApiNetworkError) {
    return 'errors.network';
  }

  if (error instanceof ApiError) {
    if (error.reason === 'not_owner') {
      return 'bookings.blocked.cannot_book_own_listing';
    }

    if (error.status === 401 || error.status === 403) {
      return 'errors.forbidden';
    }

    return 'errors.server';
  }

  return 'errors.generic';
}
