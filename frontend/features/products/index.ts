// Products feature barrel exports
export * from "./api";
export * from "./queries";
export * from "./query-keys";
export * from "./types";
export * from "./schemas";
// ProductCard moved to /components/shared - import from there
export { ProductCard } from "@/components/shared/ProductCard";
export { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";
// ProductFilters component is not exported here to avoid conflict with ProductFilters interface in types
// Import directly: import { ProductFilters } from "@/features/products/components/ProductFilters"
export * from "./utils/product-images";
// Note: ProductFilters interface from utils/filters.ts conflicts with ProductFilters from types.ts
// Import directly: import { ProductFilters as URLProductFilters } from "@/features/products/utils/filters"
export * from "./utils/inventory";
// Export filter functions but not the ProductFilters interface to avoid conflict
export {
  parseFiltersFromSearchParams,
  updateSearchParams,
  filtersToApiParams,
  type CanonicalFilters,
  type FiltersToApiParamsOptions,
} from "./utils/filters";
