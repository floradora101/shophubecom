/**
 * Active Filter Chips Component for Categories
 *
 * Displays active filters as removable chips with a "Clear all" option.
 * Horizontally scrollable on mobile.
 */
"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { theme } from "@/lib/config/theme";
import { cn } from "@/lib/utils/cn";
import { ui } from "@/lib/ui-tokens";

interface ActiveFilterChipsProps {
  search: string | null;
  sortBy: "name-asc" | "name-desc";
  onRemoveFilter: (filterType: "search" | "sortBy") => void;
  onClearAll: () => void;
}

export function ActiveFilterChips({
  search,
  sortBy,
  onRemoveFilter,
  onClearAll,
}: ActiveFilterChipsProps) {
  const activeFilters: Array<{
    key: "search" | "sortBy";
    label: string;
    value: string;
  }> = [];

  // Search filter
  if (search) {
    activeFilters.push({
      key: "search",
      label: "Search",
      value: search,
    });
  }

  // Sort filter (only show if not default)
  if (sortBy !== "name-desc") {
    activeFilters.push({
      key: "sortBy",
      label: "Sort",
      value: "A to Z",
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex items-center overflow-x-auto scrollbar-hide pb-2",
        ui.gap.sm
      )}
    >
      {/* Chips Container - Scrollable */}
      <div className={cn("flex items-center flex-1 min-w-0", ui.gap.sm)}>
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
            "shrink-0 text-sm rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105",
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
