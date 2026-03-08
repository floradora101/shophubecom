/**
 * ReviewsTab Component
 *
 * Displays product reviews with sorting, filtering, and write review functionality.
 * - Mock mode: read-only mock content
 * - Real mode: backend-backed reviews with create support
 */

"use client";

import { useState, useMemo, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, PenTool } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { USE_MOCKS } from "@/lib/flags";
import { getReviewsForProduct } from "@/lib/mock-data/mock-reviews";
import type { Product } from "@/features/products/types";
import type { Review, ReviewStats } from "@/lib/mock-data/mock-reviews";
import { ReviewCard } from "./ReviewCard";
import { ReviewsSummary } from "./ReviewsSummary";
import { WriteReviewDialog } from "./WriteReviewDialog";
import { useReviewSorting } from "../hooks/useReviewSorting";
import { useClickOutside } from "../hooks/useClickOutside";
import { useProductReviewsQuery } from "@/features/reviews/queries";
import { useAuthStore } from "@/store/auth-store";
import { buildLoginRedirect } from "@/features/auth/routes";

interface ReviewsTabProps {
  product: Product;
}

type SortOption = "newest" | "oldest" | "highest" | "lowest";

function mapApiReviewToReview(
  r: { id: string; userName: string; rating: number; title: string | null; content: string; verified: boolean; helpful: number; createdAt: string }
): Review {
  return {
    id: r.id,
    userId: "",
    userName: r.userName,
    userAvatar: undefined,
    rating: r.rating,
    title: r.title ?? "",
    content: r.content,
    date: new Date(r.createdAt),
    verified: r.verified,
    helpful: r.helpful,
  };
}

export function ReviewsTab({ product }: ReviewsTabProps) {
  const router = useRouter();
  const pathname = usePathname();
  const isAuthenticated = useAuthStore((s) => s.status) === "authenticated";

  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [writeReviewOpen, setWriteReviewOpen] = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  const productIdOrSlug = product.slug ?? product.id;

  const mockData = useMemo(
    () => (USE_MOCKS ? getReviewsForProduct(product.id) : null),
    [product.id]
  );

  const { data: apiData, isLoading } = useProductReviewsQuery(
    productIdOrSlug,
    { sortBy, limit: 50 },
    { enabled: !USE_MOCKS }
  );

  const reviews: Review[] = USE_MOCKS
    ? mockData?.reviews ?? []
    : (apiData?.data ?? []).map(mapApiReviewToReview);

  const stats: ReviewStats | null = USE_MOCKS
    ? mockData?.stats ?? null
    : apiData?.stats
      ? {
          averageRating: apiData.stats.averageRating,
          totalReviews: apiData.stats.totalReviews,
          ratingDistribution: apiData.stats.ratingDistribution,
          verifiedReviews: apiData.stats.verifiedReviews,
          averageHelpful: 0,
        }
      : null;

  useClickOutside(sortRef, () => setIsSortOpen(false), isSortOpen);

  const sortedReviews = useReviewSorting({ reviews, sortBy });
  const displayedReviews = showAllReviews
    ? sortedReviews
    : sortedReviews.slice(0, 3);

  const handleWriteReview = () => {
    if (USE_MOCKS) {
      toast.info("Reviews are read-only in mock mode.");
      return;
    }
    if (!isAuthenticated) {
      toast.info("Please log in to write a review.");
      router.push(buildLoginRedirect("/login", pathname));
      return;
    }
    setWriteReviewOpen(true);
  };

  if (!USE_MOCKS && isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-warm-gray-300 bg-warm-gray-50/60 p-6 text-center">
        <p className="text-sm text-muted-fg">Loading reviews…</p>
      </div>
    );
  }

  if (!USE_MOCKS && !apiData && !isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-warm-gray-300 bg-warm-gray-50/60 p-6 text-center">
        <h3 className="text-base font-semibold text-warm-gray-900">
          No reviews yet
        </h3>
        <p className="mt-2 text-sm text-warm-gray-600">
          Be the first to share your experience with this product.
        </p>
        <Button
          onClick={handleWriteReview}
          variant="outline"
          size="sm"
          className="mt-4"
        >
          <PenTool className="mr-2 h-4 w-4" />
          Write Review
        </Button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-xl border border-dashed border-warm-gray-300 bg-warm-gray-50/60 p-6 text-center">
        <p className="text-sm text-muted-fg">No review data available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <WriteReviewDialog
        productIdOrSlug={productIdOrSlug}
        productName={product.name}
        open={writeReviewOpen}
        onOpenChange={setWriteReviewOpen}
      />

      <ReviewsSummary stats={stats} />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h3 className="text-base sm:text-lg font-display font-bold text-foreground">
          Customer Reviews ({stats.totalReviews})
        </h3>
        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            onClick={handleWriteReview}
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none h-8 sm:h-9 text-[11px] sm:text-xs"
          >
            <PenTool className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
            Write Review
          </Button>

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

      <div className="space-y-4">
        {displayedReviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>

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
  );
}
