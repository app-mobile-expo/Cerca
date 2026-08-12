import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRef } from 'react';

import { createSubmitReviewUseCase } from '@/application/reviews/use-cases/submit-review';
import type { Booking } from '@/domain/bookings/booking';
import type { Review } from '@/domain/reviews/review';
import { reviewGateway } from '@/infrastructure/api/review.gateway';
import { generateIdempotencyKey } from '@/infrastructure/utils/idempotency-key';
import { bookingKeys } from '@/presentation/bookings/hooks/booking-keys';

const submitReview = createSubmitReviewUseCase(reviewGateway);

export type SubmitReviewParams = {
  readonly actorId: string;
  readonly booking: Booking;
  readonly rating: number;
  readonly comment: string;
};

// Envía una reseña con una mutación de React Query: el mismo lock por referencia de useRequestBooking evita el doble envío
export function useSubmitReview() {
  const queryClient = useQueryClient();
  const isSubmittingRef = useRef(false);

  const mutation = useMutation({
    mutationFn: (params: SubmitReviewParams): Promise<Review> => {
      const idempotencyKey = generateIdempotencyKey();
      return submitReview({ ...params, now: new Date(), idempotencyKey });
    },
    onSuccess: (review, params) => {
      queryClient.setQueryData<Booking>(bookingKeys.detail(params.booking.id), (booking) =>
        booking ? { ...booking, reviewId: review.id } : booking,
      );
      queryClient.invalidateQueries({ queryKey: bookingKeys.lists() });
    },
    onSettled: () => {
      isSubmittingRef.current = false;
    },
  });

  // Punto de entrada único desde la UI: ignora toques repetidos mientras ya hay un envío en curso
  function submitOnce(params: SubmitReviewParams): void {
    if (isSubmittingRef.current || mutation.isPending) {
      return;
    }

    isSubmittingRef.current = true;
    mutation.mutate(params);
  }

  return {
    submitOnce,
    isPending: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
