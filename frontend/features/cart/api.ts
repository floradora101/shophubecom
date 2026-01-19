// CLIENT-SIDE MODE: Using localStorage instead of backend API
// Comment out backend imports when using client-side storage
// import { apiClient } from "@/lib/api/client";
// import type { BackendResponse } from "@/lib/types/api";
// import { extractResponseData } from "@/lib/api/response-transformer";
import { cartStorage } from "./storage";
import type { Product } from "@/features/products/types";

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
  product?: Product; // Required in client-side mode, optional for backward compatibility
}

export interface UpdateCartItemParams {
  quantity: number;
}

// CLIENT-SIDE MODE: Using localStorage storage instead of backend API
export const cartApi = {
  /**
   * Get current cart
   */
  async getCart(): Promise<Cart> {
    // Backend version (commented out):
    // const response = await apiClient.get<BackendResponse<Cart>>("/cart");
    // return extractResponseData(response);

    // Client-side version:
    return cartStorage.getCart();
  },

  /**
   * Add item to cart
   * Note: In client-side mode, we need the product object to extract variant info
   */
  async addItem(
    params: AddCartItemParams & { product?: Product }
  ): Promise<Cart> {
    // Backend version (commented out):
    // const response = await apiClient.post<BackendResponse<Cart>>(
    //   "/cart/items",
    //   params
    // );
    // return extractResponseData(response);

    // Client-side version:
    if (!params.product) {
      throw new Error("Product object is required in client-side mode");
    }
    return cartStorage.addItem({
      ...params,
      product: params.product,
    });
  },

  /**
   * Update cart item quantity
   */
  async updateItem(
    itemId: string,
    params: UpdateCartItemParams
  ): Promise<Cart> {
    // Backend version (commented out):
    // const response = await apiClient.patch<BackendResponse<Cart>>(
    //   `/cart/items/${itemId}`,
    //   params
    // );
    // return extractResponseData(response);

    // Client-side version:
    return cartStorage.updateItem(itemId, params);
  },

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<Cart> {
    // Backend version (commented out):
    // const response = await apiClient.delete<BackendResponse<Cart>>(
    //   `/cart/items/${itemId}`
    // );
    // return extractResponseData(response);

    // Client-side version:
    return cartStorage.removeItem(itemId);
  },

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<Cart> {
    // Backend version (commented out):
    // const response = await apiClient.delete<BackendResponse<Cart>>("/cart");
    // return extractResponseData(response);

    // Client-side version:
    return cartStorage.clearCart();
  },
};
