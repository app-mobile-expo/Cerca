import type { Booking, BookingId, ListingId } from '@/domain/bookings/booking';

// Puerto que la capa de aplicación usa para hablar con reservas, sin saber si detrás hay HTTP, caché o un doble
export interface BookingRepository {
  requestBooking(listingId: ListingId, idempotencyKey: string): Promise<Booking>;
  getBooking(id: BookingId): Promise<Booking>;
  listBookings(role: 'customer' | 'provider'): Promise<readonly Booking[]>;
}