import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { createRequestBookingUseCase } from '@/application/bookings/use-cases/request-booking';
import type { Booking, ListingId } from '@/domain/bookings/booking';
import { bookingGateway } from '@/infrastructure/api/bookings/booking.gateway';
import { generateIdempotencyKey } from '@/infrastructure/utils/idempotency-key';

import { bookingKeys } from './booking-keys';

const requestBooking = createRequestBookingUseCase(bookingGateway);

export type RequestBookingParams = {
  readonly actorId: string;
  readonly listingId: ListingId;
  readonly listingOwnerId: string;
};

// Solicita una reserva con una mutación de React Query: un lock por referencia impide que un doble toque
// dispare dos peticiones, y el éxito invalida el detalle nuevo y todas las listas de reservas afectadas
export function useRequestBooking() {
  const queryClient = useQueryClient();
  const isSubmittingRef = useRef(false);

  const mutation = useMutation({
    mutationFn: (params: RequestBookingParams): Promise<Booking> => {
      const idempotencyKey = generateIdempotencyKey();
      return requestBooking({ ...params, idempotencyKey });
    },
    onSuccess: (booking) => {
      queryClient.setQueryData(bookingKeys.detail(booking.id), booking);
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
    onSettled: () => {
      isSubmittingRef.current = false;
    },
  });

  // Punto de entrada único desde la UI: ignora toques repetidos mientras ya hay una solicitud en curso
  function requestOnce(params: RequestBookingParams): void {
    if (isSubmittingRef.current || mutation.isPending) {
      return;
    }

    isSubmittingRef.current = true;
    mutation.mutate(params);
  }

  return {
    requestOnce,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
