import type { ReviewBlockedReason } from './review.policy';

// Error base de dominio para todo lo relacionado con reseñas
export class ReviewDomainError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ReviewDomainError';
  }
}

// Se lanza cuando canReviewBooking bloquea el intento; guarda el motivo exacto para mapearlo a `review.blocked.<reason>`
export class ReviewBlockedError extends ReviewDomainError {
  readonly reason: ReviewBlockedReason;

  constructor(reason: ReviewBlockedReason) {
    super(`Review blocked: ${reason}`);
    this.name = 'ReviewBlockedError';
    this.reason = reason;
  }
}
