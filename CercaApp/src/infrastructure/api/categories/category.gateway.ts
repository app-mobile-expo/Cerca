import { z } from 'zod';

import type { CategoryRepository } from '@/application/categories/ports/category.repository';

import { httpClient } from '../http-client';

const categorySchema = z.object({
  id: z.string().min(1),
  slug: z.string(),
  name: z.string(),
});

const categoryListSchema = z.array(categorySchema);

// Implementa CategoryRepository contra GET /v1/categories: sin query params, la respuesta es un array directo
export class CategoryApiGateway implements CategoryRepository {
  async listCategories() {
    const raw = await httpClient.get('/categories');
    return categoryListSchema.parse(raw);
  }
}

export const categoryGateway = new CategoryApiGateway();
