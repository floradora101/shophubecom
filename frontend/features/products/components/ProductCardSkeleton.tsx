import { SkeletonBlock } from "@/components/ui/skeleton";

/**
 * Skeleton placeholder for ProductCard component
 * Matches the production ProductCard layout exactly
 */
export function ProductCardSkeleton() {
  return (
    <div className="group flex flex-col w-full">
      {/* Image Card Section Skeleton */}
      <SkeletonBlock className="relative aspect-square rounded-lg overflow-hidden border border-warm-gray-200" />

      {/* Product Info Below Image Skeleton */}
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
    </div>
  );
}
