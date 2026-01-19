import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { productsApi, type ProductsQueryParams } from "./api";
import type { ProductsResult, Product } from "./api";
import { normalizeFilters } from "./utils/filters";
import { productKeys } from "./query-keys";

export function useProductsQuery(params: ProductsQueryParams) {
  // Normalize filters before using in query key and API call
  // This ensures consistent cache keys and proper type conversion
  const normalizedParams = normalizeFilters(params);

  // Longer stale time for filtered results (less likely to change frequently)
  // Filtered queries (category, search, price, inStockOnly) can be cached longer since they're more specific
  const hasFilters =
    normalizedParams.categoryId ||
    normalizedParams.search ||
    normalizedParams.minPrice !== undefined ||
    normalizedParams.maxPrice !== undefined ||
    normalizedParams.inStockOnly !== undefined;
  const staleTime = hasFilters ? 60_000 : 30_000; // 1 minute for filtered, 30s for all products

  return useQuery<ProductsResult>({
    queryKey: productKeys.list(normalizedParams),
    queryFn: () => productsApi.getProducts(normalizedParams),
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

export function useFeaturedProductsQuery() {
  return useQuery<Product[]>({
    queryKey: productKeys.featured(),
    queryFn: () => productsApi.getFeaturedProducts(),
    staleTime: 30_000, // 30 seconds
  });
}

export function useLatestProductsQuery() {
  return useQuery<Product[]>({
    queryKey: productKeys.latest(),
    queryFn: () => productsApi.getLatestProducts(),
    staleTime: 30_000, // 30 seconds
  });
}
