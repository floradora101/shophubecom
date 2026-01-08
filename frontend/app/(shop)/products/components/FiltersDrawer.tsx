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
} from "@/components/ui/sheet";
import { FiltersSidebar } from "./FiltersSidebar";
import type { Category } from "@/features/products/types";

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
}: FiltersDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="w-[85vw] sm:max-w-sm overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-6">
          <FiltersSidebar
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={(category) => {
              onCategoryChange(category);
              // Optionally close drawer after selection on mobile
              // onOpenChange(false);
            }}
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
      </SheetContent>
    </Sheet>
  );
}
