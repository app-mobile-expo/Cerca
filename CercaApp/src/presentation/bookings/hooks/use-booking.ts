import { useQuery } from '@tanstack/react-query';

import { createGetBookingUseCase } from '@/application/bookings/use-cases/get-booking';
import type { BookingId } from '@/domain/bookings/booking';
import { bookingGateway } from '@/infrastructure/api/booking.gateway';

import { bookingKeys } from './booking-keys';

const getBooking = createGetBookingUseCase(bookingGateway);

// Trae el detalle de una reserva y lo mantiene fresco en caché bajo bookingKeys.detail(id)
export function useBooking(id: BookingId) {
  return useQuery({
    queryKey: bookingKeys.detail(id),
    queryFn: () => getBooking(id),
  });
}
