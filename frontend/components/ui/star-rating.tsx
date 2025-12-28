import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number; // Rating out of 5
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function StarRating({
  rating,
  reviewCount,
  size = "sm",
  showCount = true,
  className,
}: StarRatingProps) {
  const sizeClasses = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Calculate full stars, half stars, and empty stars
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {/* Stars */}
      <div className="flex items-center">
        {/* Full stars */}
        {Array.from({ length: fullStars }, (_, i) => (
          <Star
            key={`full-${i}`}
            className={cn(
              sizeClasses[size],
              "fill-amber-400 text-amber-400 transition-colors duration-200"
            )}
          />
        ))}

        {/* Half star */}
        {hasHalfStar && (
          <div className="relative">
            <Star
              className={cn(
                sizeClasses[size],
                "text-warm-gray-300 transition-colors duration-200"
              )}
            />
            <div className="absolute inset-0 overflow-hidden w-1/2">
              <Star
                className={cn(
                  sizeClasses[size],
                  "fill-amber-400 text-amber-400"
                )}
              />
            </div>
          </div>
        )}

        {/* Empty stars */}
        {Array.from({ length: emptyStars }, (_, i) => (
          <Star
            key={`empty-${i}`}
            className={cn(
              sizeClasses[size],
              "text-warm-gray-300 transition-colors duration-200"
            )}
          />
        ))}
      </div>

      {/* Rating number and review count */}
      <div className="flex items-center gap-1 ml-1">
        <span
          className={cn(
            textSizeClasses[size],
            "font-medium text-warm-gray-900"
          )}
        >
          {rating.toFixed(1)}
        </span>
        {showCount && reviewCount !== undefined && (
          <span className={cn(textSizeClasses[size], "text-warm-gray-500")}>
            ({reviewCount})
          </span>
        )}
      </div>
    </div>
  );
}
