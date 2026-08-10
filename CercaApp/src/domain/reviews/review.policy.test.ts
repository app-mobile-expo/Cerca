import { describe, expect, it } from 'vitest';

import type { Booking } from '@/domain/bookings/booking';

import { canReviewBooking } from './review.policy';

const completedBooking: Booking = {
  id: 'booking-1',
  listingId: 'listing-1',
  customerId: 'user-1',
  providerId: 'user-2',
  status: { kind: 'completed', completedAt: '2026-08-01T00:00:00.000Z' },
  reviewId: null,
};

describe('canReviewBooking', () => {
  it('blocks a user who is not the customer of the booking', () => {
    const result = canReviewBooking('user-2', completedBooking, new Date('2026-08-05T00:00:00.000Z'));

    expect(result).toEqual({ ok: false, reason: 'not_your_booking' });
  });

  it('blocks reviewing a booking that is not completed yet', () => {
    const requestedBooking: Booking = {
      ...completedBooking,
      status: { kind: 'requested', requestedAt: '2026-08-01T00:00:00.000Z' },
    };

    const result = canReviewBooking('user-1', requestedBooking, new Date('2026-08-05T00:00:00.000Z'));

    expect(result).toEqual({ ok: false, reason: 'not_completed' });
  });

  it('blocks reviewing the same booking twice', () => {
    const alreadyReviewed: Booking = { ...completedBooking, reviewId: 'review-1' };

    const result = canReviewBooking('user-1', alreadyReviewed, new Date('2026-08-05T00:00:00.000Z'));

    expect(result).toEqual({ ok: false, reason: 'already_reviewed' });
  });

  it('blocks reviewing more than 30 days after completion', () => {
    const result = canReviewBooking('user-1', completedBooking, new Date('2026-09-05T00:00:00.000Z'));

    expect(result).toEqual({ ok: false, reason: 'window_closed' });
  });

  it('allows reviewing right before the 30-day window closes', () => {
    const result = canReviewBooking('user-1', completedBooking, new Date('2026-08-30T23:00:00.000Z'));

    expect(result).toEqual({ ok: true });
  });

  it('allows the customer to review a completed booking within the window', () => {
    const result = canReviewBooking('user-1', completedBooking, new Date('2026-08-05T00:00:00.000Z'));

    expect(result).toEqual({ ok: true });
  });
});
