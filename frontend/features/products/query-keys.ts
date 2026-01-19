/**
 * @file query-keys.ts
 *
 * Product Query Keys Factory
 *
 * Purpose:
 * Centralized query key factory for product-related queries.
 * Ensures consistent cache key structure and prevents cache key bugs.
 *
 * Usage:
 * - Use in query hooks: `queryKey: productKeys.list(filters)`
 * - Use in invalidations: `queryClient.invalidateQueries({ queryKey: productKeys.all })`
 */

import type { ProductsQueryParams } from "./api";

export const productKeys = {
  /**
   * Base key for all product queries
   * Use this to invalidate all product-related queries
   */
  all: ["products"] as const,

  /**
   * Key for product list queries
   * Use for filtered product lists (category, search, price range, etc.)
   */
  lists: () => [...productKeys.all, "list"] as const,

  /**
   * Key for a specific product list with filters
   * @param params - Filter parameters for the product list
   */
  list: (params?: ProductsQueryParams) =>
    [...productKeys.lists(), params] as const,

  /**
   * Key for product detail queries
   * Use for individual product queries
   */
  details: () => [...productKeys.all, "detail"] as const,

  /**
   * Key for a specific product detail
   * @param slug - Product slug or ID
   */
  detail: (slug: string) => [...productKeys.details(), slug] as const,

  /**
   * Key for featured products query
   */
  featured: () => [...productKeys.all, "featured"] as const,

  /**
   * Key for latest products query
   */
  latest: () => [...productKeys.all, "latest"] as const,
};
