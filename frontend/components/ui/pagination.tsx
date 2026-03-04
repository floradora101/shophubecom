"use client";

/**
 * Unified pagination component.
 * Used across products, orders, and other paginated lists.
 */

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { NavigationButton } from "@/components/ui/navigation-button";
import { cn } from "@/lib/utils/cn";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Disable buttons during loading */
  isLoading?: boolean;
  /** Optional: show "Showing X to Y of Z items" (requires totalItems + itemsPerPage) */
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  totalItems,
  itemsPerPage,
  itemName = "items",
  className,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showMax = 5;

    if (totalPages <= showMax) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("ellipsis-1");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }
      if (currentPage < totalPages - 2) pages.push("ellipsis-2");
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }
    return pages;
  };

  const showRange =
    totalItems != null && itemsPerPage != null && totalItems > 0;
  const startItem = (currentPage - 1) * (itemsPerPage ?? 1) + 1;
  const endItem = Math.min(
    currentPage * (itemsPerPage ?? 1),
    totalItems ?? 0
  );

  return (
    <div
      className={cn(
        "flex flex-col items-center gap-4 py-8",
        className
      )}
    >
      <div className="flex items-center gap-1 sm:gap-3">
        <NavigationButton
          direction="left"
          variant="secondary"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || isLoading}
          className="h-9 w-9 sm:h-11 sm:w-11"
          aria-label="Previous page"
        />

        <div className="flex items-center gap-1 sm:gap-2">
          {getPageNumbers().map((page, index) => {
            if (typeof page === "string") {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-muted-fg"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              );
            }
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                disabled={isLoading}
                className={cn(
                  "w-8 h-8 sm:w-10 sm:h-10 rounded-full text-sm font-semibold transition-all duration-300",
                  "flex items-center justify-center border",
                  isActive
                    ? "bg-primary-600 border-primary-600 text-white shadow-lg shadow-primary-600/20 scale-110"
                    : "bg-white border-warm-gray-200 text-warm-gray-600 hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50"
                )}
                aria-current={isActive ? "page" : undefined}
                aria-label={`Page ${page}`}
              >
                {page}
              </button>
            );
          })}
        </div>

        <NavigationButton
          direction="right"
          variant="secondary"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || isLoading}
          className="h-9 w-9 sm:h-11 sm:w-11"
          aria-label="Next page"
        />
      </div>

      <div className="text-xs sm:text-sm text-muted-fg font-medium animate-in fade-in duration-500">
        {showRange ? (
          <>
            Showing <span className="text-fg">{startItem}</span> to{" "}
            <span className="text-fg">{endItem}</span> of{" "}
            <span className="text-fg">{totalItems}</span> {itemName}
          </>
        ) : (
          <>
            Page <span className="text-fg">{currentPage}</span> of{" "}
            <span className="text-fg">{totalPages}</span>
          </>
        )}
      </div>
    </div>
  );
}
