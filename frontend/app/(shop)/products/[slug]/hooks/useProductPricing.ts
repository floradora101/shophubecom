/**
 * useProductPricing Hook
 *
 * Handles product pricing, discount, and stock calculations.
 *
 * Responsibilities:
 * - Calculate effective price (variant or product)
 * - Compute discount information
 * - Calculate stock information
 * - Determine cart availability
 */

import { useMemo } from "react";
import { getEffectiveStock } from "@/features/products/utils/inventory";
import { getDiscountInfo } from "@/lib/utils/products";
import type { Product } from "@/features/products/types";

interface SelectedVariant {
  id?: string;
  price?: number;
  stock?: number;
}

interface UseProductPricingProps {
  product: Product | null;
  selectedVariant: SelectedVariant | null;
  isInvalidSelection: boolean;
}

interface UseProductPricingReturn {
  effectivePrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  originalPrice: number | null;
  variantStock: number;
  isOutOfStock: boolean;
  isUnavailable: boolean;
  effectiveStock: number;
  canAddToCart: boolean;
}

/**
 * Hook for calculating product pricing and stock information
 */
export function useProductPricing({
  product,
  selectedVariant,
  isInvalidSelection,
}: UseProductPricingProps): UseProductPricingReturn {
  // Price and stock calculations
  const effectivePrice = useMemo(
    () => selectedVariant?.price ?? product?.price ?? 0,
    [selectedVariant?.price, product?.price]
  );

  // Use getDiscountInfo for base product discount, then adjust for variant pricing
  const baseDiscountInfo = useMemo(() => {
    if (!product) {
      return {
        hasDiscount: false,
        discountPercent: 0,
        originalPrice: null,
        savings: 0,
      };
    }
    return getDiscountInfo(product);
  }, [product]);

  // For variants, we need to calculate discount relative to the effective price
  // If variant has different pricing, adjust the discount calculation
  const { hasDiscount, discountPercent, originalPrice } = useMemo(() => {
    let hasDiscount = baseDiscountInfo.hasDiscount;
    let discountPercent = baseDiscountInfo.discountPercent;
    let originalPrice = baseDiscountInfo.originalPrice;

    // If we have a selected variant with different price, recalculate discount
    if (
      selectedVariant &&
      product?.originalPrice &&
      product.originalPrice > effectivePrice
    ) {
      originalPrice = product.originalPrice;
      discountPercent = Math.round(
        ((originalPrice - effectivePrice) / originalPrice) * 100
      );
      hasDiscount = true;
    }

    return { hasDiscount, discountPercent, originalPrice };
  }, [selectedVariant, product?.originalPrice, effectivePrice, baseDiscountInfo]);

  const variantStock = useMemo(
    () => selectedVariant?.stock ?? 0,
    [selectedVariant?.stock]
  );

  const isOutOfStock = useMemo(
    () => selectedVariant !== null && variantStock <= 0,
    [selectedVariant, variantStock]
  );

  const isUnavailable = isInvalidSelection;

  const effectiveStock = useMemo(() => {
    if (selectedVariant) return variantStock;
    if (product) return getEffectiveStock(product);
    return 0;
  }, [selectedVariant, variantStock, product]);

  const canAddToCart = useMemo(
    () => selectedVariant !== null && variantStock > 0 && !isUnavailable,
    [selectedVariant, variantStock, isUnavailable]
  );

  return {
    effectivePrice,
    hasDiscount,
    discountPercent,
    originalPrice,
    variantStock,
    isOutOfStock,
    isUnavailable,
    effectiveStock,
    canAddToCart,
  };
}
