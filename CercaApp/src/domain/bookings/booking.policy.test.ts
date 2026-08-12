import { describe, expect, it } from 'vitest';

import { canRequestBooking } from './booking.policy';

describe('canRequestBooking', () => {
  it('blocks a customer from booking their own listing', () => {
    const result = canRequestBooking('user-1', 'user-1');

    expect(result).toEqual({ ok: false, reason: 'cannot_book_own_listing' });
  });

  it('allows booking a listing owned by someone else', () => {
    const result = canRequestBooking('user-1', 'user-2');

    expect(result).toEqual({ ok: true });
  });
});
