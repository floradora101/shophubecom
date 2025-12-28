/**
 * Filters Sidebar Component
 *
 * Desktop sticky sidebar with filter groups:
 * - Category
 * - Price Range
 * - Rating (placeholder for future)
 * - Availability (In Stock)
 */
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";
import { Stack } from "@/components/ui/stack";
import { theme } from "../../../../lib/config/theme";
import { cn } from "@/lib/utils/cn";
import type { Category } from "@/features/products/types";

// Smart filter insights based on common user behavior
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
}

export function FiltersSidebar({
  categories,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  inStockOnly,
  onInStockChange,
}: FiltersSidebarProps) {
  // Initialize local state from props
  const [localMin, setLocalMin] = useState(() => priceRange.min.toString());
  const [localMax, setLocalMax] = useState(() => priceRange.max.toString());

  // Reset local state when priceRange prop changes externally
   
  useEffect(() => {
    setLocalMin(priceRange.min.toString());
    setLocalMax(priceRange.max.toString());
  }, [priceRange.min, priceRange.max]);

  // Build category tree
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
    const min = parseFloat(localMin);
    const max = parseFloat(localMax);
    onPriceRangeChange({
      min: isNaN(min) || min < 0 ? 0 : min,
      max: isNaN(max) || max < priceRange.min ? priceRange.max : max,
    });
  };

  const renderCategory = (
    cat: Category & { children?: Category[] },
    depth = 0
  ) => {
    const isActive = selectedCategory === cat.slug;
    return (
      <li key={cat.id} className="space-y-1">
        <button
          onClick={() => onCategoryChange(cat.slug)}
          className={cn(
            "block w-full text-left text-sm py-1.5 transition-colors",
            "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded",
            isActive
              ? "text-primary-600 font-medium"
              : cn(theme.text.body, "hover:text-primary-600")
          )}
          style={{ paddingLeft: `${depth * 16}px` }}
        >
          {cat.name}
        </button>
        {cat.children && cat.children.length > 0 && (
          <ul className="space-y-1">
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
    <Stack spacing="xl" className="sticky top-24 self-start">
      {/* Category Filter */}
      <div>
        <ul className="space-y-1">
          <li>
            <button
              onClick={() => onCategoryChange(null)}
              className={cn(
                "block w-full text-left text-sm py-1.5 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded",
                !selectedCategory
                  ? "text-primary-600 font-medium"
                  : cn(theme.text.body, "hover:text-primary-600")
              )}
            >
              All Products
            </button>
          </li>
          {categoryTree
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((category) => renderCategory(category, 0))}
        </ul>
      </div>

      {/* Smart Price Range Filter */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-4 h-4 text-primary-600" />
          <h3 className="text-sm font-semibold text-warm-gray-900 uppercase tracking-wide">
            Price Range
          </h3>
        </div>

        {/* Quick Price Presets */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-warm-gray-600 uppercase tracking-wide">
            Quick Select
          </div>
          <div className="grid grid-cols-1 gap-1">
            {PRICE_RANGES.map((preset) => (
              <button
                key={preset.label}
                onClick={() =>
                  onPriceRangeChange({ min: preset.min, max: preset.max })
                }
                className={cn(
                  "group flex items-center justify-between p-2 rounded-lg text-sm transition-all duration-200",
                  "hover:bg-primary-50 hover:border-primary-200 border border-transparent",
                  preset.popular && "relative"
                )}
              >
                <span className="text-warm-gray-700 group-hover:text-primary-700">
                  {preset.label}
                </span>
                {preset.popular && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-1.5 py-0.5 bg-primary-100 text-primary-700"
                  >
                    Popular
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Range */}
        <div className="space-y-2">
          <div className="text-xs font-medium text-warm-gray-600 uppercase tracking-wide">
            Custom Range
          </div>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label htmlFor="min-price" className="sr-only">
                  Minimum price
                </label>
                <input
                  id="min-price"
                  type="number"
                  placeholder="Min"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 text-sm",
                    theme.border.base,
                    theme.radius.card,
                    "bg-white",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                    "placeholder:text-warm-gray-400"
                  )}
                  min="0"
                  step="0.01"
                />
              </div>
              <span className={cn(theme.text.muted, "text-sm")}>—</span>
              <div className="flex-1">
                <label htmlFor="max-price" className="sr-only">
                  Maximum price
                </label>
                <input
                  id="max-price"
                  type="number"
                  placeholder="Max"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                  className={cn(
                    "w-full px-3 py-2 text-sm",
                    theme.border.base,
                    theme.radius.card,
                    "bg-white",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                    "placeholder:text-warm-gray-400"
                  )}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            <Button
              onClick={handlePriceFilter}
              size="sm"
              className="w-full"
              aria-label="Apply price filter"
            >
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Availability Filter */}
      <div>
        <h3
          className={cn(
            theme.text.heading,
            "text-sm font-semibold uppercase tracking-wide mb-4"
          )}
        >
          Availability
        </h3>
        <label className="flex items-center gap-3 cursor-pointer group">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={(e) => onInStockChange(e.target.checked)}
            className={cn(
              "w-4 h-4 rounded",
              theme.border.base,
              "text-primary-500 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            )}
            aria-label="Show only in-stock products"
          />
          <span
            className={cn(
              theme.text.body,
              "text-sm group-hover:text-warm-gray-900"
            )}
          >
            In Stock Only
          </span>
        </label>
      </div>
    </Stack>
  );
}
