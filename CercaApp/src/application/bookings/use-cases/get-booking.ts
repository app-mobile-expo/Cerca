import type { BookingRepository } from '@/application/bookings/ports/booking.repository';
import type { Booking, BookingId } from '@/domain/bookings/booking';

// Construye el caso de uso "ver detalle de reserva", delegando la obtención en el repositorio inyectado
export function createGetBookingUseCase(repository: BookingRepository) {
  return function getBooking(id: BookingId): Promise<Booking> {
    return repository.getBooking(id);
  };
}
