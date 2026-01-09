/**
 * Products Grid Component
 *
 * Displays products in a responsive grid with loading skeletons and empty state.
 * Grid: 2 columns mobile, 3 tablet, 4 desktop
 */
"use client";

import { Search, Filter, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductCardSkeleton } from "@/features/products/components/ProductCardSkeleton";
import { cn } from "@/lib/utils/cn";
import type { Product } from "@/features/products/types";

interface ProductsGridProps {
  products: Product[];
  isLoading?: boolean;
  isUpdating?: boolean;
  onClearFilters?: () => void;
  searchTerm?: string | null;
  hasActiveFilters?: boolean;
}

/**
 * Enhanced Empty state when no products are found
 */
export function ProductsEmptyState({
  onClearFilters,
  searchTerm,
  hasActiveFilters,
}: {
  onClearFilters?: () => void;
  searchTerm?: string | null;
  hasActiveFilters?: boolean;
}) {
  const isSearchResult = searchTerm && searchTerm.trim().length > 0;
  const hasFilters = hasActiveFilters || isSearchResult;

  if (isSearchResult) {
    // Search-specific empty state
    return (
      <div className="text-center py-16 px-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <Search className="h-10 w-10 text-blue-500" />
        </div>
        <h3 className="text-xl font-bold text-warm-gray-900 mb-3">
          No results for &ldquo;{searchTerm}&rdquo;
        </h3>
        <p className="text-warm-gray-600 mb-6 max-w-md mx-auto">
          We couldn&apos;t find any products matching your search. Try different
          keywords or check your spelling.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear search & filters
          </Button>
          <Button
            variant="default"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2"
          >
            Browse all products
          </Button>
        </div>
        <div className="mt-8 pt-6 border-t border-warm-gray-100">
          <p className="text-sm text-warm-gray-500 mb-4">Try searching for:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["laptop", "headphones", "mouse", "keyboard", "monitor"].map(
              (suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    const url = new URL(window.location.href);
                    url.searchParams.set("search", suggestion);
                    window.location.href = url.toString();
                  }}
                  className="px-3 py-1.5 bg-warm-gray-50 hover:bg-warm-gray-100 text-warm-gray-700 text-sm rounded-lg transition-colors"
                >
                  {suggestion}
                </button>
              )
            )}
          </div>
        </div>
      </div>
    );
  }

  if (hasFilters) {
    // Filters applied but no results
    return (
      <div className="text-center py-16 px-4">
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
          <Filter className="h-10 w-10 text-orange-500" />
        </div>
        <h3 className="text-xl font-bold text-warm-gray-900 mb-3">
          No products match your filters
        </h3>
        <p className="text-warm-gray-600 mb-6 max-w-md mx-auto">
          Your current filters are too restrictive. Try broadening your search
          criteria.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="default"
            onClick={onClearFilters}
            className="inline-flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Clear all filters
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2"
          >
            Go back
          </Button>
        </div>
      </div>
    );
  }

  // No filters, no search - empty catalog
  return (
    <div className="text-center py-16 px-4">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-full w-20 h-20 mx-auto mb-6 flex items-center justify-center">
        <Sparkles className="h-10 w-10 text-purple-500" />
      </div>
      <h3 className="text-xl font-bold text-warm-gray-900 mb-3">
        No products available
      </h3>
      <p className="text-warm-gray-600 mb-6 max-w-md mx-auto">
        We&apos;re currently updating our catalog. Check back soon for new
        arrivals!
      </p>
      <div className="flex items-center justify-center gap-2 text-sm text-warm-gray-500">
        <TrendingUp className="h-4 w-4" />
        <span>New products coming soon</span>
      </div>
    </div>
  );
}

export function ProductsGrid({
  products,
  isLoading = false,
  isUpdating = false,
  onClearFilters,
  searchTerm,
  hasActiveFilters,
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
    return (
      <ProductsEmptyState
        onClearFilters={onClearFilters}
        searchTerm={searchTerm}
        hasActiveFilters={hasActiveFilters}
      />
    );
  }

  return (
    <div className="relative">
      <div
        className={cn(
          "grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 transition-opacity duration-200",
          isUpdating && "opacity-60 pointer-events-none"
        )}
      >
        {products.map((product) => (
          <ProductCard key={product.id} product={product} layout="vertical" />
        ))}
      </div>

      {/* Updating overlay */}
      {isUpdating && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] rounded-lg flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg border border-white/20">
            <div className="flex items-center gap-2 text-sm text-muted-fg">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-fg border-t-primary-600"></div>
              <span>Updating results...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
