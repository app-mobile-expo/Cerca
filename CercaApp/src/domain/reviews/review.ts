export type ReviewId = string;

// Entidad de una reseña ya enviada por un cliente sobre una reserva completada
export interface Review {
  readonly id: ReviewId;
  readonly bookingId: string;
  readonly listingId: string;
  readonly authorId: string;
  readonly rating: number;
  readonly comment: string;
  readonly createdAt: string;
}
