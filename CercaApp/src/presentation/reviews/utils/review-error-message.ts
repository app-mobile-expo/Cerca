import { ReviewBlockedError } from '@/domain/reviews/review.errors';
import type { ReviewBlockedReason } from '@/domain/reviews/review.policy';
import { ApiError, ApiNetworkError } from '@/infrastructure/api/api-error';

const REVIEW_BLOCKED_REASONS: readonly ReviewBlockedReason[] = [
  'not_your_booking',
  'not_completed',
  'already_reviewed',
  'window_closed',
];

// Comprueba en tiempo de ejecución que un `reason` de red coincide con un motivo que la política de dominio conoce
function isReviewBlockedReason(reason: string | undefined): reason is ReviewBlockedReason {
  return REVIEW_BLOCKED_REASONS.includes(reason as ReviewBlockedReason);
}

// Traduce cualquier error del flujo de reseñas a la clave `review.blocked.<reason>`, tal como pide Cerca.md
export function getReviewErrorMessageKey(error: unknown): string {
  if (error instanceof ReviewBlockedError) {
    return `review.blocked.${error.reason}`;
  }

  if (error instanceof ApiNetworkError) {
    return 'errors.network';
  }

  if (error instanceof ApiError) {
    if (isReviewBlockedReason(error.reason)) {
      return `review.blocked.${error.reason}`;
    }

    if (error.status === 401 || error.status === 403) {
      return 'errors.forbidden';
    }

    return 'errors.server';
  }

  return 'errors.generic';
}
