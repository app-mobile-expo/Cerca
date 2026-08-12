import type { BookingId } from '@/domain/bookings/booking';
import type { Review } from '@/domain/reviews/review';

export type SubmitReviewInput = {
  readonly rating: number;
  readonly comment: string;
};

// Puerto que la capa de aplicación usa para hablar con reseñas, sin saber si detrás hay HTTP, caché o un doble
export interface ReviewRepository {
  submitReview(bookingId: BookingId, input: SubmitReviewInput, idempotencyKey: string): Promise<Review>;
}
