import { apiClient } from "./client";

// Backend wraps responses in { success: true, data: ... }
interface BackendResponse<T> {
  success: boolean;
  data: T;
  timestamp: string;
}

export interface CartItemVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  image?: string | null;
  images?: string[];
  options?: Record<string, string>;
}

export interface CartItemProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  images: string[];
}

export interface CartItem {
  id: string;
  cartId: string;
  productId: string;
  variantId: string | null;
  quantity: number;
  unitPrice: number;
  product?: CartItemProduct;
  variant?: CartItemVariant;
}

export interface Cart {
  id: string;
  userId: string | null;
  items: CartItem[];
  subtotal: number;
  totalQuantity: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddCartItemParams {
  variantId: string;
  quantity?: number;
}

export interface UpdateCartItemParams {
  quantity: number;
}

export const cartApi = {
  /**
   * Get current cart
   */
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<BackendResponse<Cart>>("/cart");
    return response.data.data;
  },

  /**
   * Add item to cart
   */
  async addItem(params: AddCartItemParams): Promise<Cart> {
    const response = await apiClient.post<BackendResponse<Cart>>(
      "/cart/items",
      params
    );
    return response.data.data;
  },

  /**
   * Update cart item quantity
   */
  async updateItem(
    itemId: string,
    params: UpdateCartItemParams
  ): Promise<Cart> {
    const response = await apiClient.patch<BackendResponse<Cart>>(
      `/cart/items/${itemId}`,
      params
    );
    return response.data.data;
  },

  /**
   * Remove item from cart
   * Backend returns full Cart
   */
  async removeItem(itemId: string): Promise<Cart> {
    const response = await apiClient.delete<BackendResponse<Cart>>(
      `/cart/items/${itemId}`
    );
    return response.data.data;
  },

  /**
   * Clear entire cart
   * Backend returns full Cart
   */
  async clearCart(): Promise<Cart> {
    const response = await apiClient.delete<BackendResponse<Cart>>("/cart");
    return response.data.data;
  },
};
