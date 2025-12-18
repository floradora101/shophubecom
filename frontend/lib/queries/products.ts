import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productsApi, type ProductsQueryParams } from "@/lib/api/products";
import type { ProductsResult, Product } from "@/lib/api/products";

export const productKeys = {
  all: ["products"] as const,
  list: (params: ProductsQueryParams) => ["products", "list", params] as const,
  detail: (slug: string) => ["products", "detail", slug] as const,
};

export function useProductsQuery(params: ProductsQueryParams) {
  // Longer stale time for filtered results (less likely to change frequently)
  // Filtered queries (category, search, price, inStockOnly) can be cached longer since they're more specific
  const hasFilters =
    params.categoryId ||
    params.search ||
    params.minPrice ||
    params.maxPrice ||
    params.inStockOnly;
  const staleTime = hasFilters ? 60_000 : 30_000; // 1 minute for filtered, 30s for all products

  return useQuery<ProductsResult>({
    queryKey: productKeys.list(params),
    queryFn: () => productsApi.getProducts(params),
    placeholderData: keepPreviousData,
    staleTime,
  });
}

export function useProductQuery(slug: string) {
  return useQuery<Product>({
    queryKey: productKeys.detail(slug),
    queryFn: () => productsApi.getProductBySlug(slug),
    enabled: !!slug,
    staleTime: 60_000, // Product details change less frequently
  });
}
