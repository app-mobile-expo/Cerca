import { useQuery } from '@tanstack/react-query';

import { createListCategoriesUseCase } from '@/application/categories/use-cases/list-categories';
import { categoryGateway } from '@/infrastructure/api/category.gateway';

import { categoryKeys } from './category-keys';

const listCategories = createListCategoriesUseCase(categoryGateway);

// Sin cursor ni filtros: GET /v1/categories no pagina (son ~40 categorías fijas), por eso useQuery simple alcanza
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.lists(),
    queryFn: () => listCategories(),
  });
}
