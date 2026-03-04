/**
 * Unified Cart Hook
 *
 * React Query owns cart data (single source of truth).
 * Zustand owns UI-only state (isOpen, shippingOption).
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

import { useCallback, useMemo } from "react";
import { useAuthStore, selectAuthUser } from "@/store/auth-store";
import { useCartStore } from "@/store/cart-store";
import {
  useCartQuery,
  useAddCartItemMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} from "./queries";
import type { Product } from "@/features/products/types";
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


/**
 * Main cart hook - React Query owns data, Zustand owns UI state
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

  // Cart data from React Query (single source of truth)
  const { data: cart, isLoading } = useCartQuery();

  // Mutations
  const addItemMutation = useAddCartItemMutation();
  const updateItemMutation = useUpdateCartItemMutation();
  const removeItemMutation = useRemoveCartItemMutation();
  const clearCartMutation = useClearCartMutation();

  /**
   * Convert server cart items to UI format
   */
  const items = useMemo(
    () => cart?.items.map(serverItemToUIItem) ?? [],
    [cart?.items]
  );

  /**
   * Add item to cart
   * variantId is always required (even for single variant products)
   */
  const addItem = useCallback(
    async (product: Product, options?: AddItemOptions) => {
      if (!options?.variantId) {
        throw new Error("variantId is required");
      }

      await addItemMutation.mutateAsync({
        variantId: options.variantId,
        quantity: options?.quantity ?? 1,
      });

      openCart();
    },
    [addItemMutation, openCart]
  );

  /**
   * Update item quantity (absolute qty)
   */
  const updateQuantity = useCallback(
    async (itemId: string, quantity: number) => {
      await updateItemMutation.mutateAsync({
        itemId,
        params: { quantity: Math.max(1, quantity) },
      });
    },
    [updateItemMutation]
  );

  /**
   * Remove item from cart
   */
  const removeItem = useCallback(
    async (itemId: string) => {
      await removeItemMutation.mutateAsync(itemId);
    },
    [removeItemMutation]
  );

  /**
   * Clear entire cart
   */
  const clearCart = useCallback(async () => {
    await clearCartMutation.mutateAsync();
  }, [clearCartMutation]);

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
