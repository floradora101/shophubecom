/**
 * Product Feature Types
 *
 * This file re-exports shared types from @/lib/types/shared for backward compatibility.
 * New code should import directly from @/lib/types/shared.
 *
 * Feature-specific types related to products are also defined here.
 *
 * @see NEXT_REFACTORING_STRATEGIC_ROADMAP.md - Phase 3.1: Type Consolidation
 */

// Re-export shared types for backward compatibility
export type {
  Category,
  Product,
  ProductVariant,
  ProductDiscount,
  ProductImage,
  ProductFilters,
  ProductsResponse,
  Promotion,
  Coupon,
  DiscountType,
  VariantOptionKey,
  VariantOptions,
} from "@/lib/types/shared";
