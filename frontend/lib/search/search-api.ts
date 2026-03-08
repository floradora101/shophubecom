/**
 * Search API Functions
 *
 * Functions for fetching search results and counts.
 * Mock data loaded via dynamic import() so it is tree-shaken from production.
 */

import { scoreProduct } from "./search-utils";
import type { Product } from "@/features/products/types";
import { USE_MOCKS } from "@/lib/flags";
import { productsApi } from "@/features/products/api";

/**
 * Fetch count of search results
 */
export async function fetchResultsCount(
  query: string,
  signal?: AbortSignal
): Promise<number> {
  if (signal?.aborted) return 0;
  if (!query.trim()) return 0;

  if (USE_MOCKS) {
    const { mockProducts, mockProductToProduct } = await import(
      "@/lib/mock-data/mock-data"
    );
    return mockProducts
      .map((product) => ({
        product: mockProductToProduct(product),
        score: scoreProduct(product, query),
      }))
      .filter((item) => item.score > 0).length;
  }

  const { total } = await productsApi.getProducts({
    search: query,
    limit: 1,
    page: 1,
  });
  return total;
}

/**
 * Fetch search results with limit
 */
export async function fetchResults(
  query: string,
  signal?: AbortSignal,
  limit: number = 8
): Promise<Product[]> {
  if (signal?.aborted) return [];
  if (!query.trim()) return [];

  if (USE_MOCKS) {
    const { mockProducts, mockProductToProduct } = await import(
      "@/lib/mock-data/mock-data"
    );
    return mockProducts
      .map((product) => ({
        product: mockProductToProduct(product),
        score: scoreProduct(product, query),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((item) => item.product);
  }

  const { data } = await productsApi.getProducts({
    search: query,
    limit,
    page: 1,
  });
  return data;
}
