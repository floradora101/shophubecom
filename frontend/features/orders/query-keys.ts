/**
 * @file query-keys.ts
 *
 * Order Query Keys Factory
 *
 * Purpose:
 * Centralized query key factory for order-related queries.
 * Ensures consistent cache key structure and prevents cache key bugs.
 *
 * Usage:
 * - Use in query hooks: `queryKey: orderKeys.list(params)`
 * - Use in invalidations: `queryClient.invalidateQueries({ queryKey: orderKeys.all })`
 */

export type OrderListParams = {
  status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus?: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
  fulfillmentStatus?: "UNFULFILLED" | "PARTIAL" | "FULFILLED" | "RETURNED";
  page?: number;
  limit?: number;
};

export const orderKeys = {
  /**
   * Base key for all order queries
   * Use this to invalidate all order-related queries
   */
  all: ["orders"] as const,

  /**
   * Key for order list queries
   * Use for paginated and filtered order lists
   */
  lists: () => [...orderKeys.all, "list"] as const,

  /**
   * Key for a specific order list with filters
   * @param params - Filter and pagination parameters
   */
  list: (params?: OrderListParams) =>
    [...orderKeys.lists(), params] as const,

  /**
   * Key for order detail queries
   * Use for individual order queries
   */
  details: () => [...orderKeys.all, "detail"] as const,

  /**
   * Key for a specific order detail
   * @param id - Order ID
   */
  detail: (id: string) => [...orderKeys.details(), id] as const,

  /**
   * Key for order statistics query
   */
  stats: () => [...orderKeys.all, "stats"] as const,
};
