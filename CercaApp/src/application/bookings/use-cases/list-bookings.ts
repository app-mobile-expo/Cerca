import type { BookingRepository } from '@/application/bookings/ports/booking.repository';
import type { Booking } from '@/domain/bookings/booking';

// Construye el caso de uso "listar mis reservas" según el rol en la relación (cliente o proveedor)
export function createListBookingsUseCase(repository: BookingRepository) {
  return function listBookings(role: 'customer' | 'provider'): Promise<readonly Booking[]> {
    return repository.listBookings(role);
  };
}
