import { keepPreviousData, useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, type Order, type OrderStats, type BackendOrderResponseDto, type OrderStatus } from "./api";
import { orderKeys, type OrderListParams } from "./query-keys";
import { toast } from "sonner";

// Re-export type for convenience
export type { OrderListParams };

export type OrdersListResult = {
  data: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type AdminOrdersListResult = {
  data: BackendOrderResponseDto[];
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

/**
 * Admin: Get all orders across all users
 */
export function useAdminOrdersQuery(params?: {
  status?: OrderStatus;
  userId?: string;
  page?: number;
  limit?: number;
  search?: string;
}) {
  return useQuery<AdminOrdersListResult>({
    queryKey: orderKeys.admin.list(params),
    queryFn: () => ordersApi.getAdminOrders(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  });
}

/**
 * Admin: Update order status mutation
 */
export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      status,
      notes,
    }: {
      id: string;
      status: OrderStatus;
      notes?: string;
    }) => ordersApi.updateOrderStatus(id, { status, notes }),
    onSuccess: (_, variables) => {
      // Invalidate both admin and regular order queries
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.admin.all });
      queryClient.invalidateQueries({
        queryKey: orderKeys.admin.detail(variables.id),
      });
      toast.success(`Order status updated to ${variables.status}`);
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update order status. Please try again.";
      toast.error(errorMessage);
    },
  });
}

