/**
 * ProductResultsHeader Component
 *
 * Displays results count, sort dropdown, grid layout controls, and mobile filters button.
 */

"use client";

import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, List, LayoutGrid, Grid3X3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { SORT_OPTIONS } from "../catalog.constants";
import type { CanonicalFilters } from "@/features/products/utils/filters";

interface ProductResultsHeaderProps {
  totalResults: number;
  currentPageResults: number;
  searchTerm?: string | null;
  currentSort: CanonicalFilters["sortBy"];
  onSortChange: (sortBy: CanonicalFilters["sortBy"]) => void;
  gridLayout: "cozy" | "compact" | "list";
  onGridLayoutChange: (layout: "cozy" | "compact" | "list") => void;
  onOpenFilters: () => void;
}

export function ProductResultsHeader({
  totalResults,
  currentPageResults,
  searchTerm,
  currentSort,
  onSortChange,
  gridLayout,
  onGridLayoutChange,
  onOpenFilters,
}: ProductResultsHeaderProps) {
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortRef.current && !sortRef.current.contains(event.target as Node)) {
        setIsSortOpen(false);
      }
    };

    if (isSortOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isSortOpen]);

  const currentSortLabel =
    SORT_OPTIONS.find((o) => o.value === currentSort)?.label ||
    SORT_OPTIONS[0].label;

  return (
    <div className="flex items-center justify-between gap-4 mb-4">
      {/* Results Count */}
      <div className="text-sm text-muted-fg">
        <span className="font-semibold text-fg">{currentPageResults}</span>
        <span className="mx-1">of</span>
        <span className="text-muted-fg">{totalResults}</span>
        <span className="ml-1">products</span>
        {searchTerm && (
          <span className="ml-2 text-primary-600">
            for &quot;{searchTerm}&quot;
          </span>
        )}
      </div>

      {/* Sort and Grid Controls */}
      <div className="flex items-center gap-2">
        <div className="hidden sm:flex items-center bg-warm-gray-100 p-1 rounded-lg mr-2">
          <button
            onClick={() => onGridLayoutChange("cozy")}
            className={cn(
              "p-1.5 rounded-md transition-all duration-200",
              gridLayout === "cozy"
                ? "bg-white shadow-sm text-primary-600"
                : "text-warm-gray-500 hover:text-warm-gray-900"
            )}
            title="Cozy View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGridLayoutChange("compact")}
            className={cn(
              "p-1.5 rounded-md transition-all duration-200",
              gridLayout === "compact"
                ? "bg-white shadow-sm text-primary-600"
                : "text-warm-gray-500 hover:text-warm-gray-900"
            )}
            title="Compact View"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onGridLayoutChange("list")}
            className={cn(
              "p-1.5 rounded-md transition-all duration-200",
              gridLayout === "list"
                ? "bg-white shadow-sm text-primary-600"
                : "text-warm-gray-500 hover:text-warm-gray-900"
            )}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>

        {/* Sort Dropdown */}
        <div className="relative" ref={sortRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSortOpen(!isSortOpen)}
            className="gap-2 w-full sm:w-auto justify-between sm:justify-center"
            aria-expanded={isSortOpen}
            aria-haspopup="true"
          >
            <span className="hidden sm:inline">{currentSortLabel}</span>
            <span className="sm:hidden">Sort</span>
            <ChevronDown
              className={cn(
                "h-4 w-4 transition-transform",
                isSortOpen && "rotate-180 text-primary-600"
              )}
            />
          </Button>

          {isSortOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border rounded-lg shadow-lg z-50">
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onSortChange(option.value as CanonicalFilters["sortBy"]);
                    setIsSortOpen(false);
                  }}
                  className={cn(
                    "block w-full text-left px-3 py-2 text-sm transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                    currentSort === option.value
                      ? "text-primary-600 font-medium bg-primary-50"
                      : "text-muted-fg hover:bg-red-50 hover:scale-105"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Filters Button (Mobile) */}
        <Button
          variant="outline"
          size="sm"
          onClick={onOpenFilters}
          className="gap-2 lg:hidden"
          aria-label="Open filters"
        >
          <Filter className="h-4 w-4" />
          <span className="hidden sm:inline">Filters</span>
        </Button>
      </div>
    </div>
  );
}
