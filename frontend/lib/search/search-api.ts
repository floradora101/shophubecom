/**
 * Search API Functions
 *
 * Functions for fetching search results and counts.
 */

import {
  mockProducts,
  mockProductToProduct,
} from "@/lib/mock-data/mock-data";
import { scoreProduct } from "./search-utils";
import type { Product } from "@/features/products/types";

/**
 * Fetch count of search results
 */
export async function fetchResultsCount(
  query: string,
  signal?: AbortSignal
): Promise<number> {
  if (signal?.aborted) return 0;

  if (!query.trim()) return 0;

  return mockProducts
    .map((product) => ({
      product: mockProductToProduct(product),
      score: scoreProduct(product, query),
    }))
    .filter((item) => item.score > 0).length;
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
