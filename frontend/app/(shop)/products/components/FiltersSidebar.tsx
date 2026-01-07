/**
 * Professional Filters Sidebar Component - Tech Store Edition
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DollarSign,
  ChevronDown,
  Package,
  Archive,
  Star,
  Shield,
  CheckCircle,
} from "lucide-react";
import { Stack } from "@/components/ui/stack";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/features/products/types";

const PRICE_RANGES = [
  { label: "Under $25", min: 0, max: 25, popular: true },
  { label: "$25 - $50", min: 25, max: 50, popular: false },
  { label: "$50 - $100", min: 50, max: 100, popular: true },
  { label: "$100 - $200", min: 100, max: 200, popular: false },
  { label: "Over $200", min: 200, max: 10000, popular: false },
];

interface FiltersSidebarProps {
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

export function FiltersSidebar({
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
}: FiltersSidebarProps) {
  const [localMin, setLocalMin] = useState(() => {
    const currentMin = priceRange.min;
    return currentMin !== null && currentMin !== undefined
      ? currentMin.toString()
      : "";
  });
  const [localMax, setLocalMax] = useState(() => {
    const currentMax = priceRange.max;
    return currentMax !== null && currentMax !== undefined
      ? currentMax.toString()
      : "";
  });

  // Update local state when priceRange prop changes
  useEffect(() => {
    setLocalMin(
      priceRange.min !== null && priceRange.min !== undefined
        ? priceRange.min.toString()
        : ""
    );
    setLocalMax(
      priceRange.max !== null && priceRange.max !== undefined
        ? priceRange.max.toString()
        : ""
    );
  }, [priceRange.min, priceRange.max]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(false);
  const [isRatingOpen, setIsRatingOpen] = useState(false);
  const [isBrandsOpen, setIsBrandsOpen] = useState(false);

  useEffect(() => {
    setLocalMin(priceRange.min.toString());
    setLocalMax(priceRange.max.toString());
  }, [priceRange.min, priceRange.max]);

  const categoryTree = (() => {
    const nodeMap = new Map<string, Category & { children: Category[] }>();
    categories.forEach((cat) => nodeMap.set(cat.id, { ...cat, children: [] }));
    const roots: (Category & { children: Category[] })[] = [];
    nodeMap.forEach((cat) => {
      if (cat.parentId && nodeMap.has(cat.parentId)) {
        nodeMap.get(cat.parentId)!.children.push(cat);
      } else {
        roots.push(cat);
      }
    });
    return roots;
  })();

  const handlePriceFilter = () => {
    const minValue = localMin.trim();
    const maxValue = localMax.trim();

    // If both fields are empty, clear the price filter
    if (!minValue && !maxValue) {
      onPriceRangeChange({ min: null, max: null });
      return;
    }

    const min = minValue ? parseFloat(minValue) : null;
    const max = maxValue ? parseFloat(maxValue) : null;

    // Validate inputs
    const validMin = min !== null && !isNaN(min) && min >= 0 ? min : null;
    const validMax = max !== null && !isNaN(max) && max >= 0 ? max : null;

    // If min and max are both set and min > max, swap them
    if (validMin !== null && validMax !== null && validMin > validMax) {
      onPriceRangeChange({ min: validMax, max: validMin });
    } else {
      onPriceRangeChange({ min: validMin, max: validMax });
    }
  };

  const renderCategory = (
    cat: Category & { children?: Category[] },
    depth = 0
  ) => {
    const isActive = selectedCategory === cat.slug;
    const hasChildren = cat.children && cat.children.length > 0;

    return (
      <li key={cat.id} className="space-y-2">
        <button
          onClick={() => onCategoryChange(cat.slug)}
          className={cn(
            "w-full text-left p-3 rounded-lg transition-all duration-200",
            "flex items-center gap-3 group",
            "hover:bg-primary-50 hover:border-primary-200 border border-transparent",
            "focus:outline-none",
            isActive
              ? "bg-primary-50 border-primary-200 text-primary-700 font-medium shadow-sm"
              : "text-warm-gray-700 hover:text-primary-600"
          )}
          style={{
            paddingLeft: `${16 + depth * 20}px`,
            marginLeft: `${depth * 8}px`,
          }}
        >
          <div className="flex items-center gap-3 flex-1">
            <CheckCircle
              className={cn(
                "w-4 h-4 transition-colors shrink-0",
                isActive
                  ? "text-primary-600"
                  : "text-warm-gray-400 group-hover:text-primary-500"
              )}
            />
            <span className="text-sm truncate">{cat.name}</span>
            {hasChildren && (
              <Badge variant="outline" className="text-xs px-2 py-0.5 ml-auto">
                {cat.children.length}
              </Badge>
            )}
          </div>
        </button>
        {hasChildren && (
          <ul className="space-y-2">
            {cat.children
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((child) =>
                renderCategory(
                  child as Category & { children?: Category[] },
                  depth + 1
                )
              )}
          </ul>
        )}
      </li>
    );
  };

  return (
    <div className="sticky top-24 w-full">
      <div className="w-full space-y-6">
        <div className="text-center pb-2 border-b border-warm-gray-100">
          <h3 className="text-sm font-semibold text-warm-gray-900">
            Smart Filters
          </h3>
          <p className="text-xs text-warm-gray-600 mt-1">
            Find exactly what you need
          </p>
        </div>

        {/* Category Filter */}
        <div className="bg-white rounded-xl border border-warm-gray-200 shadow-sm overflow-hidden min-h-[60px]">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center justify-between w-full px-5 py-4 text-left bg-warm-gray-50 hover:bg-primary-50 transition-colors"
            aria-expanded={isCategoryOpen}
          >
            <div className="flex items-center gap-3">
              <Archive className="w-4 h-4 text-primary-600" />
              <span className="text-sm font-semibold text-warm-gray-900">
                Categories
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-warm-gray-500 transition-transform",
                isCategoryOpen && "rotate-180"
              )}
            />
          </button>

          {isCategoryOpen && (
            <div className="px-5 pb-5 border-t border-warm-gray-100">
              <div className="pt-4">
                <button
                  onClick={() => onCategoryChange(null)}
                  className={cn(
                    "w-full text-left mb-3 p-3 rounded-lg transition-colors",
                    !selectedCategory
                      ? "bg-primary-50 text-primary-700 font-medium"
                      : "text-warm-gray-700 hover:bg-primary-50"
                  )}
                >
                  All Products
                </button>
                <ul className="space-y-2">
                  {categoryTree.map((category) => renderCategory(category, 0))}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div className="bg-white rounded-xl border border-warm-gray-200 shadow-sm overflow-hidden min-h-[60px]">
          <button
            onClick={() => setIsPriceOpen(!isPriceOpen)}
            className="flex items-center justify-between w-full px-5 py-4 text-left bg-warm-gray-50 hover:bg-green-50 transition-colors"
            aria-expanded={isPriceOpen}
          >
            <div className="flex items-center gap-3">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-warm-gray-900">
                Price Range
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-warm-gray-500 transition-transform",
                isPriceOpen && "rotate-180"
              )}
            />
          </button>

          {isPriceOpen && (
            <div className="px-5 pb-5 border-t border-warm-gray-100">
              <div className="pt-4 space-y-4">
                {/* Quick Price Presets */}
                <div>
                  <div className="text-xs font-semibold text-warm-gray-700 uppercase tracking-wide mb-2">
                    Quick Select
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {PRICE_RANGES.map((preset) => (
                      <button
                        key={preset.label}
                        onClick={() =>
                          onPriceRangeChange({
                            min: preset.min,
                            max: preset.max,
                          })
                        }
                        className="w-full text-left p-3 rounded-lg hover:bg-green-50 transition-colors border border-warm-gray-200 text-sm"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Price Range Inputs */}
                <div className="border-t border-warm-gray-100 pt-4">
                  <div className="text-xs font-semibold text-warm-gray-700 uppercase tracking-wide mb-3">
                    Custom Range
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label htmlFor="min-price" className="sr-only">
                          Minimum price
                        </label>
                        <input
                          id="min-price"
                          type="number"
                          placeholder="Min"
                          value={localMin}
                          onChange={(e) => setLocalMin(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-warm-gray-200 rounded-lg bg-white focus:outline-none placeholder:text-warm-gray-400"
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label htmlFor="max-price" className="sr-only">
                          Maximum price
                        </label>
                        <input
                          id="max-price"
                          type="number"
                          placeholder="Max"
                          value={localMax}
                          onChange={(e) => setLocalMax(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-warm-gray-200 rounded-lg bg-white focus:outline-none placeholder:text-warm-gray-400"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    </div>
                    <Button
                      onClick={handlePriceFilter}
                      size="sm"
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                      disabled={!localMin && !localMax}
                    >
                      Apply Custom Range
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Availability Filter */}
        <div className="bg-white rounded-xl border border-warm-gray-200 shadow-sm overflow-hidden min-h-[60px]">
          <button
            onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
            className="flex items-center justify-between w-full px-5 py-4 text-left bg-warm-gray-50 hover:bg-orange-50 transition-colors"
            aria-expanded={isAvailabilityOpen}
          >
            <div className="flex items-center gap-3">
              <Package className="w-4 h-4 text-orange-600" />
              <span className="text-sm font-semibold text-warm-gray-900">
                Availability
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-warm-gray-500 transition-transform",
                isAvailabilityOpen && "rotate-180"
              )}
            />
          </button>

          {isAvailabilityOpen && (
            <div className="px-5 pb-5 border-t border-warm-gray-100">
              <div className="pt-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => onInStockChange(e.target.checked)}
                    className="rounded border-warm-gray-300 text-orange-600"
                  />
                  <span className="text-sm text-warm-gray-700">
                    In Stock Only
                  </span>
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div className="bg-white rounded-xl border border-warm-gray-200 shadow-sm overflow-hidden min-h-[60px]">
          <button
            onClick={() => setIsRatingOpen(!isRatingOpen)}
            className="flex items-center justify-between w-full px-5 py-4 text-left bg-warm-gray-50 hover:bg-yellow-50 transition-colors"
            aria-expanded={isRatingOpen}
          >
            <div className="flex items-center gap-3">
              <Star className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-semibold text-warm-gray-900">
                Rating
              </span>
            </div>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-warm-gray-500 transition-transform",
                isRatingOpen && "rotate-180"
              )}
            />
          </button>

          {isRatingOpen && (
            <div className="px-5 pb-5 border-t border-warm-gray-100">
              <div className="pt-4 space-y-2">
                {[4, 3, 2, 1].map((rating) => (
                  <button
                    key={rating}
                    onClick={() =>
                      onMinRatingChange(minRating === rating ? null : rating)
                    }
                    className={cn(
                      "w-full text-left p-3 rounded-lg transition-colors",
                      minRating === rating
                        ? "bg-yellow-50 text-yellow-700 font-medium"
                        : "text-warm-gray-700 hover:bg-yellow-50"
                    )}
                  >
                    {rating}+ Stars
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Brands Filter */}
        {availableBrands && availableBrands.length > 0 && (
          <div className="bg-white rounded-xl border border-warm-gray-200 shadow-sm overflow-hidden min-h-[60px]">
            <button
              onClick={() => setIsBrandsOpen(!isBrandsOpen)}
              className="flex items-center justify-between w-full px-5 py-4 text-left bg-warm-gray-50 hover:bg-indigo-50 transition-colors"
              aria-expanded={isBrandsOpen}
            >
              <div className="flex items-center gap-3">
                <Shield className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-warm-gray-900">
                  Brands
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-warm-gray-500 transition-transform",
                  isBrandsOpen && "rotate-180"
                )}
              />
            </button>

            {isBrandsOpen && (
              <div className="px-5 pb-5 border-t border-warm-gray-100">
                <div className="pt-4 space-y-2">
                  {availableBrands.map((brand) => {
                    const isSelected = selectedBrands?.includes(brand) || false;
                    return (
                      <label
                        key={brand}
                        className="flex items-center gap-3 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            const newBrands = e.target.checked
                              ? [...(selectedBrands || []), brand]
                              : (selectedBrands || []).filter(
                                  (b) => b !== brand
                                );
                            onBrandsChange(
                              newBrands.length > 0 ? newBrands : null
                            );
                          }}
                          className="rounded border-warm-gray-300 text-indigo-600"
                        />
                        <span
                          className={cn(
                            "text-sm",
                            isSelected
                              ? "text-indigo-700 font-medium"
                              : "text-warm-gray-700"
                          )}
                        >
                          {brand}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
