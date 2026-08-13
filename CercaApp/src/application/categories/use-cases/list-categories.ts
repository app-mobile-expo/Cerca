import type { CategoryRepository } from '@/application/categories/ports/category.repository';
import type { Category } from '@/domain/categories/category';

export function createListCategoriesUseCase(repository: CategoryRepository) {
  return function listCategories(): Promise<readonly Category[]> {
    return repository.listCategories();
  };
}
