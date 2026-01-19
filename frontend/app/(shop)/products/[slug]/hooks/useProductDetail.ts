/**
 * useProductDetail Hook
 *
 * Handles product loading and category lookup.
 *
 * Responsibilities:
 * - Load product from mock data by slug
 * - Ensure default variant exists for products without variants
 * - Get category for breadcrumbs
 */

import { useMemo } from "react";
import {
  mockProducts,
  mockProductToProduct,
  mockCategories,
  mockCategoryToCategory,
} from "@/lib/mock-data/mock-data";
import { PLACEHOLDER_IMAGE } from "@/lib/utils/products";
import type { Product, Category } from "@/features/products/types";

interface UseProductDetailProps {
  slug: string;
}

interface UseProductDetailReturn {
  product: Product | null;
  category: Category | null;
}

/**
 * Hook for loading product and category data
 */
export function useProductDetail({
  slug,
}: UseProductDetailProps): UseProductDetailReturn {
  // Find product from mock data
  const product = useMemo(() => {
    const mockProduct = mockProducts.find((p) => p.slug === slug);
    if (!mockProduct) return null;

    const converted = mockProductToProduct(mockProduct);

    // Ensure defaultVariant exists for products without variants
    if (!converted.variants?.length) {
      converted.defaultVariant = {
        id: `${converted.id}-default`,
        image: PLACEHOLDER_IMAGE,
        images: [PLACEHOLDER_IMAGE],
      };
    }

    return converted;
  }, [slug]);

  // Get category for breadcrumbs
  const category = useMemo(() => {
    if (!product?.categoryId) return null;
    const mockCategory = mockCategories.find(
      (c) => c.slug === product.categoryId
    );
    return mockCategory ? mockCategoryToCategory(mockCategory) : null;
  }, [product]);

  return {
    product,
    category,
  };
}
