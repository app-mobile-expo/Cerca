import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Booking } from '@/domain/bookings/booking';

// El gateway real toca expo-secure-store/react-native; se mockea para probar el hook de forma aislada
vi.mock('@/infrastructure/api/booking.gateway', () => ({
  bookingGateway: {
    requestBooking: vi.fn(),
    getBooking: vi.fn(),
    listBookings: vi.fn(),
  },
}));

const { bookingGateway } = await import('@/infrastructure/api/booking.gateway');
const { useRequestBooking } = await import('./use-request-booking');
const { bookingKeys } = await import('./booking-keys');

const sampleBooking: Booking = {
  id: 'booking-1',
  listingId: 'listing-1',
  customerId: 'user-1',
  providerId: 'user-2',
  status: { kind: 'requested', requestedAt: '2026-08-06T00:00:00.000Z' },
  reviewId: null,
};

const requestParams = { actorId: 'user-1', listingId: 'listing-1', listingOwnerId: 'user-2' };

// Envuelve el hook en un QueryClientProvider fresco por test, sin reintentos, para que los tests sean deterministas
function createWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

beforeEach(() => {
  vi.mocked(bookingGateway.requestBooking).mockReset();
});

describe('useRequestBooking', () => {
  it('sends only one request when requestOnce is called twice while the first is still in flight', async () => {
    let resolveRequest!: (booking: Booking) => void;
    const pending = new Promise<Booking>((resolve) => {
      resolveRequest = resolve;
    });
    vi.mocked(bookingGateway.requestBooking).mockReturnValueOnce(pending);

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const { result } = renderHook(() => useRequestBooking(), { wrapper: createWrapper(queryClient) });

    await act(async () => {
      result.current.requestOnce(requestParams);
      result.current.requestOnce(requestParams); // el "doble toque"
      await Promise.resolve();
    });

    expect(bookingGateway.requestBooking).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveRequest(sampleBooking);
      await pending;
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(bookingGateway.requestBooking).toHaveBeenCalledTimes(1);
  });

  it('reports isPending while the request is in flight and clears it once it settles', async () => {
    let resolveRequest!: (booking: Booking) => void;
    const pending = new Promise<Booking>((resolve) => {
      resolveRequest = resolve;
    });
    vi.mocked(bookingGateway.requestBooking).mockReturnValueOnce(pending);

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const { result } = renderHook(() => useRequestBooking(), { wrapper: createWrapper(queryClient) });

    act(() => {
      result.current.requestOnce(requestParams);
    });

    await waitFor(() => expect(result.current.isPending).toBe(true));

    await act(async () => {
      resolveRequest(sampleBooking);
      await pending;
    });

    await waitFor(() => expect(result.current.isPending).toBe(false));
  });

  it('caches the new booking under its detail key and invalidates every booking list on success', async () => {
    vi.mocked(bookingGateway.requestBooking).mockResolvedValueOnce(sampleBooking);

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries');
    const { result } = renderHook(() => useRequestBooking(), { wrapper: createWrapper(queryClient) });

    await act(async () => {
      result.current.requestOnce(requestParams);
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(queryClient.getQueryData(bookingKeys.detail('booking-1'))).toEqual(sampleBooking);
    expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: bookingKeys.lists() });
  });

  it('allows a new attempt with a different idempotency key after a failed request', async () => {
    vi.mocked(bookingGateway.requestBooking)
      .mockRejectedValueOnce(new Error('network down'))
      .mockResolvedValueOnce(sampleBooking);

    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const { result } = renderHook(() => useRequestBooking(), { wrapper: createWrapper(queryClient) });

    await act(async () => {
      result.current.requestOnce(requestParams);
    });
    await waitFor(() => expect(result.current.isError).toBe(true));

    await act(async () => {
      result.current.requestOnce(requestParams);
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(bookingGateway.requestBooking).toHaveBeenCalledTimes(2);
    const firstKey = vi.mocked(bookingGateway.requestBooking).mock.calls[0]?.[1];
    const secondKey = vi.mocked(bookingGateway.requestBooking).mock.calls[1]?.[1];
    expect(firstKey).not.toBe(secondKey);
  });
});
