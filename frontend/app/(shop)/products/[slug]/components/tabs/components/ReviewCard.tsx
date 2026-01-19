/**
 * ReviewCard Component
 *
 * Displays an individual product review with expand/collapse functionality.
 */

"use client";

import { useState } from "react";
import {
  CheckCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { StarRating } from "@/components/ui/star-rating";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { Review } from "@/lib/mock-data/mock-reviews";

interface ReviewCardProps {
  review: Review;
}

export function ReviewCard({ review }: ReviewCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const shouldTruncate = review.content.length > 200;
  const displayContent =
    isExpanded || !shouldTruncate
      ? review.content
      : review.content.substring(0, 200) + "...";

  return (
    <div className="py-5 sm:py-8 first:pt-0 border-b border-border/40 last:border-0 transition-all duration-300">
      <div className="space-y-4 sm:space-y-5">
        {/* Header with user info and rating */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Avatar className="h-9 w-9 sm:h-11 sm:w-11 ring-offset-2 ring-1 ring-border/50 shrink-0">
              <AvatarImage src={review.userAvatar} alt={review.userName} />
              <AvatarFallback className="bg-surface-muted text-muted-fg font-bold text-xs sm:text-base">
                {review.userName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="font-bold text-fg tracking-tight text-sm sm:text-base">
                  {review.userName}
                </span>
                {review.verified && (
                  <Badge
                    variant="success"
                    className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0 font-bold"
                  >
                    <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <div className="flex items-center gap-2 sm:gap-3 mt-0.5 sm:mt-1">
                <StarRating
                  rating={review.rating}
                  size="xs"
                  showCount={false}
                />
                <span className="text-[9px] sm:text-[10px] font-bold text-muted-fg flex items-center gap-1 uppercase tracking-widest opacity-60">
                  <Calendar className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  {formatDate(review.date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Review title and content */}
        <div className="space-y-2 sm:space-y-3">
          <h4 className="font-display font-bold text-fg text-base sm:text-lg tracking-tight leading-snug">
            {review.title}
          </h4>
          <p className="text-muted-fg leading-relaxed text-xs sm:text-base font-medium max-w-3xl">
            {displayContent}
          </p>

          {shouldTruncate && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-auto p-0 text-primary-600 hover:text-primary-600/80 hover:bg-transparent font-bold text-xs uppercase tracking-widest"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Read more
                </>
              )}
            </Button>
          )}

          {/* Product variant info */}
          {review.productVariant && (
            <div className="text-[10px] font-bold text-muted-fg bg-surface-muted px-2.5 py-1 rounded-md border border-border/40 inline-block uppercase tracking-widest">
              <span className="opacity-50">Purchased:</span>{" "}
              {review.productVariant}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
