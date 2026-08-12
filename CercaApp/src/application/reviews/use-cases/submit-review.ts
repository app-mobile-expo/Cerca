import type { ReviewRepository } from '@/application/reviews/ports/review.repository';
import type { Booking } from '@/domain/bookings/booking';
import { ReviewBlockedError } from '@/domain/reviews/review.errors';
import { canReviewBooking } from '@/domain/reviews/review.policy';
import type { Review } from '@/domain/reviews/review';

export type SubmitReviewCommand = {
  readonly actorId: string;
  readonly booking: Booking;
  readonly rating: number;
  readonly comment: string;
  readonly now: Date;
  readonly idempotencyKey: string;
};

// Construye el caso de uso "enviar una reseña": aplica la política estrella y, si pasa, delega en el repositorio inyectado
export function createSubmitReviewUseCase(repository: ReviewRepository) {
  return async function submitReview(command: SubmitReviewCommand): Promise<Review> {
    const eligibility = canReviewBooking(command.actorId, command.booking, command.now);

    if (!eligibility.ok) {
      throw new ReviewBlockedError(eligibility.reason);
    }

    return repository.submitReview(
      command.booking.id,
      { rating: command.rating, comment: command.comment },
      command.idempotencyKey,
    );
  };
}
