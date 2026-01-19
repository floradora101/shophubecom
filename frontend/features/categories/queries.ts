import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "./api";
import type { Category } from "@/features/products/types";
import { categoryKeys } from "./query-keys";

export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: categoryKeys.all,
    queryFn: () => categoriesApi.getCategories(),
    staleTime: 60_000,
  });
}

