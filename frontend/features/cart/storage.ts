/**
 * Client-side cart storage using localStorage
 *
 * This file provides a localStorage-based cart implementation that works
 * without a backend. The cart structure matches the backend Cart interface
 * for seamless transition when backend is available.
 */

import type { Cart, CartItem, AddCartItemParams, UpdateCartItemParams } from "./api";
import type { Product } from "@/features/products/types";

const CART_STORAGE_KEY = "shophub_cart";

/**
 * Generate a unique ID for cart items
 */
function generateId(): string {
  return `cart_item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get cart from localStorage
 */
function getCartFromStorage(): Cart | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return null;
    return JSON.parse(stored) as Cart;
  } catch (error) {
    console.error("Error reading cart from localStorage:", error);
    return null;
  }
}

/**
 * Save cart to localStorage
 */
function saveCartToStorage(cart: Cart): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch (error) {
    console.error("Error saving cart to localStorage:", error);
  }
}

/**
 * Initialize empty cart
 */
function createEmptyCart(): Cart {
  return {
    id: `cart_${Date.now()}`,
    userId: null,
    items: [],
    subtotal: 0,
    totalQuantity: 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Get or create cart
 */
function getOrCreateCart(): Cart {
  const existing = getCartFromStorage();
  if (existing) {
    return existing;
  }
  const newCart = createEmptyCart();
  saveCartToStorage(newCart);
  return newCart;
}

/**
 * Calculate cart totals
 */
function calculateTotals(items: CartItem[]): { subtotal: number; totalQuantity: number } {
  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  return { subtotal, totalQuantity };
}

/**
 * Find product and variant data from product object
 * This is a helper to extract variant info when adding items
 */
function getVariantFromProduct(
  product: Product,
  variantId: string
): { variant: NonNullable<Product["variants"]>[0]; productData: any } | null {
  const variant = product.variants?.find((v) => v.id === variantId);
  if (!variant) return null;

  return {
    variant,
    productData: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: variant.price || product.price,
      currency: product.currency || "USD",
      images: variant.images || product.images || [],
    },
  };
}

/**
 * Client-side cart storage API
 * Mirrors the backend API structure for easy switching
 */
export const cartStorage = {
  /**
   * Get current cart
   */
  async getCart(): Promise<Cart> {
    return getOrCreateCart();
  },

  /**
   * Add item to cart
   * Note: This requires the full product object to extract variant/product info
   */
  async addItem(
    params: AddCartItemParams & { product: Product }
  ): Promise<Cart> {
    const cart = getOrCreateCart();
    const { variantId, quantity = 1, product } = params;

    // Find variant in product
    const variantData = getVariantFromProduct(product, variantId);
    if (!variantData) {
      throw new Error(`Variant ${variantId} not found in product`);
    }

    const { variant, productData } = variantData;
    const unitPrice = variant.price || product.price;

    // Check if item already exists (same variantId)
    const existingItemIndex = cart.items.findIndex(
      (item) => item.variantId === variantId && item.productId === product.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const existingItem = cart.items[existingItemIndex];
      cart.items[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + quantity,
      };
    } else {
      // Create new cart item
      const newItem: CartItem = {
        id: generateId(),
        cartId: cart.id,
        productId: product.id,
        variantId: variantId,
        quantity,
        unitPrice,
        product: productData,
        variant: {
          id: variantId,
          sku: variant.sku,
          price: unitPrice,
          stock: variant.stock,
          image: variant.image,
          images: variant.images,
          options: variant.options,
        },
      };
      cart.items.push(newItem);
    }

    // Recalculate totals
    const totals = calculateTotals(cart.items);
    cart.subtotal = totals.subtotal;
    cart.totalQuantity = totals.totalQuantity;
    cart.updatedAt = new Date().toISOString();

    saveCartToStorage(cart);
    return cart;
  },

  /**
   * Update cart item quantity
   */
  async updateItem(itemId: string, params: UpdateCartItemParams): Promise<Cart> {
    const cart = getOrCreateCart();
    const itemIndex = cart.items.findIndex((item) => item.id === itemId);

    if (itemIndex === -1) {
      throw new Error(`Cart item ${itemId} not found`);
    }

    cart.items[itemIndex] = {
      ...cart.items[itemIndex],
      quantity: Math.max(1, params.quantity),
    };

    // Recalculate totals
    const totals = calculateTotals(cart.items);
    cart.subtotal = totals.subtotal;
    cart.totalQuantity = totals.totalQuantity;
    cart.updatedAt = new Date().toISOString();

    saveCartToStorage(cart);
    return cart;
  },

  /**
   * Remove item from cart
   */
  async removeItem(itemId: string): Promise<Cart> {
    const cart = getOrCreateCart();
    cart.items = cart.items.filter((item) => item.id !== itemId);

    // Recalculate totals
    const totals = calculateTotals(cart.items);
    cart.subtotal = totals.subtotal;
    cart.totalQuantity = totals.totalQuantity;
    cart.updatedAt = new Date().toISOString();

    saveCartToStorage(cart);
    return cart;
  },

  /**
   * Clear entire cart
   */
  async clearCart(): Promise<Cart> {
    const newCart = createEmptyCart();
    saveCartToStorage(newCart);
    return newCart;
  },
};
