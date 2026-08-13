import { z } from 'zod';

import type { ReviewRepository, SubmitReviewInput } from '@/application/reviews/ports/review.repository';
import type { BookingId } from '@/domain/bookings/booking';
import type { Review } from '@/domain/reviews/review';

import { httpClient } from '../http-client';

// Espejo exacto de la entidad Review del dominio, para validar lo que manda el backend antes de confiar en ello
const reviewSchema = z.object({
  id: z.string().min(1),
  bookingId: z.string().min(1),
  listingId: z.string().min(1),
  authorId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  comment: z.string(),
  createdAt: z.string(),
});

// Implementa ReviewRepository contra la API REST de Cerca: cada respuesta se valida con Zod antes de llegar a application
export class ReviewApiGateway implements ReviewRepository {
  // Envía la reseña con la Idempotency-Key para que un reintento de red no cree una segunda reseña en el servidor
  async submitReview(bookingId: BookingId, input: SubmitReviewInput, idempotencyKey: string): Promise<Review> {
    const raw = await httpClient.post(`/bookings/${bookingId}/review`, input, idempotencyKey);
    return reviewSchema.parse(raw);
  }
}

export const reviewGateway = new ReviewApiGateway();
