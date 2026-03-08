/**
 * useProductDetail Hook
 *
 * Handles product loading and category lookup.
 *
 * Responsibilities:
 * - Load product from mock data or API by slug
 * - Ensure default variant exists for products without variants
 * - Get category for breadcrumbs
 *
 * Mock data loaded via dynamic import() so it is tree-shaken from production.
 */

import { useMemo, useState, useEffect } from "react";
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
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  refetch: () => void;
}

/**
 * Hook for loading product and category data
 */
export function useProductDetail({
  slug,
}: UseProductDetailProps): UseProductDetailReturn {
  const {
    data: apiProduct,
    isLoading: isQueryLoading,
    isError: isQueryError,
    error: queryError,
    refetch,
  } = useProductQuery(slug, { enabled: !USE_MOCKS && !!slug });
  const [mockProductData, setMockProductData] = useState<{
    product: Product | null;
    category: Category | null;
  }>({ product: null, category: null });
  const [mockLoading, setMockLoading] = useState(false);

  useEffect(() => {
    if (!USE_MOCKS || !slug) return;
    let cancelled = false;
    setMockLoading(true);
    import("@/lib/mock-data/mock-data")
      .then(
        ({ mockProducts, mockProductToProduct, mockCategories, mockCategoryToCategory }) => {
          const mp = mockProducts.find((p) => p.slug === slug);
          const product = mp ? mockProductToProduct(mp) : null;
          const categorySlug = mp?.categorySlug;
          const mc = categorySlug
            ? mockCategories.find((c) => c.slug === categorySlug)
            : null;
          const category = mc ? mockCategoryToCategory(mc) : null;
          if (!cancelled) setMockProductData({ product, category });
        }
      )
      .catch((err) => {
        if (!cancelled) setMockProductData({ product: null, category: null });
        console.warn("[useProductDetail] Mock data load failed:", err);
      })
      .finally(() => {
        if (!cancelled) setMockLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  const product = useMemo(() => {
    let productData: Product | null = null;

    if (USE_MOCKS && mockProductData.product) {
      productData = mockProductData.product;
    } else if (apiProduct) {
      productData = apiProduct;
    }

    if (!productData) return null;

    if (!productData.variants?.length) {
      productData = {
        ...productData,
        defaultVariant: {
          id: `${productData.id}-default`,
          image: PLACEHOLDER_IMAGE,
          images: [PLACEHOLDER_IMAGE],
        },
      };
    }

    return productData;
  }, [apiProduct, mockProductData.product]);

  const categoryIdOrSlug = product?.categoryId;
  const { data: apiCategory } = useCategoryQuery(categoryIdOrSlug || "", {
    enabled: !USE_MOCKS && !!categoryIdOrSlug,
  });

  const category = useMemo(() => {
    if (!product?.categoryId) return null;
    if (USE_MOCKS) return mockProductData.category;
    return apiCategory || null;
  }, [product, apiCategory, mockProductData.category]);

  const isLoading = USE_MOCKS ? mockLoading : isQueryLoading;
  const isError = USE_MOCKS ? false : isQueryError;
  const error = USE_MOCKS ? null : queryError;

  return {
    product,
    category,
    isLoading,
    isError,
    error,
    refetch,
  };
}
