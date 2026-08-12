import { describe, expect, it } from 'vitest';

import { reviewFormSchema } from './review-form-schema';

describe('reviewFormSchema', () => {
  it('rejects a rating of 0 with an i18n key, never raw English text', () => {
    const result = reviewFormSchema.safeParse({ rating: 0, comment: 'Great service, very tidy.' });

    expect(result.success).toBe(false);
    expect(result.success ? null : result.error.issues[0]?.message).toBe('review.validation.ratingRequired');
  });

  it('rejects a comment shorter than 10 characters', () => {
    const result = reviewFormSchema.safeParse({ rating: 5, comment: 'short' });

    expect(result.success).toBe(false);
    expect(result.success ? null : result.error.issues[0]?.message).toBe('review.validation.commentTooShort');
  });

  it('accepts a valid rating and comment', () => {
    const result = reviewFormSchema.safeParse({ rating: 4, comment: 'Great service, very tidy.' });

    expect(result.success).toBe(true);
  });
});
