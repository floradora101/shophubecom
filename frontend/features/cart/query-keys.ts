/**
 * @file query-keys.ts
 *
 * Cart Query Keys Factory
 *
 * Purpose:
 * Centralized query key factory for cart-related queries.
 * Ensures consistent cache key structure and prevents cache key bugs.
 *
 * Note:
 * Cart is a single entity (not a list), so we only need `all` key.
 * Backend handles guest vs user identification via cookies/JWT automatically.
 * Frontend never branches query keys by auth state.
 *
 * Usage:
 * - Use in query hooks: `queryKey: cartKeys.all`
 * - Use in invalidations: `queryClient.invalidateQueries({ queryKey: cartKeys.all })`
 */

export const cartKeys = {
  /**
   * Base key for all cart queries
   * Cart is a single entity, so this is the only key needed
   * Use this to invalidate cart queries
   */
  all: ["cart"] as const,
};

