/**
 * @file query-keys.ts
 *
 * Category Query Keys Factory
 *
 * Purpose:
 * Centralized query key factory for category-related queries.
 * Ensures consistent cache key structure and prevents cache key bugs.
 *
 * Usage:
 * - Use in query hooks: `queryKey: categoryKeys.all`
 * - Use in invalidations: `queryClient.invalidateQueries({ queryKey: categoryKeys.all })`
 */

export const categoryKeys = {
  /**
   * Base key for all category queries
   * Use this to invalidate all category-related queries
   */
  all: ["categories"] as const,

  /**
   * Key for category list queries
   * Use for fetching paginated/filtered categories
   */
  lists: () => [...categoryKeys.all, "list"] as const,

  /**
   * Key for a specific category list with filters
   * @param params - Optional filter parameters
   */
  list: (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: "name" | "createdAt";
    sortOrder?: "asc" | "desc";
  }) => [...categoryKeys.lists(), params] as const,

  /**
   * Key for category tree query
   * Returns hierarchical structure with children
   */
  tree: () => [...categoryKeys.all, "tree"] as const,

  /**
   * Key for category detail queries
   * Use for individual category queries
   */
  details: () => [...categoryKeys.all, "detail"] as const,

  /**
   * Key for a specific category detail
   * @param idOrSlug - Category slug or ID
   */
  detail: (idOrSlug: string) => [...categoryKeys.details(), idOrSlug] as const,
};
