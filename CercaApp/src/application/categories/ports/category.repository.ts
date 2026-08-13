import type { Category } from '@/domain/categories/category';

export interface CategoryRepository {
  listCategories(): Promise<readonly Category[]>;
}
