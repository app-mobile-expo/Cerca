import { describe, expect, it, vi } from 'vitest';

import type { BookingRepository } from '@/application/bookings/ports/booking.repository';
import type { Booking } from '@/domain/bookings/booking';
import { OwnListingBookingError } from '@/domain/bookings/booking.errors';

import { createRequestBookingUseCase } from './request-booking';

const sampleBooking: Booking = {
  id: 'booking-1',
  listingId: 'listing-1',
  customerId: 'user-1',
  providerId: 'user-2',
  status: { kind: 'requested', requestedAt: '2026-08-06T00:00:00.000Z' },
  reviewId: null,
};

// Repositorio falso en memoria, para probar el caso de uso sin tocar red ni React
function createFakeRepository(): BookingRepository {
  return {
    requestBooking: vi.fn().mockResolvedValue(sampleBooking),
    getBooking: vi.fn(),
    listBookings: vi.fn(),
  };
}

describe('createRequestBookingUseCase', () => {
  it('rejects the request without touching the repository when the listing is the actor\'s own', async () => {
    const repository = createFakeRepository();
    const requestBooking = createRequestBookingUseCase(repository);

    await expect(
      requestBooking({
        actorId: 'user-1',
        listingId: 'listing-1',
        listingOwnerId: 'user-1',
        idempotencyKey: 'key-1',
      }),
    ).rejects.toBeInstanceOf(OwnListingBookingError);

    expect(repository.requestBooking).not.toHaveBeenCalled();
  });

  it('forwards the listing id and idempotency key to the repository when eligible', async () => {
    const repository = createFakeRepository();
    const requestBooking = createRequestBookingUseCase(repository);

    const booking = await requestBooking({
      actorId: 'user-1',
      listingId: 'listing-1',
      listingOwnerId: 'user-2',
      idempotencyKey: 'key-1',
    });

    expect(booking).toEqual(sampleBooking);
    expect(repository.requestBooking).toHaveBeenCalledOnce();
    expect(repository.requestBooking).toHaveBeenCalledWith('listing-1', 'key-1');
  });
});
