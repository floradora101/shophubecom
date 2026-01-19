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
   * Use for fetching all categories
   */
  lists: () => [...categoryKeys.all, "list"] as const,

  /**
   * Key for a specific category list
   * Currently only one list, but structure allows for future expansion
   */
  list: () => [...categoryKeys.lists()] as const,

  /**
   * Key for category detail queries
   * Use for individual category queries
   */
  details: () => [...categoryKeys.all, "detail"] as const,

  /**
   * Key for a specific category detail
   * @param slug - Category slug or ID
   */
  detail: (slug: string) => [...categoryKeys.details(), slug] as const,
};
