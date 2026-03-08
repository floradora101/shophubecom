/**
 * Check if a variant has at least one valid (non-empty) image.
 */
export function hasVariantImage(variant: {
  image?: string | null;
  images?: string[] | null;
}): boolean {
  if (variant.image && variant.image.trim().length > 0) {
    return true;
  }
  if (
    variant.images &&
    Array.isArray(variant.images) &&
    variant.images.some((img) => img && img.trim().length > 0)
  ) {
    return true;
  }
  return false;
}
