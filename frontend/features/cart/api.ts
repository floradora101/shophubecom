import { apiGet, apiPost, apiPatch, apiDelete } from "@/lib/api/request";

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
    return apiGet<Cart>("/cart");
  },

  /**
   * Add item to cart
   */
  async addItem(params: AddCartItemParams): Promise<Cart> {
    return apiPost<Cart>("/cart/items", params);
  },

  /**
   * Update cart item quantity
   */
  async updateItem(
    itemId: string,
    params: UpdateCartItemParams
  ): Promise<Cart> {
    return apiPatch<Cart>(`/cart/items/${itemId}`, params);
  },

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<Cart> {
    return apiDelete<Cart>(`/cart/items/${itemId}`);
  },

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<Cart> {
    return apiDelete<Cart>("/cart");
  },
};
