/**
 * useCheckoutOrder Hook
 *
 * Handles order submission and navigation.
 *
 * Responsibilities:
 * - Order submission logic (demo and real)
 * - Cart clearing
 * - Draft clearing
 * - Navigation after order
 * - Error handling
 */

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiPost } from "@/lib/api/request";
import { cartKeys } from "@/features/cart/query-keys";
import { extractErrorMessage } from "@/lib/api/error-handler";
import { DEMO_CHECKOUT } from "@/lib/flags";
import { createDemoOrder } from "@/features/orders/demo/demoOrders";
import { logger } from "@/lib/logger";
import type { CheckoutFormData } from "../types";

// UI Cart Item type (returned by useCart hook)
interface UICartItem {
  id: string;
  productId: string;
  slug: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantId?: string | null;
  variantSku?: string | null;
  selectedOptions?: Record<string, string>;
}

interface UseCheckoutOrderProps {
  items: UICartItem[];
  couponDiscount: number;
  couponCode?: string;
  clearCart: () => Promise<void>;
  clearDraft: () => void;
}

interface UseCheckoutOrderReturn {
  onSubmit: (data: CheckoutFormData) => Promise<void>;
  isOrderPlaced: boolean;
}

/**
 * Hook for managing checkout order submission
 */
export function useCheckoutOrder({
  items,
  couponDiscount,
  couponCode,
  clearCart,
  clearDraft,
}: UseCheckoutOrderProps): UseCheckoutOrderReturn {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);

  const onSubmit = useCallback(
    async (data: CheckoutFormData) => {
      try {
        // Always use form data (user can edit even if address was selected)
        const shippingAddress = {
          firstName: data.firstName,
          lastName: data.lastName,
          phone: data.phone,
          email: data.email || undefined,
          country: data.country,
          city: data.city,
          state: data.state || undefined,
          street1: data.street1,
          postalCode: data.postalCode,
          notes: data.notes || undefined,
        };

        if (DEMO_CHECKOUT) {
          // Demo checkout mode - create order client-side
          logger.debug("Using demo checkout mode");

          const shippingCost =
            data.shippingOption === "pickup"
              ? 0
              : data.shippingOption === "beirut"
              ? 0
              : 5;
          const subtotal = items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          );
          const total = subtotal + shippingCost - couponDiscount;

          const demoOrderItems = items.map((item) => ({
            id: item.id,
            productId: item.productId,
            variantId: item.variantId || item.productId, // Fallback to productId if no variantId
            quantity: item.quantity,
            unitPrice: item.price,
            total: item.price * item.quantity,
            title: item.name,
            attributes: null,
            variant:
              item.variantId && item.variantSku
                ? {
                    id: item.variantId,
                    sku: item.variantSku,
                    image: item.image,
                    options: item.selectedOptions
                      ? Object.entries(item.selectedOptions).map(
                          ([name, value]) => ({ name, value })
                        )
                      : undefined,
                  }
                : undefined,
            product: {
              id: item.productId,
              name: item.name,
              slug: item.slug,
              images: [item.image],
            },
          }));

          const order = createDemoOrder({
            items: demoOrderItems,
            subtotal,
            shippingOption: data.shippingOption,
            shippingCost,
            total,
            discount: couponDiscount,
            couponCode: couponCode ?? null,
            shippingAddress,
          });

          setIsOrderPlaced(true);
          clearDraft();
          await clearCart();
          router.replace(`/order-complete/${order.id}`);
          return;
        }

        // Backend flow - include couponCode when applied
        const orderData = await apiPost<{ orderId: string }>(
          "/checkout/place-order",
          {
            shippingOption: data.shippingOption,
            shippingAddress,
            ...(couponCode && couponCode.trim() && { couponCode: couponCode.trim() }),
          }
        );

        setIsOrderPlaced(true);
        clearDraft();
        queryClient.invalidateQueries({ queryKey: cartKeys.all });

        const orderId = orderData?.orderId;

        if (!orderId) {
          toast.error(
            "Order placed successfully, but order ID is missing. Please contact support."
          );
          return;
        }

        // Redirect to order complete page (token is in httpOnly cookie)
        const redirectUrl = `/order-complete/${orderId}`;
        // Use replace instead of push to prevent back navigation to checkout
        router.replace(redirectUrl);
      } catch (error: unknown) {
        toast.error(
          extractErrorMessage(error, "Failed to place order. Please try again.")
        );
      }
    },
    [items, couponDiscount, couponCode, clearCart, clearDraft, router, queryClient]
  );

  return { onSubmit, isOrderPlaced };
}
