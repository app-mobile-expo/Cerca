import { z } from 'zod';

export const actorSchema = z.object({
  id: z.string(),
  capacities: z.array(
    z.enum(['customer', 'provider']),
  ),
  platformRole: z.enum([
    'user',
    'moderator',
    'admin',
  ]),
}).transform((actor) => ({
  ...actor,
  capacities: [...actor.capacities],
}));

export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  actor: actorSchema,
});
