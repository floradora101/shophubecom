import type { Product } from "@/lib/types/product.types";

/**
 * Get product image from variants using fallback strategy:
 * Backend is source of truth - prefer defaultVariant if provided.
 * 1. product.defaultVariant?.image (primary image from default variant)
 * 2. product.defaultVariant?.images?.[0] (first gallery image from default variant)
 * 3. product.variants?.[0]?.image (fallback to first variant primary image)
 * 4. product.variants?.[0]?.images?.[0] (fallback to first variant gallery image)
 * 5. null (caller should use placeholder)
 */
export function getProductImage(product: Product): string | null {
  // Priority 1: Use defaultVariant from backend (direct relation)
  if (product.defaultVariant) {
    if (
      product.defaultVariant.image &&
      product.defaultVariant.image.trim().length > 0
    ) {
      return product.defaultVariant.image;
    }
    if (
      product.defaultVariant.images &&
      Array.isArray(product.defaultVariant.images) &&
      product.defaultVariant.images.length > 0 &&
      product.defaultVariant.images[0]?.trim().length > 0
    ) {
      return product.defaultVariant.images[0];
    }
  }

  // Priority 2: Find defaultVariant in variants array by defaultVariantId
  if (product.defaultVariantId && product.variants) {
    const defaultVariant = product.variants.find(
      (v) => v.id === product.defaultVariantId
    );
    if (defaultVariant) {
      if (defaultVariant.image && defaultVariant.image.trim().length > 0) {
        return defaultVariant.image;
      }
      if (
        defaultVariant.images &&
        Array.isArray(defaultVariant.images) &&
        defaultVariant.images.length > 0 &&
        defaultVariant.images[0]?.trim().length > 0
      ) {
        return defaultVariant.images[0];
      }
    }
  }

  // Priority 3: Fallback to first variant (when defaultVariant not available)
  if (product.variants && product.variants.length > 0) {
    const firstVariant = product.variants[0];
    if (firstVariant.image && firstVariant.image.trim().length > 0) {
      return firstVariant.image;
    }
    if (
      firstVariant.images &&
      Array.isArray(firstVariant.images) &&
      firstVariant.images.length > 0 &&
      firstVariant.images[0]?.trim().length > 0
    ) {
      return firstVariant.images[0];
    }
  }

  return null;
}

/**
 * Get all product images from all variants
 */
export function getAllProductImages(product: Product): string[] {
  const images: string[] = [];

  if (product.variants) {
    for (const variant of product.variants) {
      if (variant.image && variant.image.trim().length > 0) {
        images.push(variant.image);
      }
      if (variant.images && variant.images.length > 0) {
        images.push(...variant.images);
      }
    }
  }

  // Remove duplicates
  return Array.from(new Set(images));
}
