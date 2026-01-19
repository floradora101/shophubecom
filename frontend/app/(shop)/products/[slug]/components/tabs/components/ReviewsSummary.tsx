/**
 * ReviewsSummary Component
 *
 * Displays review statistics including overall rating and rating distribution.
 */

import { Star } from "lucide-react";
import { StarRating } from "@/components/ui/star-rating";
import type { ReviewStats } from "@/lib/mock-data/mock-reviews";

interface ReviewsSummaryProps {
  stats: ReviewStats;
}

export function ReviewsSummary({ stats }: ReviewsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12 mb-10 sm:mb-16 items-center bg-surface-muted/30 rounded-lg p-6 sm:p-0 sm:bg-transparent">
      {/* Overall Rating Section */}
      <div className="flex flex-col items-center justify-center py-4 sm:py-10">
        <div className="text-center space-y-4 sm:space-y-6">
          <div className="relative inline-block">
            <div className="text-5xl sm:text-7xl font-display font-black text-fg tracking-tighter">
              {stats.averageRating}
            </div>
            <div className="absolute -top-1 -right-3 sm:-right-4 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-primary-500 animate-pulse" />
          </div>
          <StarRating
            rating={stats.averageRating}
            size="md"
            showCount={false}
          />
          <div className="space-y-1 sm:space-y-2">
            <div className="text-[10px] sm:text-xs font-black text-fg uppercase tracking-[0.2em]">
              Based on {stats.totalReviews} reviews
            </div>
            <div className="text-[9px] sm:text-[10px] font-bold text-muted-fg uppercase tracking-[0.2em] opacity-60">
              {stats.verifiedReviews} verified purchases
            </div>
          </div>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="space-y-3 sm:space-y-5 flex flex-col justify-center">
        <h4 className="text-[10px] sm:text-xs font-black text-fg uppercase tracking-[0.2em] mb-2 sm:mb-4 text-center md:text-left opacity-80">
          Rating Breakdown
        </h4>
        <div className="space-y-3 sm:space-y-4">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count =
              stats.ratingDistribution[
                rating as keyof typeof stats.ratingDistribution
              ];
            const percentage = (count / stats.totalReviews) * 100;
            return (
              <div
                key={rating}
                className="flex items-center gap-3 sm:gap-4 group"
              >
                <div className="flex items-center gap-1 min-w-[45px] sm:min-w-[55px]">
                  <span className="text-[10px] sm:text-xs font-bold">
                    {rating}
                  </span>
                  <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-primary-500 text-primary-500 transition-transform group-hover:scale-125" />
                </div>
                <div className="flex-1 h-1 sm:h-1.5 bg-surface-muted sm:bg-border/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] font-bold text-muted-fg min-w-[30px] sm:min-w-[35px] text-right">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
