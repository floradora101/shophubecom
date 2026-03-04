import { apiClient, type ExtendedAxiosRequestConfig } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import { extractResponseData, extractPaginatedData } from "@/lib/api/response-transformer";

// Orders API client
export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED";

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  quantity: number;
  price: number;
}

export interface Address {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  address: Address;
  items: OrderItem[];
}

export interface OrderStats {
  totalOrders: number;
  totalSpent: number;
  pendingOrders: number;
  completedOrders: number;
}

// Backend order response structure
export interface BackendOrderResponseDto {
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
  couponCode?: string | null;
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
      slug: string;
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

// Helper function to transform backend order to frontend Order
function transformToOrder(order: BackendOrderResponseDto): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
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
      productSlug: item.product?.slug ?? "",
      productImage:
        item.product?.images?.[0] ?? item.variant?.image ?? undefined,
      quantity: item.quantity,
      price: item.unitPrice,
    })),
  };
}

export const ordersApi = {
  /**
   * Get user's orders with filtering and pagination
   */
  async getOrders(params?: {
    status?: OrderStatus;
    paymentStatus?: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
    fulfillmentStatus?: "UNFULFILLED" | "PARTIAL" | "FULFILLED" | "RETURNED";
    page?: number;
    limit?: number;
  }): Promise<{
    data: Order[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const page = params?.page ?? 1;
      const limit = params?.limit ?? 20;

      const queryParams = new URLSearchParams();
      queryParams.append("page", page.toString());
      queryParams.append("limit", limit.toString());
      if (params?.status) queryParams.append("status", params.status);
      if (params?.paymentStatus)
        queryParams.append("paymentStatus", params.paymentStatus);
      if (params?.fulfillmentStatus)
        queryParams.append("fulfillmentStatus", params.fulfillmentStatus);

      const response = await apiClient.get<
        BackendResponse<PaginatedOrderResponse>
      >(`/orders?${queryParams.toString()}`);

      const ordersResponse = extractResponseData(response);

      return {
        data: ordersResponse.data.map(transformToOrder),
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
   * Get a single order by ID
   * @param id - Order ID
   * @note For guest orders, the token is automatically sent via httpOnly cookie
   */
  async getOrderById(id: string): Promise<Order> {
    try {
      const response = await apiClient.get<
        BackendResponse<BackendOrderResponseDto>
      >(`/orders/${id}`);
      return transformToOrder(extractResponseData(response));
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Get a single order by ID (returns raw backend response with subtotal/shipping)
   * @param id - Order ID
   * @param options.skipAuthRefresh - When true (guest order view), skip 401 refresh to avoid
   *   failed refresh + authExpired. When false/undefined (authenticated user), allow refresh.
   * @note For guest orders, the token is automatically sent via httpOnly cookie
   */
  async getOrderByIdRaw(
    id: string,
    options?: { skipAuthRefresh?: boolean }
  ): Promise<BackendOrderResponseDto> {
    try {
      const response = await apiClient.get<
        BackendResponse<BackendOrderResponseDto>
      >(`/orders/${id}`, {
        ...(options?.skipAuthRefresh && {
          _skipAuthRefresh: true,
        } as ExtendedAxiosRequestConfig),
      });
      return extractResponseData(response);
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Get order statistics for the current user
   */
  async getOrderStats(): Promise<OrderStats> {
    try {
      const response = await apiClient.get<BackendResponse<OrderStats>>(
        "/orders/stats"
      );
      return extractResponseData(response);
    } catch (error: unknown) {
      throw error;
    }
  },

  /**
   * Admin: Get all orders across all users
   */
  async getAdminOrders(params?: {
    status?: OrderStatus;
    userId?: string;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{
    data: BackendOrderResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const response = await apiClient.get<BackendResponse<PaginatedOrderResponse>>(
      "/admin/orders",
      { params }
    );
    return extractPaginatedData(response);
  },

  /**
   * Admin: Update order status
   */
  async updateOrderStatus(
    id: string,
    data: { status: OrderStatus; notes?: string }
  ): Promise<BackendOrderResponseDto> {
    const response = await apiClient.patch<
      BackendResponse<BackendOrderResponseDto>
    >(`/admin/orders/${id}/status`, data);
    return extractResponseData(response);
  },
};
