/**
 * Unified Cart Hook
 *
 * React Query owns cart data (single source of truth).
 * Zustand owns UI-only state (isOpen).
 *
 * Features:
 * - Single source of truth: React Query cache (["cart"])
 * - Server-owned cart state (both guest and authenticated)
 * - Backend handles guest→user merge on login automatically
 * - Cart invalidation on login/logout ensures fresh data
 *
 * Expected Behavior:
 * - Guest adds items → stored on server with HttpOnly cookie
 * - Guest logs in → backend merges guest cart into user cart, frontend invalidates ["cart"]
 * - User adds items → stored in user cart on server
 * - User logs out → backend creates new guest cart, frontend invalidates ["cart"]
 * - User logs back in → sees their previous user cart items after invalidation
 */

import { useCallback, useMemo, useEffect } from "react";
import { useAuthStore, selectAuthUser } from "@/store/auth-store";
import { useCartStore, type ClientCartItem } from "@/store/cart-store";
import {
  useCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from "./queries";
import type { Product } from "@/features/products/types";
import { getAllProductImages } from "@/features/products/utils/product-images";
import type { CartItem as ServerCartItem } from "./api";

interface AddItemOptions {
  quantity?: number;
  priceOverride?: number;
  color?: string | null;
  storage?: string | null;
  image?: string | null;
  selectedOptions?: Record<string, string>;
  variantId?: string | null;
  variantSku?: string | null;
}

/**
 * Convert server cart item to UI cart item format
 *
 * Item identifiers:
 * - id: serverItem.id (stable server ID)
 * - key: serverItem.id (same as id for consistency)
 *
 * Note: For existing items, React keys are stable. For new items added optimistically,
 * temp IDs are used initially and replaced with server IDs in onSuccess, causing
 * a key change for that specific item (acceptable trade-off for optimistic UX).
 */
function serverItemToUIItem(serverItem: ServerCartItem) {
  const variant = serverItem.variant;
  const product = serverItem.product;

  // Use serverItem.id as the stable identifier
  // This prevents React key changes between optimistic updates and server responses
  const id = serverItem.id;
  const key = serverItem.id; // Same as id for consistency

  return {
    id,
    key, // Same as id - stable React key
    productId: serverItem.productId,
    slug: product?.slug ?? "",
    name: product?.name ?? "Unknown Product",
    price: serverItem.unitPrice,
    quantity: serverItem.quantity,
    image:
      variant?.image ??
      variant?.images?.[0] ??
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E",
    color: variant?.options?.color,
    storage: variant?.options?.storage,
    variantId: serverItem.variantId,
    variantSku: variant?.sku ?? null,
    selectedOptions:
      variant?.options && Object.keys(variant.options).length > 0
        ? variant.options
        : undefined,
  };
}

function clientItemToUIItem(clientItem: ClientCartItem) {
  const variant = clientItem.variant;
  const product = clientItem.product;

  // Use clientItem.id as the stable identifier
  // This prevents React key changes between updates
  const id = clientItem.id;
  const key = clientItem.id; // Same as id for consistency

  return {
    id,
    key, // Same as id - stable React key
    productId: clientItem.productId,
    slug: product?.slug ?? "",
    name: product?.name ?? "Unknown Product",
    price: clientItem.unitPrice,
    quantity: clientItem.quantity,
    image:
      variant?.image ??
      variant?.images?.[0] ??
      product?.images?.[0] ??
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23f3f4f6' width='200' height='200'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E",
    color: variant?.options?.color,
    storage: variant?.options?.storage,
    variantId: clientItem.variantId,
    variantSku: variant?.sku ?? null,
    selectedOptions:
      variant?.options && Object.keys(variant.options).length > 0
        ? variant.options
        : undefined,
  };
}

/**
 * Main cart hook - Client-side cart store owns data, Zustand owns UI state
 */
export function useCart() {
  const user = useAuthStore(selectAuthUser);
  const isAuthenticated = !!user;

  // UI state from Zustand
  const isOpen = useCartStore((state) => state.isOpen);
  const openCart = useCartStore((state) => state.open);
  const closeCart = useCartStore((state) => state.close);
  const toggleCart = useCartStore((state) => state.toggle);

  // Shipping state from Zustand
  const shippingOption = useCartStore((state) => state.shippingOption);
  const setShippingOption = useCartStore((state) => state.setShippingOption);

  // Cart data operations from Zustand
  const cart = useCartStore((state) => state.cart);
  const isLoading = useCartStore((state) => state.isLoading);
  const initializeCart = useCartStore((state) => state.initializeCart);
  const addItemToStore = useCartStore((state) => state.addItem);
  const updateItemQuantity = useCartStore((state) => state.updateItemQuantity);
  const removeItemFromStore = useCartStore((state) => state.removeItem);
  const clearCartStore = useCartStore((state) => state.clearCart);

  // Initialize cart on first use
  useEffect(() => {
    initializeCart();
  }, [initializeCart]);

  // Legacy mutations - kept for backward compatibility but not used
  // const addItemMutation = useAddCartItemMutation();
  // const updateItemMutation = useUpdateCartItemMutation();
  // const removeItemMutation = useRemoveCartItemMutation();
  // const clearCartMutation = useClearCartMutation();

  // Legacy React Query - commented out for client-side
  // const { data: cart, isLoading } = useCartQuery();

  /**
   * Convert client cart items to UI format
   *
   * All items use clientItem.id as the stable identifier.
   * Product/variant data is stored locally with cart items.
   */
  const items = useMemo(
    () => cart?.items.map(clientItemToUIItem) ?? [],
    [cart?.items]
  );

  /**
   * Add item to cart
   * variantId is always required (even for single variant products)
   * Now extracts product and variant data to store locally
   */
  const addItem = useCallback(
    async (product: Product, options?: AddItemOptions) => {
      if (!options?.variantId) {
        throw new Error("variantId is required");
      }

      // Find the selected variant
      const selectedVariant = product.variants?.find(
        (v) => v.id === options.variantId
      );

      // Create cart item product data
      const cartProduct = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        currency: product.currency,
        images: getAllProductImages(product),
      };

      // Create cart item variant data (if exists)
      const cartVariant = selectedVariant
        ? {
            id: selectedVariant.id || "",
            sku: selectedVariant.sku,
            price: selectedVariant.price,
            stock: selectedVariant.stock,
            image: selectedVariant.image,
            images: selectedVariant.images,
            options: selectedVariant.options,
          }
        : undefined;

      // Add to cart store
      addItemToStore(
        options.variantId,
        options?.quantity ?? 1,
        cartProduct,
        cartVariant
      );

      openCart();
    },
    [addItemToStore, openCart]
  );

  /**
   * Update item quantity (absolute qty)
   *
   * Uses itemId from client (clientItem.id) as the identifier.
   * Client-side cart handles all operations locally.
   */
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      updateItemQuantity(itemId, Math.max(1, quantity));
    },
    [updateItemQuantity]
  );

  /**
   * Remove item from cart
   *
   * Uses itemId from client (clientItem.id) as the identifier.
   * Client-side cart handles all operations locally.
   */
  const removeItem = useCallback(
    async (itemId: string) => {
      removeItemFromStore(itemId);
    },
    [removeItemFromStore]
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    clearCartStore();
  }, [clearCartStore]);

  // Computed values
  const totalItems = cart?.totalQuantity ?? 0;
  const subtotal = cart?.subtotal ?? 0;

  return {
    // State
    items,
    isOpen,
    totalItems,
    subtotal,
    isLoading,
    isAuthenticated,
    shippingOption,

    // Actions
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    openCart,
    closeCart,
    toggleCart,
    setShippingOption,
  };
}
