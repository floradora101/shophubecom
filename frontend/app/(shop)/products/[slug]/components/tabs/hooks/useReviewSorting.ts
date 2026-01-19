/**
 * useReviewSorting Hook
 *
 * Handles review sorting logic.
 */

import { useMemo } from "react";
import type { Review } from "@/lib/mock-data/mock-reviews";

type SortOption = "newest" | "oldest" | "highest" | "lowest";

interface UseReviewSortingProps {
  reviews: Review[];
  sortBy: SortOption;
}

/**
 * Hook for sorting reviews based on selected option
 */
export function useReviewSorting({
  reviews,
  sortBy,
}: UseReviewSortingProps): Review[] {
  const sortedReviews = useMemo(() => {
    const sorted = [...reviews];
    switch (sortBy) {
      case "newest":
        return sorted.sort((a, b) => b.date.getTime() - a.date.getTime());
      case "oldest":
        return sorted.sort((a, b) => a.date.getTime() - b.date.getTime());
      case "highest":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "lowest":
        return sorted.sort((a, b) => a.rating - b.rating);
      default:
        return sorted;
    }
  }, [reviews, sortBy]);

  return sortedReviews;
}
