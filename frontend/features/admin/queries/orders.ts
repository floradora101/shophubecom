import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { adminOrdersApi, type UpdateOrderStatusPayload } from "../api/orders";
import type { AdminOrder, FullOrderDetail } from "../types";
import { adminQueryKeys } from "./queryKeys";

// ============================================================================
// Order Types
// ============================================================================

export type OrdersListParams = {
  search?: string;
  status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus?: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
  fulfillmentStatus?: "UNFULFILLED" | "PARTIAL" | "FULFILLED" | "RETURNED";
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
};

export type OrdersListResult = {
  data: AdminOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// ============================================================================
// Order Queries
// ============================================================================

/**
 * Get paginated orders with filters, sorting, and pagination
 * Use this for the admin orders listing page
 */
export function useAdminOrdersQuery(params?: OrdersListParams) {
  return useQuery<OrdersListResult>({
    queryKey: adminQueryKeys.orders.list(params),
    queryFn: () => adminOrdersApi.getOrders(params),
    placeholderData: keepPreviousData, // Keep previous data while fetching new page
    staleTime: 30_000, // 30 seconds - admin data changes more frequently
  });
}

/**
 * Get a single order by ID
 */
export function useAdminOrderQuery(id: string, enabled = true) {
  return useQuery<FullOrderDetail | null>({
    queryKey: adminQueryKeys.orders.detail(id),
    queryFn: async () => {
      const order = await adminOrdersApi.getOrder(id);
      return order;
    },
    enabled: enabled && !!id,
    staleTime: 30_000,
  });
}

// ============================================================================
// Order Mutations
// ============================================================================

export function useUpdateOrderStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateOrderStatusPayload;
    }) => adminOrdersApi.updateOrderStatus(id, payload),
    onSuccess: (data, variables) => {
      // Invalidate specific order detail
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.orders.detail(variables.id),
      });
      // Invalidate all lists
      queryClient.invalidateQueries({
        queryKey: adminQueryKeys.orders.lists(),
      });
      // Update the cache with the new data
      queryClient.setQueryData(
        adminQueryKeys.orders.detail(variables.id),
        data
      );
    },
  });
}

