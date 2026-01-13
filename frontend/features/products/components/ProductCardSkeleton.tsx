import { SkeletonBlock } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils/cn";

interface ProductCardSkeletonProps {
  layout?: "horizontal" | "vertical";
}

/**
 * Skeleton placeholder for ProductCard component
 * Matches the production ProductCard layout exactly
 */
export function ProductCardSkeleton({
  layout = "vertical",
}: ProductCardSkeletonProps) {
  return (
    <div
      className={cn(
        "group w-full",
        layout === "horizontal"
          ? "flex flex-row gap-4 items-start"
          : "flex flex-col"
      )}
    >
      {/* For horizontal layout, text is on the left, image on the right (matching ProductCard) */}
      {layout === "horizontal" && (
        <div className="flex-1 space-y-1 mt-1">
          <SkeletonBlock className="h-4 md:h-5" />
          <SkeletonBlock className="h-4 md:h-5 w-3/4" />
          <SkeletonBlock className="h-3 w-1/2 mt-1" />
          <div className="flex items-baseline gap-2 flex-wrap mt-2">
            <SkeletonBlock className="h-4 md:h-5 w-16" />
            <SkeletonBlock className="h-3 w-12" />
          </div>
        </div>
      )}

      {/* Image Card Section Skeleton */}
      <SkeletonBlock
        className={cn(
          "relative aspect-square rounded-lg overflow-hidden border border-warm-gray-200",
          layout === "horizontal" ? "w-full max-w-48 shrink-0" : "w-full"
        )}
      />

      {/* Product Info Below Image Skeleton (Vertical only) */}
      {layout === "vertical" && (
        <div className="mt-3 space-y-1 min-h-16 flex flex-col justify-end">
          {/* Product name skeleton - matches the line-clamp-2 */}
          <SkeletonBlock className="h-4 md:h-5" />
          <SkeletonBlock className="h-4 md:h-5 w-3/4" />

          {/* Rating skeleton (optional) - matches StarRating component */}
          <SkeletonBlock className="h-3 w-1/2 mt-1" />

          {/* Price skeleton - matches the pricing layout */}
          <div className="flex items-baseline gap-2 flex-wrap mt-2">
            <SkeletonBlock className="h-4 md:h-5 w-16" />
            <SkeletonBlock className="h-3 w-12" />
            <SkeletonBlock className="h-3 w-20" />
          </div>
        </div>
      )}
    </div>
  );
}


