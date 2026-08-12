import { describe, expect, it } from 'vitest';

import { OwnListingBookingError } from '@/domain/bookings/booking.errors';
import { ApiError, ApiNetworkError } from '@/infrastructure/api/api-error';

import { getBookingErrorMessageKey } from './booking-error-message';

describe('getBookingErrorMessageKey', () => {
  it('maps a network failure to a clear message, never a raw status code', () => {
    expect(getBookingErrorMessageKey(new ApiNetworkError())).toBe('errors.network');
  });

  it('maps the own-listing domain error to its i18n key', () => {
    expect(getBookingErrorMessageKey(new OwnListingBookingError())).toBe(
      'bookings.blocked.cannot_book_own_listing',
    );
  });

  it('maps a server "not_owner" reason to the same own-listing message as the client-side check', () => {
    expect(getBookingErrorMessageKey(new ApiError(403, 'not_owner'))).toBe(
      'bookings.blocked.cannot_book_own_listing',
    );
  });

  it('maps a bare 500 to a generic server message, never "Error 500"', () => {
    const message = getBookingErrorMessageKey(new ApiError(500));

    expect(message).toBe('errors.server');
    expect(message).not.toMatch(/500/);
  });

  it('maps 401/403 without a known reason to a forbidden message', () => {
    expect(getBookingErrorMessageKey(new ApiError(401))).toBe('errors.forbidden');
  });

  it('falls back to a generic message for anything unrecognized', () => {
    expect(getBookingErrorMessageKey(new Error('boom'))).toBe('errors.generic');
  });
});
