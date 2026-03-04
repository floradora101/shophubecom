/**
 * Active Filter Chips Component
 *
 * Displays active filters as removable chips with a "Clear all" option.
 * Horizontally scrollable on mobile.
 */
"use client";

import { X, Filter } from "lucide-react";
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

  // Promotion / Deals filter
  if (filters.promotionId) {
    activeFilters.push({
      key: "promotionId",
      label: "Deals",
      value: "Promotion",
    });
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
    <div className="flex flex-wrap items-center gap-2 py-2 sm:py-4 animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <div className="flex items-center text-xs font-bold text-warm-gray-400 uppercase tracking-widest mr-1 shrink-0 bg-warm-gray-50 px-2 py-1 rounded-md border border-warm-gray-100/50">
          <Filter className="w-3 h-3 mr-1.5 text-warm-gray-400" />
          <span>Active</span>
        </div>
        {activeFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant="secondary"
            className={cn(
              "flex items-center gap-0 px-0 py-0 rounded-full transition-all duration-300 group hover:border-primary-200 hover:bg-primary-50 hover:shadow-sm",
              "bg-white border border-warm-gray-200",
              "text-[10px] sm:text-xs font-semibold overflow-hidden"
            )}
          >
            <span className="text-warm-gray-500 font-medium px-2.5 py-1.5 bg-warm-gray-50/50 border-r border-warm-gray-100">
              {filter.label}
            </span>
            <span className="text-warm-gray-900 px-2.5 py-1.5 max-w-[120px] truncate">
              {filter.value}
            </span>
            <button
              onClick={() => onRemoveFilter(filter.key)}
              className={cn(
                "p-1.5 text-warm-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors border-l border-warm-gray-100",
                "focus:outline-none"
              )}
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}

        {/* Clear All Button integrated into the flow */}
        {activeFilters.length > 0 && (
          <button
            onClick={onClearAll}
            className="text-[10px] sm:text-xs font-bold text-primary-600 hover:text-primary-700 transition-all px-3 py-1.5 rounded-full hover:bg-primary-50 border border-transparent hover:border-primary-100 active:scale-95 flex items-center gap-1.5"
            aria-label="Clear all filters"
          >
            <span>Clear Selection</span>
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
    </div>
  );
}
