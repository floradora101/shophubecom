export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  productCount?: number;
  createdAt: string;
  updatedAt: string;
  // parent is sometimes included in product responses, but not in category list responses
  parent?: {
    id: string;
    name: string;
    slug: string;
  } | null;
  // children is never returned by backend - it's built client-side from parentId when needed
  children?: Category[];
}

export interface ProductDiscount {
  originalPrice: number;
  discountPercent: number;
  isOnSale: boolean;
  saleStartDate?: string;
  saleEndDate?: string;
  promotionId?: string; // Reference to promotion if part of campaign
}

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

// Unified coupon/promotion type aligned with the new DB schema.
// Legacy fields are kept optional to avoid breaking existing catalog mocks.
export interface Promotion {
  id: string;
  name: string;
  code?: string;
  type: DiscountType;
  value: number;
  description?: string | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  applicableProductIds?: string[];
  applicableCategoryIds?: string[];
  applyToSubcategories?: boolean;
  minOrderTotal?: number | null;
  maxDiscount?: number; // Backward compatibility
  // Legacy aliases for compatibility with existing mocks
  discountType?: DiscountType;
  discountValue?: number;
  startDate?: string;
  endDate?: string;
  minPurchase?: number;
}

// Coupon model aligned with Prisma schema (frontend uses number/string for Decimal/DateTime)
export interface Coupon {
  id: string;
  code: string;
  description?: string | null;
  type: DiscountType;
  value: number;
  minOrderTotal?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  usageLimit?: number | null;
  perUserLimit?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductImage {
  url: string;
  alt?: string | null;
  position?: number;
}

export type VariantOptionKey = string;
export type VariantOptions = Record<VariantOptionKey, string>;

export interface ProductVariant {
  id?: string;
  sku: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  options?: VariantOptions;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price: number;
  currency: string; // Required by DB
  stock: number;
  isOnSale?: boolean;
  discountType?: DiscountType;
  discountValue?: number | null;
  saleStartsAt?: string | null;
  saleEndsAt?: string | null;
  brand?: string | null;
  categoryId?: string;
  category?: Category;
  variants?: ProductVariant[];
  defaultVariantId?: string | null;
  defaultVariant?: {
    id: string;
    image?: string | null;
    images?: string[];
  };
  // Price range fields for products with multiple variant prices
  minPrice?: number;
  maxPrice?: number;
  // Effective stock (sum of all variant stocks)
  effectiveStock?: number;
  createdAt: string;
  updatedAt: string;
  // Legacy/compatibility fields still used in parts of the storefront mocks
  isActive?: boolean;
  isFeatured?: boolean;
  specs?: Array<{ label: string; value: string }>;
  discount?: ProductDiscount;
  promotionIds?: string[];
  promotions?: Promotion[];
  originalPrice?: number;
  discountPercent?: number;
  // Legacy storefront fields for backward compatibility
  colors?: string[];
  storageOptions?: string[];
  images?: string[]; // For mock data compatibility
  // Rating fields (frontend-only for now, to be added to backend later)
  rating?: number; // Average rating out of 5
  reviewCount?: number; // Number of reviews
}

export interface ProductsResponse {
  data: Product[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sortBy?: "name" | "price" | "createdAt";
  sortOrder?: "asc" | "desc";
  minRating?: number | null;
  selectedBrands?: string[] | null;
}
