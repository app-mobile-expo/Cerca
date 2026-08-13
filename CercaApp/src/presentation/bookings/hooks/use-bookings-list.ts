import { useQuery } from '@tanstack/react-query';

import { createListBookingsUseCase } from '@/application/bookings/use-cases/list-bookings';
import { bookingGateway } from '@/infrastructure/api/bookings/booking.gateway';

import { bookingKeys } from './booking-keys';

const listBookings = createListBookingsUseCase(bookingGateway);

// Trae mis reservas del lado indicado (cliente o proveedor) para las listas de "mis reservas"
export function useBookingsList(role: 'customer' | 'provider') {
  return useQuery({
    queryKey: bookingKeys.list(role),
    queryFn: () => listBookings(role),
  });
}
