import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import type { AdminOrder, FullOrderDetail } from "../types";

// Backend order response structure
interface BackendOrderResponseDto {
  id: string;
  orderNumber: string;
  userId?: string | null;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
  fulfillmentStatus: "UNFULFILLED" | "PARTIAL" | "FULFILLED" | "RETURNED";
  subtotal: number;
  tax: number;
  shipping: number;
  discount: number;
  total: number;
  currency: string;
  shippingAddress: {
    fullName: string;
    phone?: string;
    label?: string;
    street1: string;
    street2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
  billingAddress?: {
    fullName: string;
    phone?: string;
    label?: string;
    street1: string;
    street2?: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  } | null;
  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    total: number;
    title: string;
    attributes?: Record<string, unknown> | null;
    variant?: {
      id: string;
      sku: string;
      image?: string | null;
      options?: Array<{ name: string; value: string }>;
    };
    product?: {
      id: string;
      name: string;
      images: string[];
    };
  }>;
  placedAt: string;
  updatedAt: string;
  user?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

interface PaginatedOrderResponse {
  data: BackendOrderResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Request payload for updating order status
export interface UpdateOrderStatusPayload {
  status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentStatus?: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
  fulfillmentStatus?: "UNFULFILLED" | "PARTIAL" | "FULFILLED" | "RETURNED";
}

// Helper function to transform backend order to AdminOrder
function transformToAdminOrder(order: BackendOrderResponseDto): AdminOrder {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: {
      id: order.user?.id ?? "",
      name: order.user?.fullName ?? "Unknown",
      email: order.user?.email ?? "",
    },
    status: order.status,
    totalAmount: order.total,
    createdAt: order.placedAt,
    updatedAt: order.updatedAt,
    itemCount,
  };
}

// Helper function to transform backend order to FullOrderDetail
function transformToFullOrderDetail(
  order: BackendOrderResponseDto
): FullOrderDetail {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: {
      id: order.user?.id ?? "",
      name: order.user?.fullName ?? "Unknown",
      email: order.user?.email ?? "",
    },
    status: order.status,
    totalAmount: order.total,
    createdAt: order.placedAt,
    updatedAt: order.updatedAt,
    address: {
      id: "", // Address doesn't have id in backend response
      name: order.shippingAddress.fullName,
      street:
        order.shippingAddress.street1 +
        (order.shippingAddress.street2
          ? `, ${order.shippingAddress.street2}`
          : ""),
      city: order.shippingAddress.city,
      state: order.shippingAddress.state ?? "",
      zipCode: order.shippingAddress.postalCode,
      phone: order.shippingAddress.phone ?? "",
    },
    items: order.items.map((item) => ({
      id: item.id,
      productId: item.productId,
      productName: item.title,
      productSlug: "", // Not available in backend response
      productImage:
        item.product?.images?.[0] ?? item.variant?.image ?? undefined,
      quantity: item.quantity,
      price: item.unitPrice,
    })),
  };
}

export const adminOrdersApi = {
  /**
   * Get all orders with filtering, pagination (for admin)
   */
  async getOrders(params?: {
    search?: string;
    status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
    paymentStatus?: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
    fulfillmentStatus?: "UNFULFILLED" | "PARTIAL" | "FULFILLED" | "RETURNED";
    userId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: AdminOrder[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const queryParams = new URLSearchParams();
      if (params?.search) queryParams.append("search", params.search);
      if (params?.status) queryParams.append("status", params.status);
      if (params?.paymentStatus)
        queryParams.append("paymentStatus", params.paymentStatus);
      if (params?.fulfillmentStatus)
        queryParams.append("fulfillmentStatus", params.fulfillmentStatus);
      if (params?.userId) queryParams.append("userId", params.userId);
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      // Backend wraps response in { success: true, data: {...} }
      const response = await apiClient.get<
        BackendResponse<PaginatedOrderResponse>
      >(`/admin/orders?${queryParams.toString()}`);

      // response.data is the wrapped response: { success: true, data: {...}, timestamp: "..." }
      // response.data.data is the actual orders response: { data: [...], total, page, limit, totalPages }
      const ordersResponse = response.data.data;

      return {
        data: ordersResponse.data.map(transformToAdminOrder),
        total: ordersResponse.total,
        page: ordersResponse.page,
        limit: ordersResponse.limit,
        totalPages: ordersResponse.totalPages,
      };
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Get a single order by ID (for admin)
   */
  async getOrder(orderId: string): Promise<FullOrderDetail> {
    try {
      const response = await apiClient.get<
        BackendResponse<BackendOrderResponseDto>
      >(`/orders/${orderId}`);
      return transformToFullOrderDetail(response.data.data);
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Update order status (admin only)
   */
  async updateOrderStatus(
    orderId: string,
    payload: UpdateOrderStatusPayload
  ): Promise<FullOrderDetail> {
    try {
      const response = await apiClient.patch<
        BackendResponse<BackendOrderResponseDto>
      >(`/admin/orders/${orderId}/status`, payload);
      return transformToFullOrderDetail(response.data.data);
    } catch (error: unknown) {
      throw error;
    }
  },
};
