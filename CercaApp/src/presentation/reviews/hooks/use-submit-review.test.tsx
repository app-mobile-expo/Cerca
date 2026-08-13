import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Booking } from '@/domain/bookings/booking';
import type { Review } from '@/domain/reviews/review';

// El gateway real toca expo-secure-store/react-native; se mockea para probar el hook de forma aislada
vi.mock('@/infrastructure/api/reviews/review.gateway', () => ({
  reviewGateway: {
    submitReview: vi.fn(),
  },
}));

const { reviewGateway } = await import('@/infrastructure/api/reviews/review.gateway');
const { useSubmitReview } = await import('./use-submit-review');
const { bookingKeys } = await import('@/presentation/bookings/hooks/booking-keys');

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

const submitParams = {
  actorId: 'user-1',
  booking: completedBooking,
  rating: 5,
  comment: 'Great service, on time and tidy.',
};

// Envuelve el hook en un QueryClientProvider fresco por test, sin reintentos, para que los tests sean deterministas
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  vi.mocked(reviewGateway.submitReview).mockReset();
});

describe('useSubmitReview', () => {
  it('sends only one request when submitOnce is called twice while the first is still in flight', async () => {
    let resolveRequest!: (review: Review) => void;
    const pending = new Promise<Review>((resolve) => {
      resolveRequest = resolve;
    });
    vi.mocked(reviewGateway.submitReview).mockReturnValueOnce(pending);

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const { result } = renderHook(() => useSubmitReview(), { wrapper: createWrapper(queryClient) });

    await act(async () => {
      result.current.submitOnce(submitParams);
      result.current.submitOnce(submitParams); // el "doble toque"
      await Promise.resolve();
    });

    expect(reviewGateway.submitReview).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRequest(sampleReview);
      await pending;
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(reviewGateway.submitReview).toHaveBeenCalledTimes(1);
  });

  it('sets the reviewId on the cached booking detail and invalidates every booking list on success', async () => {
    vi.mocked(reviewGateway.submitReview).mockResolvedValueOnce(sampleReview);

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    queryClient.setQueryData(bookingKeys.detail('booking-1'), completedBooking);
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useSubmitReview(), { wrapper: createWrapper(queryClient) });

    await act(async () => {
      result.current.submitOnce(submitParams);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData<Booking>(bookingKeys.detail('booking-1'))).toEqual({
      ...completedBooking,
      reviewId: 'review-1',
    });
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: bookingKeys.lists() });
  });

  it('reports isPending while the request is in flight and clears it once it settles', async () => {
    let resolveRequest!: (review: Review) => void;
    const pending = new Promise<Review>((resolve) => {
      resolveRequest = resolve;
    });
    vi.mocked(reviewGateway.submitReview).mockReturnValueOnce(pending);

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const { result } = renderHook(() => useSubmitReview(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.submitOnce(submitParams);
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    await act(async () => {
      resolveRequest(sampleReview);
      await pending;
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });
});
