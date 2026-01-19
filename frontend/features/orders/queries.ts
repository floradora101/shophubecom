import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ordersApi, type Order, type OrderStats } from "./api";
import { orderKeys, type OrderListParams } from "./query-keys";

// Re-export type for convenience
export type { OrderListParams };

export type OrdersListResult = {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

/**
 * Get paginated orders for the current user with filters
 */
export function useOrdersQuery(params?: OrderListParams) {
  return useQuery<OrdersListResult>({
    queryKey: orderKeys.list(params),
    queryFn: () => ordersApi.getOrders(params),
    placeholderData: keepPreviousData, // Keep previous data while fetching new page
    staleTime: 30_000, // 30 seconds
  });
}

/**
 * Get a single order by ID
 */
export function useOrderQuery(id: string, enabled = true) {
  return useQuery<Order>({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersApi.getOrderById(id),
    enabled: enabled && !!id,
    staleTime: 60_000, // 1 minute - order details change less frequently
  });
}

/**
 * Get order statistics for the current user
 */
export function useOrderStatsQuery() {
  return useQuery<OrderStats>({
    queryKey: orderKeys.stats(),
    queryFn: () => ordersApi.getOrderStats(),
    staleTime: 30_000, // 30 seconds
  });
}

