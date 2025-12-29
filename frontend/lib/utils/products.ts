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
  // Priority order for discount data:
  // 1. product.discount (structured discount object)
  // 2. product.originalPrice + product.price (legacy fields)
  // 3. product.discountPercent or product.discountValue (percentage/fixed amount)

  let originalPrice: number | null = null;
  let discountPercent = 0;
  let hasDiscount = false;

  // Case 1: Structured discount object (preferred)
  if (
    product.discount?.originalPrice &&
    product.discount.originalPrice > product.price
  ) {
    originalPrice = product.discount.originalPrice;
    // Always recalculate discount percentage from originalPrice to ensure accuracy
    // This prevents issues where stored discountPercent might be incorrect (e.g., storing discountValue instead of percentage)
    // Formula: discountPercent = ((originalPrice - currentPrice) / originalPrice) * 100
    const discountAmount = originalPrice - product.price;
    // Ensure we use originalPrice as denominator, not current price
    discountPercent = Math.round((discountAmount / originalPrice) * 100);

    // Validate the calculated percentage is reasonable
    if (discountPercent <= 0 || discountPercent >= 100) {
      hasDiscount = false;
      discountPercent = 0;
      originalPrice = null;
    } else {
      hasDiscount = true;
    }
  }
  // Case 2: Legacy originalPrice field
  else if (product.originalPrice && product.originalPrice > product.price) {
    originalPrice = product.originalPrice;
    // Always recalculate discount percentage from originalPrice to ensure accuracy
    // Use precise calculation: ((original - current) / original) * 100
    const discountAmount = originalPrice - product.price;
    // Use Math.round for final percentage, but calculate with full precision first
    discountPercent = Math.round((discountAmount / originalPrice) * 100);
    // Ensure we have a valid discount percentage
    if (discountPercent <= 0 || discountPercent >= 100) {
      hasDiscount = false;
      discountPercent = 0;
      originalPrice = null;
    } else {
      hasDiscount = true;
    }
  }
  // Case 3: Percentage discount (calculate original price)
  else if (product.discountPercent && product.discountPercent > 0) {
    // Validate discount percentage is reasonable (between 1% and 99%)
    if (product.discountPercent < 100) {
      discountPercent = product.discountPercent;
      // Calculate original price: if price = originalPrice * (1 - discount/100)
      // then originalPrice = price / (1 - discount/100)
      originalPrice =
        Math.round((product.price / (1 - discountPercent / 100)) * 100) / 100;
      hasDiscount = true;
    } else {
      // Invalid discount percentage (>= 100%)
      hasDiscount = false;
      discountPercent = 0;
      originalPrice = null;
    }
  }
  // Case 4: discountValue as percentage
  else if (product.discountValue && product.discountType === "PERCENTAGE") {
    // Validate discount percentage is reasonable (between 1% and 99%)
    if (product.discountValue > 0 && product.discountValue < 100) {
      discountPercent = product.discountValue;
      // Calculate original price: if price = originalPrice * (1 - discount/100)
      // then originalPrice = price / (1 - discount/100)
      originalPrice =
        Math.round((product.price / (1 - discountPercent / 100)) * 100) / 100;
      hasDiscount = true;
    } else {
      // Invalid discount percentage
      hasDiscount = false;
      discountPercent = 0;
      originalPrice = null;
    }
  }
  // Case 5: discountValue as fixed amount
  else if (product.discountValue && product.discountType === "FIXED_AMOUNT") {
    const discountAmount = product.discountValue;
    // Ensure discount amount doesn't exceed price (can't discount more than 100%)
    if (discountAmount > 0 && discountAmount < product.price) {
      originalPrice = product.price + discountAmount;
      // Calculate percentage: (discountAmount / originalPrice) * 100
      discountPercent = Math.round((discountAmount / originalPrice) * 100);
      // Validate the calculated percentage is reasonable
      if (discountPercent > 0 && discountPercent < 100) {
        hasDiscount = true;
      } else {
        hasDiscount = false;
        discountPercent = 0;
        originalPrice = null;
      }
    } else {
      // Invalid discount amount
      hasDiscount = false;
      discountPercent = 0;
      originalPrice = null;
    }
  }

  // Final safety check: If we have both originalPrice and current price,
  // always recalculate discountPercent to ensure accuracy
  // This prevents any incorrect stored values from being used
  if (hasDiscount && originalPrice && originalPrice > product.price) {
    const discountAmount = originalPrice - product.price;
    // Ensure we always use originalPrice as denominator (never current price)
    const recalculatedPercent = Math.round(
      (discountAmount / originalPrice) * 100
    );
    // Only update if recalculated value is valid
    if (recalculatedPercent > 0 && recalculatedPercent < 100) {
      discountPercent = recalculatedPercent;
    } else {
      // Invalid calculation - disable discount
      hasDiscount = false;
      discountPercent = 0;
      originalPrice = null;
    }
  }

  const savings =
    hasDiscount && originalPrice ? originalPrice - product.price : 0;

  return {
    hasDiscount,
    discountPercent,
    originalPrice,
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
