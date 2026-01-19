/**
 * @file query-keys.ts
 *
 * Address Query Keys Factory
 *
 * Purpose:
 * Centralized query key factory for address-related queries.
 * Ensures consistent cache key structure and prevents cache key bugs.
 *
 * Usage:
 * - Use in query hooks: `queryKey: addressKeys.list()`
 * - Use in invalidations: `queryClient.invalidateQueries({ queryKey: addressKeys.all })`
 */

export const addressKeys = {
  /**
   * Base key for all address queries
   * Use this to invalidate all address-related queries
   */
  all: ["addresses"] as const,

  /**
   * Key for address list queries
   * Use for fetching all addresses for the current user
   */
  lists: () => [...addressKeys.all, "list"] as const,

  /**
   * Key for a specific address list
   * Currently only one list (user addresses), but structure allows for future expansion
   */
  list: () => [...addressKeys.lists()] as const,

  /**
   * Key for address detail queries
   * Use for individual address queries
   */
  details: () => [...addressKeys.all, "detail"] as const,

  /**
   * Key for a specific address detail
   * @param id - Address ID
   */
  detail: (id: string) => [...addressKeys.details(), id] as const,
};
