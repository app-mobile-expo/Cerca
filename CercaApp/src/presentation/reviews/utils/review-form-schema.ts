import { z } from 'zod';

// Valida el formulario de reseña: 1 a 5 estrellas y un comentario de al menos 10 caracteres; los mensajes son claves de i18n
export const reviewFormSchema = z.object({
  rating: z
    .number()
    .int()
    .min(1, { message: 'review.validation.ratingRequired' })
    .max(5, { message: 'review.validation.ratingRequired' }),
  comment: z
    .string()
    .trim()
    .min(10, { message: 'review.validation.commentTooShort' })
    .max(1000, { message: 'review.validation.commentTooLong' }),
});

export type ReviewFormValues = z.infer<typeof reviewFormSchema>;
