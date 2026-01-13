import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface StarRatingProps {
  rating: number; // Rating out of 5
  reviewCount?: number;
  size?: "xs" | "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

interface InteractiveStarRatingProps {
  value: number;
  onChange: (rating: number) => void;
  size?: "xs" | "sm" | "md" | "lg";
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
    xs: "h-3 w-3",
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  const textSizeClasses = {
    xs: "text-[10px]",
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Calculate full stars and partial star fill percentage
  const fullStars = Math.floor(rating);
  const partialFill = rating % 1; // Decimal portion (0.0 to 0.9)
  const emptyStars = 5 - fullStars - (partialFill > 0 ? 1 : 0);

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
              "fill-current text-primary transition-colors duration-200"
            )}
          />
        ))}

        {/* Partial star */}
        {partialFill > 0 && (
          <div className="relative">
            <Star
              className={cn(
                sizeClasses[size],
                "text-muted-foreground transition-colors duration-200"
              )}
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${partialFill * 100}%` }}
            >
              <Star
                className={cn(sizeClasses[size], "fill-current text-primary")}
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
              "text-muted-foreground transition-colors duration-200"
            )}
          />
        ))}
      </div>

      {/* Rating number and review count */}
      <div className="flex items-center gap-1 ml-1">
        <span
          className={cn(textSizeClasses[size], "font-medium text-foreground")}
        >
          {rating.toFixed(1)}
        </span>
        {showCount && reviewCount !== undefined && (
          <span className={cn(textSizeClasses[size], "text-muted-foreground")}>
            ({reviewCount})
          </span>
        )}
      </div>
    </div>
  );
}

export function InteractiveStarRating({
  value,
  onChange,
  size = "md",
  className,
}: InteractiveStarRatingProps) {
  const sizeClasses = {
    xs: "h-3.5 w-3.5",
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  const handleStarClick = (rating: number) => {
    onChange(rating);
  };

  return (
    <div className={cn("flex items-center gap-1", className)}>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleStarClick(star)}
            className="transition-colors duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 rounded"
            aria-label={`Rate ${star} star${star !== 1 ? "s" : ""}`}
          >
            <Star
              className={cn(
                sizeClasses[size],
                star <= value
                  ? "fill-current text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            />
          </button>
        ))}
      </div>
      <span className="ml-2 text-sm text-muted-foreground">
        {value > 0 ? `${value} star${value !== 1 ? "s" : ""}` : "Select rating"}
      </span>
    </div>
  );
}
