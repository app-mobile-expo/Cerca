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
const { BookingApiGateway } = await import('./booking.gateway');

const validBookingResponse = {
  id: 'booking-1',
  listingId: 'listing-1',
  customerId: 'user-1',
  providerId: 'user-2',
  status: { kind: 'requested', requestedAt: '2026-08-06T00:00:00.000Z' },
  reviewId: null,
};

describe('BookingApiGateway', () => {
  it('parses a valid response into a Booking and sends the Idempotency-Key', async () => {
    vi.mocked(httpClient.post).mockResolvedValueOnce(validBookingResponse);
    const gateway = new BookingApiGateway();

    const booking = await gateway.requestBooking('listing-1', 'idem-key-1');

    expect(booking).toEqual(validBookingResponse);
    expect(httpClient.post).toHaveBeenCalledWith('/bookings', { listingId: 'listing-1' }, 'idem-key-1');
  });

  it('throws instead of returning a malformed response to the application layer', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({
      id: 'booking-1',
      // faltan campos requeridos: listingId, customerId, providerId, status, reviewId
    });
    const gateway = new BookingApiGateway();

    await expect(gateway.getBooking('booking-1')).rejects.toBeInstanceOf(ZodError);
  });

  it('rejects a status.kind the domain does not know about', async () => {
    vi.mocked(httpClient.get).mockResolvedValueOnce({
      ...validBookingResponse,
      status: { kind: 'archived' },
    });
    const gateway = new BookingApiGateway();

    await expect(gateway.getBooking('booking-1')).rejects.toBeInstanceOf(ZodError);
  });
});
