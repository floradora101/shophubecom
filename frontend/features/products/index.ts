// Products feature barrel exports
export * from "./api";
export * from "./queries";
export * from "./query-keys";
export * from "./types";
export * from "./schemas";
// ProductCard moved to /components/shared - import from there
export { ProductCard } from "@/components/shared/ProductCard";
export { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";
export * from "./utils/product-images";
export * from "./utils/inventory";
export {
  parseFiltersFromSearchParams,
  updateSearchParams,
  filtersToApiParams,
  type CanonicalFilters,
  type FiltersToApiParamsOptions,
} from "./utils/filters";
