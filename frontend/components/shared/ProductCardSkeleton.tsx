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
        <div className="flex-1 space-y-1.5">
          {/* Product name */}
          <SkeletonBlock className="h-4" />
          <SkeletonBlock className="h-4 w-3/4" />
          {/* Description */}
          <SkeletonBlock className="h-3 w-full" />
          {/* Rating */}
          <SkeletonBlock className="h-3 w-20" />
          {/* Price */}
          <SkeletonBlock className="h-4 w-16" />
        </div>
      )}

      {/* Image Card Section Skeleton */}
      <SkeletonBlock
        className={cn(
          "relative rounded-xl overflow-hidden",
          layout === "horizontal" ? "aspect-square w-full max-w-48 shrink-0" : "aspect-square w-full"
        )}
      />

      {/* Product Info Below Image Skeleton (Vertical only) */}
      {layout === "vertical" && (
        <div className="mt-3 space-y-1.5">
          {/* Product name skeleton */}
          <SkeletonBlock className="h-4 w-4/5" />
          {/* Description skeleton */}
          <SkeletonBlock className="h-3 w-full" />
          <SkeletonBlock className="h-3 w-3/4" />
          {/* Rating skeleton */}
          <SkeletonBlock className="h-3 w-20 mt-0.5" />
          {/* Price skeleton */}
          <SkeletonBlock className="h-4 w-16" />
        </div>
      )}
    </div>
  );
}
