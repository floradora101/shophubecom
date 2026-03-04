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
import { useProductQuery } from "@/features/products/queries";
import { useCategoryQuery } from "@/features/categories/queries";
import { PLACEHOLDER_IMAGE } from "@/lib/utils/products";
import type { Product, Category } from "@/features/products/types";
import { USE_MOCKS } from "@/lib/flags";

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
  // Fetch product from API
  const { data: apiProduct } = useProductQuery(slug);

  // Use mock product if mocks are enabled
  const mockProduct = useMemo(() => {
    if (!USE_MOCKS) return null;
    return mockProducts.find((p) => p.slug === slug);
  }, [slug]);

  // Get product from API or mocks
  const product = useMemo(() => {
    let productData: Product | null = null;

    if (USE_MOCKS && mockProduct) {
      productData = mockProductToProduct(mockProduct);
    } else if (apiProduct) {
      productData = apiProduct;
    }

    if (!productData) return null;

    // Ensure defaultVariant exists for products without variants
    if (!productData.variants?.length) {
      productData.defaultVariant = {
        id: `${productData.id}-default`,
        image: PLACEHOLDER_IMAGE,
        images: [PLACEHOLDER_IMAGE],
      };
    }

    return productData;
  }, [apiProduct, mockProduct]);

  // Fetch category from API if product has categoryId
  const categoryIdOrSlug = product?.categoryId;
  const { data: apiCategory } = useCategoryQuery(
    categoryIdOrSlug || ''
  );

  // Get category for breadcrumbs
  const category = useMemo(() => {
    if (!product?.categoryId) return null;

    if (USE_MOCKS) {
      const mockCategory = mockCategories.find(
        (c) => c.slug === product.categoryId
      );
      return mockCategory ? mockCategoryToCategory(mockCategory) : null;
    }

    return apiCategory || null;
  }, [product, apiCategory]);

  return {
    product,
    category,
  };
}
