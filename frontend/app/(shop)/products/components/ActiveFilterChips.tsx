/**
 * Active Filter Chips Component
 *
 * Displays active filters as removable chips with a "Clear all" option.
 * Horizontally scrollable on mobile.
 */
"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { formatPrice } from "@/lib/utils";
import type { CanonicalFilters } from "@/features/products/utils/filters";
import type { Category } from "@/features/products/types";

interface ActiveFilterChipsProps {
  filters: CanonicalFilters;
  categories: Category[];
  onRemoveFilter: (filterType: keyof CanonicalFilters) => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  filters,
  categories,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterChipsProps) {
  const activeFilters: Array<{
    key: keyof CanonicalFilters;
    label: string;
    value: string;
  }> = [];

  // Category filter
  if (filters.category) {
    const category = categories.find((c) => c.slug === filters.category);
    if (category) {
      activeFilters.push({
        key: "category",
        label: "Category",
        value: category.name,
      });
    }
  }

  // Search filter
  if (filters.search) {
    activeFilters.push({
      key: "search",
      label: "Search",
      value: filters.search,
    });
  }

  // Price range filter
  if (filters.minPrice !== null || filters.maxPrice !== null) {
    const min = filters.minPrice ?? 0;
    const max = filters.maxPrice ?? Number.MAX_SAFE_INTEGER;
    activeFilters.push({
      key: "minPrice",
      label: "Price",
      value: `${formatPrice(min)} - ${formatPrice(max)}`,
    });
  }

  // In stock filter
  if (filters.inStockOnly) {
    activeFilters.push({
      key: "inStockOnly",
      label: "In Stock",
      value: "Only",
    });
  }

  // Sort filter (only show if not default)
  if (filters.sortBy !== "latest") {
    const sortLabels: Record<string, string> = {
      "price-low": "Price: Low to High",
      "price-high": "Price: High to Low",
      name: "Name: A-Z",
    };
    activeFilters.push({
      key: "sortBy",
      label: "Sort",
      value: sortLabels[filters.sortBy] || filters.sortBy,
    });
  }

  // Rating filter
  if (filters.minRating !== null) {
    activeFilters.push({
      key: "minRating",
      label: "Rating",
      value: `${filters.minRating}+ Stars`,
    });
  }

  // Brands filter
  if (filters.brands && filters.brands.length > 0) {
    if (filters.brands.length === 1) {
      activeFilters.push({
        key: "brands",
        label: "Brand",
        value: filters.brands[0],
      });
    } else {
      activeFilters.push({
        key: "brands",
        label: "Brands",
        value: `${filters.brands.length} selected`,
      });
    }
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide py-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-xs font-bold text-warm-gray-400 uppercase tracking-widest mr-2 shrink-0">
          Active:
        </span>
        {activeFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant="secondary"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 group hover:border-primary-200 hover:bg-primary-50 hover:shadow-md",
              "bg-white border border-warm-gray-200",
              "text-xs font-semibold whitespace-nowrap"
            )}
          >
            <span className="text-warm-gray-400 font-medium">
              {filter.label}
            </span>
            <span className="text-warm-gray-900 border-l border-warm-gray-200 pl-2 ml-1">
              {filter.value}
            </span>
            <button
              onClick={() => onRemoveFilter(filter.key)}
              className={cn(
                "ml-2 rounded-full p-1 bg-warm-gray-100",
                "hover:bg-primary-600 hover:text-white group-hover:scale-110",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                "transition-all duration-300"
              )}
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Clear All Button */}
      {activeFilters.length > 0 && (
        <button
          onClick={onClearAll}
          className="shrink-0 text-xs font-bold text-primary-600 hover:text-primary-700 underline underline-offset-4 decoration-primary-600/30 hover:decoration-primary-600 transition-all px-2"
          aria-label="Clear all filters"
        >
          Clear Selection
        </button>
      )}
    </div>
  );
}
