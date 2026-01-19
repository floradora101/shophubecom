/**
 * useVariantLogic Hook
 *
 * Handles complex variant computation logic.
 *
 * Responsibilities:
 * - Calculate option keys from variants
 * - Calculate available option values with stock totals
 * - Find selected variant based on user selections
 * - Determine selection completion and validity status
 */

import { useMemo } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/utils/products";
import type { Product } from "@/features/products/types";

interface UseVariantLogicProps {
  product: Product | null;
  selectedOptionsState: Record<string, string>;
}

interface UseVariantLogicReturn {
  selectedVariant: {
    id?: string;
    sku: string;
    price: number;
    stock: number;
    image?: string;
    images?: string[];
    options?: Record<string, string>;
  } | null;
  optionKeys: string[];
  allOptionValues: Record<string, { value: string; totalStock: number }[]>;
  isUserSelectionComplete: boolean;
  isInvalidSelection: boolean;
}

/**
 * Hook for computing variant logic and selection state
 */
export function useVariantLogic({
  product,
  selectedOptionsState,
}: UseVariantLogicProps): UseVariantLogicReturn {
  const {
    selectedVariant,
    optionKeys,
    allOptionValues,
    isUserSelectionComplete,
    isInvalidSelection,
  } = useMemo(() => {
    if (!product)
      return {
        selectedVariant: null,
        optionKeys: [],
        allOptionValues: {},
        isUserSelectionComplete: false,
        isInvalidSelection: false,
      };

    const variants = product.variants || [];
    const keys = new Set<string>();

    variants.forEach((variant) => {
      Object.keys(variant.options || {}).forEach((key) => keys.add(key));
    });

    const prioritized = ["color", "storage", "size"];
    const rest = Array.from(keys)
      .filter((key) => !prioritized.includes(key))
      .sort();
    const optionKeys = [...prioritized.filter((key) => keys.has(key)), ...rest];

    // Calculate option values with stock
    const optionMap = new Map<string, Map<string, number>>();
    variants.forEach((variant) => {
      const stock = variant.stock ?? 0;
      Object.entries(variant.options || {}).forEach(([key, value]) => {
        if (!optionMap.has(key)) optionMap.set(key, new Map());
        const valueMap = optionMap.get(key)!;
        valueMap.set(value, (valueMap.get(value) ?? 0) + stock);
      });
    });

    const allOptionValues: Record<
      string,
      { value: string; totalStock: number }[]
    > = {};
    optionKeys.forEach((key) => {
      const valueMap = optionMap.get(key) ?? new Map();
      allOptionValues[key] = Array.from(valueMap.entries()).map(
        ([value, totalStock]) => ({
          value,
          totalStock,
        })
      );
    });

    // Find selected variant
    const selectionEntries = Object.entries(selectedOptionsState).filter(
      ([, v]) => Boolean(v)
    );
    const candidateVariants = variants.filter((variant) =>
      selectionEntries.every(([key, value]) => variant.options?.[key] === value)
    );

    const isUserSelectionComplete =
      optionKeys.length > 0 &&
      optionKeys.every((k) => Boolean(selectedOptionsState[k]));
    const isInvalidSelection =
      isUserSelectionComplete && candidateVariants.length === 0;

    let selectedVariant = null;
    if (variants.length > 0) {
      if (isInvalidSelection) {
        selectedVariant = null;
      } else {
        const inStockCandidate = candidateVariants.find(
          (v) => (v.stock ?? 0) > 0
        );
        if (inStockCandidate) selectedVariant = inStockCandidate;
        else if (candidateVariants[0]) selectedVariant = candidateVariants[0];
        else
          selectedVariant =
            variants.find((v) => (v.stock ?? 0) > 0) ?? variants[0] ?? null;
      }
    } else {
      // No variants - create a default variant for products without explicit variants
      selectedVariant = {
        id: `${product?.id}-default`,
        sku: `${product?.id}-default`,
        price: product?.price ?? 0,
        stock: product?.stock ?? 100,
        image: product?.defaultVariant?.image ?? PLACEHOLDER_IMAGE,
        images: product?.defaultVariant?.images ?? [PLACEHOLDER_IMAGE],
        options: {},
      };
    }

    return {
      selectedVariant,
      optionKeys,
      allOptionValues,
      isUserSelectionComplete,
      isInvalidSelection,
    };
  }, [product, selectedOptionsState]);

  return {
    selectedVariant,
    optionKeys,
    allOptionValues,
    isUserSelectionComplete,
    isInvalidSelection,
  };
}
