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
import { theme } from "../../../../lib/config/theme";
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

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-2">
      {/* Chips Container - Scrollable */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {activeFilters.map((filter) => (
          <Badge
            key={filter.key}
            variant="secondary"
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5",
              theme.radius.pill,
              "bg-white border border-warm-gray-300",
              "text-sm font-medium"
            )}
          >
            <span className={cn(theme.text.muted, "text-xs")}>
              {filter.label}:
            </span>
            <span className={cn(theme.text.body)}>{filter.value}</span>
            <button
              onClick={() => onRemoveFilter(filter.key)}
              className={cn(
                "ml-1 rounded-full p-0.5",
                "hover:bg-warm-gray-100",
                "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                "transition-colors"
              )}
              aria-label={`Remove ${filter.label} filter`}
            >
              <X className="h-3 w-3 text-warm-gray-500" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Clear All Button */}
      {activeFilters.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className={cn(
            "shrink-0 text-sm",
            theme.text.muted,
            "hover:text-warm-gray-900"
          )}
          aria-label="Clear all filters"
        >
          Clear all
        </Button>
      )}
    </div>
  );
}
