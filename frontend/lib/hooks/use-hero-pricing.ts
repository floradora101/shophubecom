import { useMemo } from "react";
import type { Product } from "@/features/products/types";

// Professional pricing hook for hero slides
export function useHeroPricing(product?: Product) {
  return useMemo(() => {
    if (!product) {
      return {
        currentPrice: 0,
        originalPrice: undefined,
        discountPercent: 0,
        savingsAmount: 0,
        hasDiscount: false,
        discountType: "none" as const,
        isLimitedTime: false,
        currency: "USD",
      };
    }

    // Get current price (use min price if variants exist)
    const currentPrice = product.price;

    // Calculate original price and discount logic
    let originalPrice: number | undefined;
    let discountPercent = 0;
    let discountType: "percentage" | "fixed" | "none" = "none";

    // Priority: product.discount?.originalPrice > product.originalPrice > calculated from discountValue
    if (product.discount?.originalPrice) {
      originalPrice = product.discount.originalPrice;
      discountType = "percentage";
    } else if (product.originalPrice) {
      originalPrice = product.originalPrice;
      discountType = "percentage";
    } else if (product.discountValue && product.discountValue > 0) {
      // Calculate original price from discount value
      if (product.discountType === "PERCENTAGE") {
        discountPercent = product.discountValue;
        originalPrice = currentPrice / (1 - discountPercent / 100);
        discountType = "percentage";
      } else {
        // Fixed amount discount
        originalPrice = currentPrice + product.discountValue;
        discountType = "fixed";
      }
    }

    // Calculate discount percentage if not already set
    if (originalPrice && !discountPercent && discountType !== "fixed") {
      discountPercent = Math.round(
        ((originalPrice - currentPrice) / originalPrice) * 100
      );
    }

    // Calculate savings amount
    const savingsAmount = originalPrice ? originalPrice - currentPrice : 0;

    // Determine if there's an active discount
    const hasDiscount = !!(
      originalPrice &&
      originalPrice > currentPrice &&
      (product.discount?.isOnSale ?? product.isOnSale ?? discountPercent > 0)
    );

    // Check if it's limited time (has end date)
    const isLimitedTime = !!product.saleEndsAt;

    // Get currency (default to USD)
    const currency = product.currency || "USD";

    return {
      currentPrice,
      originalPrice,
      discountPercent,
      savingsAmount,
      hasDiscount,
      discountType,
      isLimitedTime,
      currency,
    };
  }, [product]);
}
