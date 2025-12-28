import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cartApi,
  type Cart,
  type AddCartItemParams,
  type UpdateCartItemParams,
} from "./api";
import { cartKeys } from "./query-keys";

/**
 * React Query hook to fetch current cart
 * Backend handles identification via cookies/JWT automatically
 *
 * IMPORTANT: Query is ALWAYS enabled regardless of auth state.
 * AuthProvider invalidates ["cart"] on login/logout, so we don't need aggressive refetching.
 */
export function useCartQuery() {
  return useQuery<Cart>({
    queryKey: cartKeys.all,
    queryFn: () => cartApi.getCart(),
    staleTime: 30_000, // Consider data fresh for 30s - reduces over-fetching
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes (formerly cacheTime)
    refetchOnMount: false, // Don't refetch on mount - rely on cache + invalidation
    refetchOnWindowFocus: false, // Not needed - invalidation handles freshness
    enabled: true, // ALWAYS enabled - never disabled by auth state
    retry: false, // Let errors propagate
  });
}

/**
 * Mutation to add item to cart
 * Backend handles identification automatically
 */
export function useAddCartItemMutation() {
  const queryClient = useQueryClient();
  const queryKey = cartKeys.all;

  return useMutation({
    mutationFn: async (params: AddCartItemParams) => {
      return cartApi.addItem(params);
    },
    onMutate: async (params) => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });

      const previousCart = queryClient.getQueryData<Cart>(queryKey);

      if (previousCart) {
        const addQuantity = params.quantity || 1;
        const existingItem = previousCart.items.find(
          (item) => item.variantId === params.variantId
        );

        // Only optimistically update if item already exists (avoid fake items with unitPrice=0)
        if (existingItem) {
          // Use functional update to avoid stomping on newer cache
          queryClient.setQueryData<Cart>(queryKey, (prev) => {
            if (!prev) return prev;

            return {
              ...prev,
              items: prev.items.map((item) =>
                item.variantId === params.variantId
                  ? {
                      ...item,
                      quantity: item.quantity + addQuantity,
                    }
                  : item
              ),
              // Update totalQuantity optimistically
              totalQuantity: prev.totalQuantity + addQuantity,
              // Only update subtotal if we have reliable unitPrice
              ...(existingItem.unitPrice > 0 && {
                subtotal: prev.subtotal + existingItem.unitPrice * addQuantity,
              }),
            };
          });
        }
        // If item doesn't exist, skip optimistic add - let server response handle it
        // This avoids "Unknown Product" flicker and wrong subtotals
      }

      return { previousCart };
    },
    onError: (_error, _params, context) => {
      if (context?.previousCart) {
        // Rollback on error using functional update
        queryClient.setQueryData<Cart>(queryKey, context.previousCart);
      }
    },
    onSuccess: (data) => {
      // Set query data to server response (replaces optimistic update)
      queryClient.setQueryData<Cart>(queryKey, data);
    },
  });
}

/**
 * Mutation to update cart item quantity
 * Backend handles identification automatically
 */
export function useUpdateCartItemMutation() {
  const queryClient = useQueryClient();
  const queryKey = cartKeys.all;

  return useMutation({
    mutationFn: async ({
      itemId,
      params,
    }: {
      itemId: string;
      params: UpdateCartItemParams;
    }) => {
      return cartApi.updateItem(itemId, params);
    },
    onMutate: async ({ itemId, params }) => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<Cart>(queryKey);

      if (previousCart) {
        const itemToUpdate = previousCart.items.find(
          (item) => item.id === itemId
        );
        const quantityDelta = params.quantity - (itemToUpdate?.quantity || 0);
        const unitPrice = itemToUpdate?.unitPrice;

        // Use functional update to avoid stomping on newer cache
        queryClient.setQueryData<Cart>(queryKey, (prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            items: prev.items.map((item) =>
              item.id === itemId ? { ...item, quantity: params.quantity } : item
            ),
            // Update totalQuantity correctly
            totalQuantity: prev.totalQuantity + quantityDelta,
            // Only update subtotal if we have reliable unitPrice
            ...(unitPrice &&
              unitPrice > 0 && {
                subtotal: prev.subtotal + unitPrice * quantityDelta,
              }),
          };
        });
      }

      return { previousCart };
    },
    onError: (_error, _params, context) => {
      if (context?.previousCart) {
        // Rollback on error
        queryClient.setQueryData<Cart>(queryKey, context.previousCart);
      }
    },
    onSuccess: (data) => {
      // Set query data to server response (replaces optimistic update)
      queryClient.setQueryData<Cart>(queryKey, data);
    },
  });
}

/**
 * Mutation to remove item from cart
 * Backend handles identification automatically and returns full Cart
 */
export function useRemoveCartItemMutation() {
  const queryClient = useQueryClient();
  const queryKey = cartKeys.all;

  return useMutation({
    mutationFn: async (itemId: string) => {
      return cartApi.removeItem(itemId);
    },
    onMutate: async (itemId) => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<Cart>(queryKey);

      if (previousCart) {
        const itemToRemove = previousCart.items.find(
          (item) => item.id === itemId
        );
        const quantityToRemove = itemToRemove?.quantity || 0;
        const unitPrice = itemToRemove?.unitPrice;

        // Use functional update to avoid stomping on newer cache
        queryClient.setQueryData<Cart>(queryKey, (prev) => {
          if (!prev) return prev;

          return {
            ...prev,
            items: prev.items.filter((item) => item.id !== itemId),
            // Update totalQuantity correctly
            totalQuantity: prev.totalQuantity - quantityToRemove,
            // Only update subtotal if we have reliable unitPrice
            ...(unitPrice &&
              unitPrice > 0 && {
                subtotal: prev.subtotal - unitPrice * quantityToRemove,
              }),
          };
        });
      }

      return { previousCart };
    },
    onError: (_error, _params, context) => {
      if (context?.previousCart) {
        // Rollback on error
        queryClient.setQueryData<Cart>(queryKey, context.previousCart);
      }
    },
    onSuccess: (data) => {
      // Backend returns full Cart - set it directly (replaces optimistic update)
      if (data) {
        queryClient.setQueryData<Cart>(queryKey, data);
      }
    },
  });
}

/**
 * Mutation to clear entire cart
 * Backend handles identification automatically and returns full Cart
 */
export function useClearCartMutation() {
  const queryClient = useQueryClient();
  const queryKey = cartKeys.all;

  return useMutation({
    mutationFn: async () => {
      return cartApi.clearCart();
    },
    onMutate: async () => {
      // Cancel outgoing queries to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey });
      const previousCart = queryClient.getQueryData<Cart>(queryKey);

      // Use functional update to avoid stomping on newer cache
      queryClient.setQueryData<Cart>(queryKey, (prev) => {
        if (!prev) return prev;

        return {
          ...prev,
          items: [],
          subtotal: 0,
          totalQuantity: 0,
        };
      });

      return { previousCart };
    },
    onError: (_error, _params, context) => {
      if (context?.previousCart) {
        // Rollback on error
        queryClient.setQueryData<Cart>(queryKey, context.previousCart);
      }
    },
    onSuccess: (data) => {
      // Backend returns full Cart - set it directly (replaces optimistic update)
      if (data) {
        queryClient.setQueryData<Cart>(queryKey, data);
      }
    },
  });
}
