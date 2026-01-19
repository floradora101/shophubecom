/**
 * ReviewsTab Component
 *
 * Displays product reviews with sorting, filtering, and write review functionality.
 */

"use client";

import { useState, useMemo, useRef } from "react";
import dynamic from "next/dynamic";
import { ChevronDown, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { logger } from "@/lib/logger";
import { mockReviews, mockReviewStats } from "@/lib/mock-data/mock-reviews";
import type { Product } from "@/features/products/types";
import { ReviewCard } from "./ReviewCard";
import { ReviewsSummary } from "./ReviewsSummary";
import { useReviewSorting } from "../hooks/useReviewSorting";
import { useClickOutside } from "../hooks/useClickOutside";

// Dynamically import WriteReviewModal (heavy component with form, steps, etc.)
// Only loads when modal is actually opened
const WriteReviewModal = dynamic(
  () =>
    import("../../WriteReviewModal").then((mod) => ({
      default: mod.WriteReviewModal,
    })),
  {
    ssr: false, // Modal is client-only
  }
);

interface ReviewsTabProps {
  product: Product;
}

type SortOption = "newest" | "oldest" | "highest" | "lowest";

export function ReviewsTab({ product }: ReviewsTabProps) {
  const { reviews, stats } = useMemo(
    () => ({
      reviews: mockReviews,
      stats: mockReviewStats,
    }),
    []
  );

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showWriteReviewModal, setShowWriteReviewModal] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  // Close sort dropdown when clicking outside
  useClickOutside(sortRef, () => setIsSortOpen(false), isSortOpen);

  // Sort reviews
  const sortedReviews = useReviewSorting({ reviews, sortBy });

  const displayedReviews = showAllReviews
    ? sortedReviews
    : sortedReviews.slice(0, 3);

  const handleReviewSubmit = async (reviewData: {
    rating: number;
    content: string;
    userName: string;
    userEmail: string;
  }) => {
    // In a real app, this would submit to an API
    logger.debug("Submitting review:", reviewData);

    // For demo purposes, we'll just show an alert
    alert(
      "Thank you for your review! In a real application, this would be saved to the database."
    );
  };

  return (
    <>
      <div className="space-y-6">
        {/* Reviews Summary */}
        <ReviewsSummary stats={stats} />

        {/* Reviews Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h3 className="text-base sm:text-lg font-display font-bold text-foreground">
            Customer Reviews ({stats.totalReviews})
          </h3>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button
              onClick={() => setShowWriteReviewModal(true)}
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none h-8 sm:h-9 text-[11px] sm:text-xs"
            >
              <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
              Write Review
            </Button>

            {/* Sort Dropdown - Consistent with products page */}
            <div className="relative flex-1 sm:flex-none" ref={sortRef}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSortOpen(!isSortOpen)}
                className="w-full sm:w-auto gap-1.5 sm:gap-2 h-8 sm:h-9 text-[11px] sm:text-xs"
                aria-expanded={isSortOpen}
                aria-haspopup="true"
              >
                <span className="truncate">
                  {sortBy === "newest" && "Newest"}
                  {sortBy === "oldest" && "Oldest"}
                  {sortBy === "highest" && "Highest"}
                  {sortBy === "lowest" && "Lowest"}
                </span>
                <ChevronDown
                  className={cn(
                    "h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform shrink-0",
                    isSortOpen && "rotate-180 text-primary-600"
                  )}
                />
              </Button>

              {isSortOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 border border-border rounded-lg shadow-lg z-50">
                  {[
                    { value: "newest", label: "Newest First" },
                    { value: "oldest", label: "Oldest First" },
                    { value: "highest", label: "Highest Rated" },
                    { value: "lowest", label: "Lowest Rated" },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSortBy(option.value as SortOption);
                        setIsSortOpen(false);
                      }}
                      className={cn(
                        "block w-full text-left px-3 py-2 text-sm transition-colors",
                        "focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2",
                        sortBy === option.value
                          ? "bg-primary-50 text-primary-600"
                          : "hover:bg-surface-muted"
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {displayedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>

        {/* Show More/Less Button */}
        {reviews.length > 3 && (
          <div className="text-center pt-2 sm:pt-4">
            <Button
              variant="outline"
              onClick={() => setShowAllReviews(!showAllReviews)}
              className="w-full sm:w-auto px-6 h-10 sm:h-11 text-xs sm:text-sm font-bold uppercase tracking-widest"
            >
              {showAllReviews
                ? "Show Less"
                : `Show All ${reviews.length} Reviews`}
            </Button>
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      <WriteReviewModal
        isOpen={showWriteReviewModal}
        onClose={() => setShowWriteReviewModal(false)}
        product={product}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}
