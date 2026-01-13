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
  ShoppingBag,
  Layers,
  Star,
  Shield,
  CheckCircle,
  Zap,
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
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const [isPriceOpen, setIsPriceOpen] = useState(true);
  const [isAvailabilityOpen, setIsAvailabilityOpen] = useState(true);
  const [isRatingOpen, setIsRatingOpen] = useState(true);
  const [isBrandsOpen, setIsBrandsOpen] = useState(true);

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
      onPriceRangeChange({ min: 0, max: Number.MAX_SAFE_INTEGER });
      return;
    }

    const min = minValue ? parseFloat(minValue) : 0;
    const max = maxValue ? parseFloat(maxValue) : Number.MAX_SAFE_INTEGER;

    // Validate inputs
    const validMin = min !== null && !isNaN(min) && min >= 0 ? min : 0;
    const validMax =
      max !== null && !isNaN(max) && max >= 0 ? max : Number.MAX_SAFE_INTEGER;

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
              <Badge
                variant="secondary"
                className="text-xs px-2 py-0.5 ml-auto"
              >
                {cat.children?.length || 0}
              </Badge>
            )}
          </div>
        </button>
        {hasChildren && (
          <ul className="space-y-2">
            {cat.children
              ?.sort((a, b) => a.name.localeCompare(b.name))
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
      <div className="w-full space-y-8">
        <div className="pb-4 border-b border-warm-gray-100">
          <h3 className="text-lg font-display font-bold text-warm-gray-900 tracking-tight">
            Refine <span className="italic font-normal text-primary-600">Selection</span>
          </h3>
          <p className="text-xs text-warm-gray-500 mt-1 font-medium">
            Curating your perfect match
          </p>
        </div>

        {/* Category Filter */}
        <div className="space-y-4">
          <button
            onClick={() => setIsCategoryOpen(!isCategoryOpen)}
            className="flex items-center justify-between w-full px-1 group"
          >
            <div className="flex items-center gap-3">
              <Layers className={cn("w-4 h-4 transition-colors", isCategoryOpen ? "text-primary-600" : "text-warm-gray-400")} />
              <span className="text-sm font-bold text-warm-gray-900 uppercase tracking-wider">
                Departments
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-warm-gray-400 transition-transform duration-300", isCategoryOpen && "rotate-180")} />
          </button>

          {isCategoryOpen && (
            <div className="space-y-1 animate-in fade-in slide-in-from-top-2 duration-300">
              <button
                onClick={() => onCategoryChange(null)}
                className={cn(
                  "w-full text-left px-4 py-2.5 rounded-lg transition-all duration-300 text-sm",
                  !selectedCategory
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/20 font-bold"
                    : "text-warm-gray-600 hover:bg-warm-gray-100 hover:text-warm-gray-900"
                )}
              >
                All Collections
              </button>
              <ul className="space-y-1 mt-2">
                {categoryTree.map((category) => renderCategory(category, 0))}
              </ul>
            </div>
          )}
        </div>

        {/* Price Filter */}
        <div className="space-y-4 pt-4 border-t border-warm-gray-100">
          <button
            onClick={() => setIsPriceOpen(!isPriceOpen)}
            className="flex items-center justify-between w-full px-1 group"
          >
            <div className="flex items-center gap-3">
              <DollarSign className={cn("w-4 h-4 transition-colors", isPriceOpen ? "text-primary-600" : "text-warm-gray-400")} />
              <span className="text-sm font-bold text-warm-gray-900 uppercase tracking-wider">
                Price Range
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-warm-gray-400 transition-transform duration-300", isPriceOpen && "rotate-180")} />
          </button>

          {isPriceOpen && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
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
                    className={cn(
                      "w-full text-left px-4 py-2 rounded-lg border transition-all duration-300 text-xs font-medium",
                      priceRange.min === preset.min && priceRange.max === preset.max
                        ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm"
                        : "bg-white border-warm-gray-200 text-warm-gray-600 hover:border-primary-200 hover:text-primary-600"
                    )}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3 pt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="Min"
                      value={localMin}
                      onChange={(e) => setLocalMin(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-xs border border-warm-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-warm-gray-300"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-gray-400 text-xs">$</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={localMax}
                      onChange={(e) => setLocalMax(e.target.value)}
                      className="w-full pl-7 pr-3 py-2 text-xs border border-warm-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all placeholder:text-warm-gray-300"
                    />
                  </div>
                </div>
                <Button
                  onClick={handlePriceFilter}
                  size="sm"
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white rounded-xl shadow-lg shadow-primary-600/20 text-xs font-bold py-5 transition-all active:scale-95"
                  disabled={!localMin && !localMax}
                >
                  Apply Range
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Availability Filter */}
        <div className="space-y-4 pt-4 border-t border-warm-gray-100">
          <button
            onClick={() => setIsAvailabilityOpen(!isAvailabilityOpen)}
            className="flex items-center justify-between w-full px-1 group"
          >
            <div className="flex items-center gap-3">
              <Zap className={cn("w-4 h-4 transition-colors", isAvailabilityOpen ? "text-primary-600" : "text-warm-gray-400")} />
              <span className="text-sm font-bold text-warm-gray-900 uppercase tracking-wider">
                Status
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-warm-gray-400 transition-transform duration-300", isAvailabilityOpen && "rotate-180")} />
          </button>

          {isAvailabilityOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
              <label className="flex items-center gap-3 cursor-pointer group px-1">
                <div className="relative flex items-center">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) => onInStockChange(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="w-5 h-5 border-2 border-warm-gray-300 rounded-md bg-white peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all duration-300" />
                  <CheckCircle className="absolute inset-0 w-5 h-5 text-white opacity-0 peer-checked:opacity-100 transition-opacity scale-75" />
                </div>
                <span className="text-sm text-warm-gray-600 font-medium group-hover:text-warm-gray-900 transition-colors">
                  In Stock Only
                </span>
              </label>
            </div>
          )}
        </div>

        {/* Rating Filter */}
        <div className="space-y-4 pt-4 border-t border-warm-gray-100">
          <button
            onClick={() => setIsRatingOpen(!isRatingOpen)}
            className="flex items-center justify-between w-full px-1 group"
          >
            <div className="flex items-center gap-3">
              <Star className={cn("w-4 h-4 transition-colors", isRatingOpen ? "text-primary-600" : "text-warm-gray-400")} />
              <span className="text-sm font-bold text-warm-gray-900 uppercase tracking-wider">
                Rating
              </span>
            </div>
            <ChevronDown className={cn("w-4 h-4 text-warm-gray-400 transition-transform duration-300", isRatingOpen && "rotate-180")} />
          </button>

          {isRatingOpen && (
            <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
              {[4, 3, 2, 1].map((rating) => (
                <button
                  key={rating}
                  onClick={() =>
                    onMinRatingChange(minRating === rating ? null : rating)
                  }
                  className={cn(
                    "flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border transition-all duration-300 text-xs font-bold",
                    minRating === rating
                      ? "bg-primary-50 border-primary-200 text-primary-700 shadow-sm"
                      : "bg-white border-warm-gray-200 text-warm-gray-500 hover:border-primary-200 hover:text-primary-600"
                  )}
                >
                  <Star className={cn("w-3 h-3", minRating === rating ? "fill-current" : "")} />
                  {rating}+
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Brands Filter */}
        {availableBrands && availableBrands.length > 0 && (
          <div className="space-y-4 pt-4 border-t border-warm-gray-100">
            <button
              onClick={() => setIsBrandsOpen(!isBrandsOpen)}
              className="flex items-center justify-between w-full px-1 group"
            >
              <div className="flex items-center gap-3">
                <Shield className={cn("w-4 h-4 transition-colors", isBrandsOpen ? "text-primary-600" : "text-warm-gray-400")} />
                <span className="text-sm font-bold text-warm-gray-900 uppercase tracking-wider">
                  Brands
                </span>
              </div>
              <ChevronDown className={cn("w-4 h-4 text-warm-gray-400 transition-transform duration-300", isBrandsOpen && "rotate-180")} />
            </button>

            {isBrandsOpen && (
              <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide pr-2 animate-in fade-in slide-in-from-top-2 duration-300">
                {availableBrands.map((brand) => {
                  const isSelected = selectedBrands?.includes(brand) || false;
                  return (
                    <label
                      key={brand}
                      className="flex items-center gap-3 cursor-pointer group"
                    >
                      <div className="relative flex items-center">
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
                          className="peer sr-only"
                        />
                        <div className="w-4 h-4 border-2 border-warm-gray-300 rounded peer-checked:bg-primary-600 peer-checked:border-primary-600 transition-all duration-300" />
                        <CheckCircle className="absolute inset-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity scale-75" />
                      </div>
                      <span
                        className={cn(
                          "text-sm font-medium transition-colors",
                          isSelected ? "text-primary-700" : "text-warm-gray-600 group-hover:text-warm-gray-900"
                        )}
                      >
                        {brand}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
