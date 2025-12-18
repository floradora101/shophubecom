import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api/categories";
import type { Category } from "@/lib/types/product.types";

export const categoryKeys = {
  all: ["categories"] as const,
};

export function useCategoriesQuery() {
  return useQuery<Category[]>({
    queryKey: categoryKeys.all,
    queryFn: () => categoriesApi.getCategories(),
    staleTime: 60_000,
  });
}
