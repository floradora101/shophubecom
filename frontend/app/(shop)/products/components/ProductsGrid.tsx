/**
 * Products Grid Component
 *
 * Displays products in a responsive grid with loading skeletons and empty state.
 * Grid: 2 columns mobile, 3 tablet, 4 desktop
 */
"use client";

import { Search } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/products/components/ProductCard";
import { theme } from "../../../../lib/config/theme";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/features/products/types";

interface ProductsGridProps {
  products: Product[];
  isLoading?: boolean;
  onClearFilters?: () => void;
}

/**
 * Skeleton loader for product cards
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col space-y-3">
      <div
        className={cn(
          "aspect-square w-full",
          theme.radius.card,
          "bg-warm-gray-100 animate-pulse"
        )}
      />
      <div className="space-y-2">
        <div className="h-4 bg-warm-gray-100 rounded animate-pulse" />
        <div className="h-4 bg-warm-gray-100 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-warm-gray-100 rounded w-1/2 animate-pulse" />
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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return <ProductsEmptyState onClearFilters={onClearFilters} />;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
