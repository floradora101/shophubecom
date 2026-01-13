/**
 * Filters Drawer Component
 *
 * Mobile sheet drawer containing the same filters as FiltersSidebar.
 * Opens from the left on mobile devices.
 */
"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import { FiltersSidebar } from "./FiltersSidebar";
import type { Category } from "@/features/products/types";
import { Button } from "@/components/ui/button";
import { X, RotateCcw } from "lucide-react";

interface FiltersDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: Category[];
  selectedCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  priceRange: { min: number; max: number };
  onPriceRangeChange: (range: { min: number; max: number }) => void;
  inStockOnly: boolean;
  onInStockChange: (value: boolean) => void;
  minRating: number | null;
  onMinRatingChange: (rating: number | null) => void;
  selectedBrands: string[] | null;
  onBrandsChange: (brands: string[] | null) => void;
  availableBrands?: string[];
  onClearAll: () => void;
  resultsCount: number;
}

export function FiltersDrawer({
  open,
  onOpenChange,
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  inStockOnly,
  onInStockChange,
  minRating,
  onMinRatingChange,
  selectedBrands,
  onBrandsChange,
  availableBrands = [],
  onClearAll,
  resultsCount,
}: FiltersDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[85vw] sm:max-w-sm flex flex-col p-0 h-full"
      >
        <SheetHeader className="px-6 py-4 border-b border-warm-gray-100 flex-shrink-0">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-xl font-display font-bold">Filters</SheetTitle>
            <button
              onClick={() => onOpenChange(false)}
              className="p-2 hover:bg-warm-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-warm-gray-500" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4 scrollbar-hide">
          <FiltersSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={onCategoryChange}
            priceRange={priceRange}
            onPriceRangeChange={onPriceRangeChange}
            inStockOnly={inStockOnly}
            onInStockChange={onInStockChange}
            minRating={minRating}
            onMinRatingChange={onMinRatingChange}
            selectedBrands={selectedBrands}
            onBrandsChange={onBrandsChange}
            availableBrands={availableBrands}
          />
        </div>

        <SheetFooter className="px-6 py-4 border-t border-warm-gray-100 bg-warm-gray-50/50 flex-shrink-0 sm:flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 gap-2 border-warm-gray-200 text-warm-gray-600 font-bold"
            onClick={onClearAll}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            className="flex-[2] bg-primary-600 hover:bg-primary-700 text-white font-bold shadow-lg shadow-primary-600/20"
            onClick={() => onOpenChange(false)}
          >
            Show {resultsCount} Products
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
