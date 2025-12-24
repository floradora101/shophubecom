import type { Product } from "@/features/products/types";
import { getProductImage } from "@/features/products/utils/product-images";

/**
 * Shared constants for products
 */
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E";

/**
 * Get product image with fallback to placeholder
 */
export function getProductImageWithPlaceholder(product: Product): string {
  return getProductImage(product) || PLACEHOLDER_IMAGE;
}

/**
 * Calculate discount information for a product
 * Returns discount percentage, original price, savings, and whether discount exists
 */
export function getDiscountInfo(product: Product) {
  const originalPrice =
    product.discount?.originalPrice || product.originalPrice;
  const hasDiscount =
    typeof originalPrice === "number" && originalPrice > product.price;

  let discountPercent = 0;
  if (hasDiscount && originalPrice) {
    discountPercent = Math.round(
      ((originalPrice - product.price) / originalPrice) * 100
    );
  } else {
    // Fallback to discountPercent from product if available
    discountPercent =
      product.discount?.discountPercent ||
      product.discountValue ||
      product.discountPercent ||
      0;
  }

  const savings =
    hasDiscount && originalPrice ? originalPrice - product.price : 0;

  return {
    hasDiscount: hasDiscount || discountPercent > 0,
    discountPercent,
    originalPrice: originalPrice || null,
    savings,
  };
}

/**
 * Get variant ID from product (prefers defaultVariant, then variants[0])
 */
export function getVariantId(product: Product): string | null {
  return product.defaultVariant?.id || product.variants?.[0]?.id || null;
}

/**
 * Ensure array is safe (not null/undefined)
 */
export function ensureArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

// export function mockDealToProduct(
//   mock: import("@/lib/mock-data/deals").MockDeal
// ): Product {
//   const originalPrice = mock.discount > 0 ? 100 : undefined; // Assume base price of 100 for deals
//   const discountedPrice = originalPrice
//     ? originalPrice * (1 - mock.discount / 100)
//     : 50;

//   return {
//     id: mock.id,
//     name: mock.title,
//     slug: mock.id.toLowerCase().replace(/\s+/g, "-"),
//     description: mock.subtitle,
//     price: discountedPrice,
//     currency: "USD",
//     stock: 100,
//     isOnSale: mock.discount > 0,
//     discountType: mock.discount > 0 ? "PERCENTAGE" : undefined,
//     discountValue: mock.discount > 0 ? mock.discount : undefined,
//     categoryId: "deals",
//     isActive: true,
//     isFeatured: false,
//     variants: [
//       {
//         id: `${mock.id}-variant`,
//         sku: `${mock.id}-sku`,
//         price: discountedPrice,
//         stock: 100,
//         image: mock.image,
//         images: [mock.image],
//         options: {},
//       },
//     ],
//     createdAt: new Date().toISOString(),
//     updatedAt: new Date().toISOString(),
//   };
// }
