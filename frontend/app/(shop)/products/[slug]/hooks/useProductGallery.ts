/**
 * useProductGallery Hook
 *
 * Determines gallery images based on selected variant or product images.
 */

import { useMemo } from "react";
import { PLACEHOLDER_IMAGE } from "@/lib/utils/products";
import { getAllProductImages } from "@/features/products/utils/product-images";
import type { Product } from "@/features/products/types";

interface UseProductGalleryProps {
  product: Product | null;
  selectedVariant: {
    id?: string;
    image?: string;
    images?: string[];
  } | null;
}

interface UseProductGalleryReturn {
  galleryImages: string[];
}

/**
 * Hook for determining product gallery images
 */
export function useProductGallery({
  product,
  selectedVariant,
}: UseProductGalleryProps): UseProductGalleryReturn {
  const galleryImages = useMemo(() => {
    if (!product) return [PLACEHOLDER_IMAGE];

    // If a specific variant is selected, prioritize its images
    if (selectedVariant) {
      const images = [];
      if (selectedVariant.image) images.push(selectedVariant.image);
      if (selectedVariant.images?.length)
        images.push(...selectedVariant.images);
      if (images.length > 0) return images;
    }

    // Fallback to all product images using the proper utility
    const allImages = getAllProductImages(product);
    return allImages.length > 0 ? allImages : [PLACEHOLDER_IMAGE];
  }, [selectedVariant, product]);

  return { galleryImages };
}
