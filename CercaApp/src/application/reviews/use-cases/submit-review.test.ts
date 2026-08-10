import { describe, expect, it, vi } from 'vitest';

import type { ReviewRepository } from '@/application/reviews/ports/review.repository';
import type { Booking } from '@/domain/bookings/booking';
import { ReviewBlockedError } from '@/domain/reviews/review.errors';
import type { Review } from '@/domain/reviews/review';

import { createSubmitReviewUseCase } from './submit-review';

const completedBooking: Booking = {
  id: 'booking-1',
  listingId: 'listing-1',
  customerId: 'user-1',
  providerId: 'user-2',
  status: { kind: 'completed', completedAt: '2026-08-01T00:00:00.000Z' },
  reviewId: null,
};

const sampleReview: Review = {
  id: 'review-1',
  bookingId: 'booking-1',
  listingId: 'listing-1',
  authorId: 'user-1',
  rating: 5,
  comment: 'Great service, on time and tidy.',
  createdAt: '2026-08-05T00:00:00.000Z',
};

// Repositorio falso en memoria, para probar el caso de uso sin tocar red ni React
function createFakeRepository(): ReviewRepository {
  return {
    submitReview: vi.fn().mockResolvedValue(sampleReview),
  };
}

describe('createSubmitReviewUseCase', () => {
  it('rejects a review that already exists without touching the repository', async () => {
    const repository = createFakeRepository();
    const submitReview = createSubmitReviewUseCase(repository);
    const alreadyReviewed: Booking = { ...completedBooking, reviewId: 'review-existing' };

    const attempt = submitReview({
      actorId: 'user-1',
      booking: alreadyReviewed,
      rating: 5,
      comment: 'Great service, on time and tidy.',
      now: new Date('2026-08-05T00:00:00.000Z'),
      idempotencyKey: 'key-1',
    });

    await expect(attempt).rejects.toBeInstanceOf(ReviewBlockedError);
    await expect(attempt).rejects.toMatchObject({ reason: 'already_reviewed' });
    expect(repository.submitReview).not.toHaveBeenCalled();
  });

  it('rejects a review outside the 30-day window without touching the repository', async () => {
    const repository = createFakeRepository();
    const submitReview = createSubmitReviewUseCase(repository);

    const attempt = submitReview({
      actorId: 'user-1',
      booking: completedBooking,
      rating: 5,
      comment: 'Great service, on time and tidy.',
      now: new Date('2026-09-05T00:00:00.000Z'),
      idempotencyKey: 'key-1',
    });

    await expect(attempt).rejects.toMatchObject({ reason: 'window_closed' });
    expect(repository.submitReview).not.toHaveBeenCalled();
  });

  it('forwards the rating, comment and idempotency key to the repository when eligible', async () => {
    const repository = createFakeRepository();
    const submitReview = createSubmitReviewUseCase(repository);

    const review = await submitReview({
      actorId: 'user-1',
      booking: completedBooking,
      rating: 5,
      comment: 'Great service, on time and tidy.',
      now: new Date('2026-08-05T00:00:00.000Z'),
      idempotencyKey: 'key-1',
    });

    expect(review).toEqual(sampleReview);
    expect(repository.submitReview).toHaveBeenCalledWith(
      'booking-1',
      { rating: 5, comment: 'Great service, on time and tidy.' },
      'key-1',
    );
  });
});
