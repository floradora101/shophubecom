import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { ordersApi, type Order, type OrderStats } from "@/lib/api/orders";

export const orderKeys = {
  all: ["orders"] as const,
  lists: () => ["orders", "list"] as const,
  list: (params?: {
    status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus?: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
    fulfillmentStatus?: "UNFULFILLED" | "PARTIAL" | "FULFILLED" | "RETURNED";
    page?: number;
    limit?: number;
  }) => ["orders", "list", params] as const,
  detail: (id: string) => ["orders", "detail", id] as const,
  stats: () => ["orders", "stats"] as const,
};

export type OrdersListParams = {
  status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus?: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
  fulfillmentStatus?: "UNFULFILLED" | "PARTIAL" | "FULFILLED" | "RETURNED";
  page?: number;
  limit?: number;
};

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
export function useOrdersQuery(params?: OrdersListParams) {
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

