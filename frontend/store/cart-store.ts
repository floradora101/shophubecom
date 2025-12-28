// Zustand store for cart UI state and client-side cart data.
// Cart data is owned by this store (single source of truth for client-side cart).
//
// IMPORTANT: This store manages both UI state and cart data for client-side cart.
// Backend cart API is preserved but commented out in hooks.

import { create } from "zustand";
import { persist } from "zustand/middleware";

// Client-side cart item interfaces
export interface ClientCartItemProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  currency: string;
  images: string[];
}

export interface ClientCartItemVariant {
  id: string;
  sku: string;
  price: number;
  stock: number;
  image?: string | null;
  images?: string[];
  options?: Record<string, string>;
}

export interface ClientCartItem {
  id: string; // Unique identifier for this cart item
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  product: ClientCartItemProduct;
  variant?: ClientCartItemVariant;
  createdAt: string;
}

export interface ClientCart {
  id: string;
  items: ClientCartItem[];
  subtotal: number;
  totalQuantity: number;
  createdAt: string;
  updatedAt: string;
}

interface CartState {
  // UI state
  isOpen: boolean;

  // Cart data
  cart: ClientCart | null;
  isLoading: boolean;

  // UI actions
  open: () => void;
  close: () => void;
  toggle: (open?: boolean) => void;

  // Cart data actions
  initializeCart: () => void;
  addItem: (
    variantId: string,
    quantity: number,
    product: ClientCartItemProduct,
    variant?: ClientCartItemVariant
  ) => void;
  updateItemQuantity: (itemId: string, quantity: number) => void;
  removeItem: (itemId: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // UI state
      isOpen: false,

      // Cart data
      cart: null,
      isLoading: false,

      // UI actions
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: (open) => {
        const target = open ?? !get().isOpen;
        set({ isOpen: target });
      },

      // Cart data actions
      initializeCart: () => {
        const currentCart = get().cart;
        if (!currentCart) {
          // Create empty cart
          const newCart: ClientCart = {
            id: `cart-${Date.now()}`,
            items: [],
            subtotal: 0,
            totalQuantity: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          set({ cart: newCart });
        }
      },

      addItem: (variantId, quantity, product, variant) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        // Check if item with same variant already exists
        const existingItemIndex = currentCart.items.findIndex(
          (item) =>
            item.variantId === variantId && item.productId === product.id
        );

        const updatedItems = [...currentCart.items];

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          updatedItems[existingItemIndex].quantity += quantity;
        } else {
          // Add new item
          const newItem: ClientCartItem = {
            id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            productId: product.id,
            variantId,
            quantity,
            unitPrice: variant?.price ?? product.price,
            product,
            variant,
            createdAt: new Date().toISOString(),
          };
          updatedItems.push(newItem);
        }

        // Calculate totals
        const totalQuantity = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );

        const updatedCart: ClientCart = {
          ...currentCart,
          items: updatedItems,
          subtotal,
          totalQuantity,
          updatedAt: new Date().toISOString(),
        };

        set({ cart: updatedCart });
      },

      updateItemQuantity: (itemId, quantity) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        const updatedItems = currentCart.items.map((item) =>
          item.id === itemId ? { ...item, quantity } : item
        );

        // Calculate totals
        const totalQuantity = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );

        const updatedCart: ClientCart = {
          ...currentCart,
          items: updatedItems,
          subtotal,
          totalQuantity,
          updatedAt: new Date().toISOString(),
        };

        set({ cart: updatedCart });
      },

      removeItem: (itemId) => {
        const currentCart = get().cart;
        if (!currentCart) return;

        const updatedItems = currentCart.items.filter(
          (item) => item.id !== itemId
        );

        // Calculate totals
        const totalQuantity = updatedItems.reduce(
          (sum, item) => sum + item.quantity,
          0
        );
        const subtotal = updatedItems.reduce(
          (sum, item) => sum + item.unitPrice * item.quantity,
          0
        );

        const updatedCart: ClientCart = {
          ...currentCart,
          items: updatedItems,
          subtotal,
          totalQuantity,
          updatedAt: new Date().toISOString(),
        };

        set({ cart: updatedCart });
      },

      clearCart: () => {
        const currentCart = get().cart;
        if (!currentCart) return;

        const clearedCart: ClientCart = {
          ...currentCart,
          items: [],
          subtotal: 0,
          totalQuantity: 0,
          updatedAt: new Date().toISOString(),
        };

        set({ cart: clearedCart });
      },
    }),
    {
      name: "client-cart-storage",
      partialize: (state) => ({ cart: state.cart }),
    }
  )
);
