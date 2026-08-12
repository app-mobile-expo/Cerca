import type { BookingStatus } from '@/domain/bookings/booking-status';
import { assertNever } from '@/domain/shared/assert-never';

// Mapea cada variante de BookingStatus a su clave de i18n; el switch + assertNever obliga a cubrir un estado nuevo
export function getBookingStatusLabelKey(status: BookingStatus): string {
  switch (status.kind) {
    case 'requested':
      return 'bookings.status.requested';
    case 'accepted':
      return 'bookings.status.accepted';
    case 'declined':
      return 'bookings.status.declined';
    case 'completed':
      return 'bookings.status.completed';
    case 'cancelled':
      return 'bookings.status.cancelled';
    default:
      return assertNever(status);
  }
}
