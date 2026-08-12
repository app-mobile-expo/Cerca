import type { BookingRepository } from '@/application/bookings/ports/booking.repository';
import type { Booking, ListingId } from '@/domain/bookings/booking';
import { OwnListingBookingError } from '@/domain/bookings/booking.errors';
import { canRequestBooking } from '@/domain/bookings/booking.policy';

export type RequestBookingInput = {
  readonly actorId: string;
  readonly listingId: ListingId;
  readonly listingOwnerId: string;
  readonly idempotencyKey: string;
};

// Construye el caso de uso "solicitar reserva": aplica la política de dominio y delega en el repositorio inyectado
export function createRequestBookingUseCase(repository: BookingRepository) {
  return async function requestBooking(input: RequestBookingInput): Promise<Booking> {
    const eligibility = canRequestBooking(input.actorId, input.listingOwnerId);

    if (!eligibility.ok) {
      throw new OwnListingBookingError();
    }

    return repository.requestBooking(input.listingId, input.idempotencyKey);
  };
}
