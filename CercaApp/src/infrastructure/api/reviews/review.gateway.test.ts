import { describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

// http-client toca expo-secure-store y react-native; se mockea para probar solo la validación del gateway
vi.mock('../http-client', () => ({
  httpClient: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const { httpClient } = await import('../http-client');
const { ReviewApiGateway } = await import('./review.gateway');

const validReviewResponse = {
  id: 'review-1',
  bookingId: 'booking-1',
  listingId: 'listing-1',
  authorId: 'user-1',
  rating: 5,
  comment: 'Great service, on time and tidy.',
  createdAt: '2026-08-05T00:00:00.000Z',
};

describe('ReviewApiGateway', () => {
  it('parses a valid response into a Review and sends the Idempotency-Key', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce(validReviewResponse);
    const gateway = new ReviewApiGateway();

    const review = await gateway.submitReview(
      'booking-1',
      { rating: 5, comment: 'Great service, on time and tidy.' },
      'idem-key-1',
    );

    expect(review).toEqual(validReviewResponse);
    expect(httpClient.post).toHaveBeenCalledWith(
      '/bookings/booking-1/review',
      { rating: 5, comment: 'Great service, on time and tidy.' },
      'idem-key-1',
    );
  });

  it('throws instead of returning a malformed response to the application layer', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({
      id: 'review-1',
      // faltan campos requeridos: bookingId, listingId, authorId, rating, comment, createdAt
    });
    const gateway = new ReviewApiGateway();

    await expect(
      gateway.submitReview('booking-1', { rating: 5, comment: 'Great service.' }, 'idem-key-1'),
    ).rejects.toBeInstanceOf(ZodError);
  });

  it('rejects a rating outside the 1-5 range the domain accepts', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce({ ...validReviewResponse, rating: 7 });
    const gateway = new ReviewApiGateway();

    await expect(
      gateway.submitReview('booking-1', { rating: 5, comment: 'Great service.' }, 'idem-key-1'),
    ).rejects.toBeInstanceOf(ZodError);
  });
});
