import { apiClient, type ExtendedAxiosRequestConfig } from "./client";

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

// Backend wraps responses in { success: true, data: ... }
interface BackendResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
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
      const queryParams = new URLSearchParams();
      if (params?.status) queryParams.append("status", params.status);
      if (params?.paymentStatus)
        queryParams.append("paymentStatus", params.paymentStatus);
      if (params?.fulfillmentStatus)
        queryParams.append("fulfillmentStatus", params.fulfillmentStatus);
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.limit) queryParams.append("limit", params.limit.toString());

      // Backend wraps response in { success: true, data: {...} }
      const response = await apiClient.get<
        BackendResponse<PaginatedOrderResponse>
      >(`/orders?${queryParams.toString()}`);

      // response.data is the wrapped response: { success: true, data: {...}, timestamp: "..." }
      // response.data.data is the actual orders response: { data: [...], total, page, limit }
      const ordersResponse = response.data.data;

      const totalPages = Math.ceil(ordersResponse.total / ordersResponse.limit);

      return {
        data: ordersResponse.data.map(transformToOrder),
        total: ordersResponse.total,
        page: ordersResponse.page,
        limit: ordersResponse.limit,
        totalPages,
      };
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ API Error - getOrders:", error);
      }
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
      return transformToOrder(response.data.data);
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ API Error - getOrderById:", error);
        if (
          error &&
          typeof error === "object" &&
          "response" in error &&
          error.response &&
          typeof error.response === "object"
        ) {
          const axiosError = error as {
            response?: {
              data?: {
                message?: string;
                errors?: string[];
                statusCode?: number;
              };
              status?: number;
            };
          };
          const errorData = axiosError.response?.data;
          console.error("❌ Error Status:", axiosError.response?.status);
          console.error(
            "❌ Error Message:",
            errorData?.message || "Unknown error"
          );
        }
      }
      throw error;
    }
  },

  /**
   * Get a single order by ID (returns raw backend response with subtotal/shipping)
   * @param id - Order ID
   * @note For guest orders, the token is automatically sent via httpOnly cookie
   */
  async getOrderByIdRaw(id: string): Promise<BackendOrderResponseDto> {
    try {
      const response = await apiClient.get<
        BackendResponse<BackendOrderResponseDto>
      >(`/orders/${id}`, {
        _skipAuthRefresh: true,
      } as ExtendedAxiosRequestConfig);
      return response.data.data;
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ API Error - getOrderByIdRaw:", error);
      }
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
      return response.data.data;
    } catch (error: unknown) {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ API Error - getOrderStats:", error);
      }
      throw error;
    }
  },
};
