import { describe, expect, it } from 'vitest';

import { ReviewBlockedError } from '@/domain/reviews/review.errors';
import { ApiError, ApiNetworkError } from '@/infrastructure/api/api-error';

import { getReviewErrorMessageKey } from './review-error-message';

describe('getReviewErrorMessageKey', () => {
  it('maps the domain "already reviewed" block to its i18n key', () => {
    expect(getReviewErrorMessageKey(new ReviewBlockedError('already_reviewed'))).toBe(
      'review.blocked.already_reviewed',
    );
  });

  it('maps the domain "window closed" block to its own i18n key, not the "already reviewed" one', () => {
    expect(getReviewErrorMessageKey(new ReviewBlockedError('window_closed'))).toBe(
      'review.blocked.window_closed',
    );
  });

  it('maps a network failure to a clear message, never a raw status code', () => {
    expect(getReviewErrorMessageKey(new ApiNetworkError())).toBe('errors.network');
  });

  it('maps a server "already_reviewed" reason to the same key as the client-side check', () => {
    expect(getReviewErrorMessageKey(new ApiError(409, 'already_reviewed'))).toBe(
      'review.blocked.already_reviewed',
    );
  });

  it('maps a bare 500 to a generic server message, never "Error 500"', () => {
    const message = getReviewErrorMessageKey(new ApiError(500));

    expect(message).toBe('errors.server');
    expect(message).not.toMatch(/500/);
  });

  it('maps 401/403 without a known reason to a forbidden message', () => {
    expect(getReviewErrorMessageKey(new ApiError(403))).toBe('errors.forbidden');
  });

  it('falls back to a generic message for anything unrecognized', () => {
    expect(getReviewErrorMessageKey(new Error('boom'))).toBe('errors.generic');
  });
});
