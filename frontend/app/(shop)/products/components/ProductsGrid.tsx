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
import { ProductCardSkeleton } from "@/components/home/ProductCardSkeleton";
import { cn } from "@/lib/utils/cn";
import { ProgressiveSkeletonGrid } from "@/components/ui/loading-spinner";
import type { Product } from "@/features/products/types";

interface ProductsGridProps {
  products: Product[];
  isLoading?: boolean;
  onClearFilters?: () => void;
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
      <div className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {Array.from({ length: 8 }, (_, index) => (
          <ProductCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
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
