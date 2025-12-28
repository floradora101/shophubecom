/**
 * Products Grid Component
 *
 * Displays products in a responsive grid with loading skeletons and empty state.
 * Grid: 2 columns mobile, 3 tablet, 4 desktop
 */
"use client";

import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/products/components/ProductCard";
import { cn } from "@/lib/utils/cn";
import { ProgressiveSkeletonGrid } from "@/components/ui/loading-spinner";
import type { Product } from "@/features/products/types";

interface ProductsGridProps {
  products: Product[];
  isLoading?: boolean;
  onClearFilters?: () => void;
}

/**
 * Skeleton loader for product cards
 */
export function ProductCardSkeleton({
  delayClass = "animate-shimmer",
}: {
  delayClass?: string;
}) {
  return (
    <div className="group flex flex-col w-full">
      {/* Image Card Section Skeleton */}
      <div
        className={cn(
          "relative aspect-square rounded-lg overflow-hidden bg-gray-200 border border-warm-gray-200",
          delayClass
        )}
      />

      {/* Product Info Below Image Skeleton */}
      <div className="mt-3 space-y-1 min-h-16 flex flex-col justify-end">
        {/* Product name skeleton - matches the line-clamp-2 */}
        <div className={cn("h-4 md:h-5 bg-gray-200 rounded", delayClass)} />
        <div
          className={cn("h-4 md:h-5 bg-gray-200 rounded w-3/4", delayClass)}
        />

        {/* Rating skeleton (optional) - matches StarRating component */}
        <div className={cn("h-3 bg-gray-200 rounded w-1/2 mt-1", delayClass)} />

        {/* Price skeleton - matches the pricing layout */}
        <div className="flex items-baseline gap-2 flex-wrap mt-2">
          <div
            className={cn("h-4 md:h-5 bg-gray-200 rounded w-16", delayClass)}
          />
          <div className={cn("h-3 bg-gray-200 rounded w-12", delayClass)} />
          <div className={cn("h-3 bg-gray-200 rounded w-20", delayClass)} />
        </div>
      </div>
    </div>
  );
}

/**
 * Empty state when no products are found
 */
export function ProductsEmptyState({
  onClearFilters,
}: {
  onClearFilters?: () => void;
}) {
  return (
    <div className="text-center py-16">
      <Search className="h-12 w-12 text-warm-gray-300 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        No products found
      </h3>
      <p className="text-warm-gray-600 mb-6">
        Try adjusting your filters or search terms
      </p>
      {onClearFilters && (
        <Button
          variant="outline"
          onClick={onClearFilters}
          className="inline-flex items-center gap-2"
        >
          Clear all filters
        </Button>
      )}
    </div>
  );
}

export function ProductsGrid({
  products,
  isLoading = false,
  onClearFilters,
}: ProductsGridProps) {
  if (isLoading) {
    return (
      <ProgressiveSkeletonGrid
        count={8}
        itemComponent={ProductCardSkeleton}
        gridCols="grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      />
    );
  }

  if (products.length === 0) {
    return <ProductsEmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
