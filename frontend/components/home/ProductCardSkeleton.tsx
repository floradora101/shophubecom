// Enhanced skeleton placeholder for ProductCard with shimmer effect
export function ProductCardSkeleton({
  delayClass = "animate-shimmer",
}: {
  delayClass?: string;
}) {
  return (
    <div className="group flex flex-col w-full">
      {/* Image Card Section Skeleton */}
      <div
        className={`relative aspect-square rounded-lg overflow-hidden bg-gray-200 border border-warm-gray-200 ${delayClass}`}
      />

      {/* Product Info Below Image Skeleton */}
      <div className="mt-3 space-y-1 min-h-16 flex flex-col justify-end">
        {/* Product name skeleton - matches the line-clamp-2 */}
        <div className={`h-4 md:h-5 bg-gray-200 rounded ${delayClass}`} />
        <div className={`h-4 md:h-5 bg-gray-200 rounded w-3/4 ${delayClass}`} />

        {/* Rating skeleton (optional) - matches StarRating component */}
        <div className={`h-3 bg-gray-200 rounded w-1/2 mt-1 ${delayClass}`} />

        {/* Price skeleton - matches the pricing layout */}
        <div className="flex items-baseline gap-2 flex-wrap mt-2">
          <div
            className={`h-4 md:h-5 bg-gray-200 rounded w-16 ${delayClass}`}
          />
          <div className={`h-3 bg-gray-200 rounded w-12 ${delayClass}`} />
          <div className={`h-3 bg-gray-200 rounded w-20 ${delayClass}`} />
        </div>
      </div>
    </div>
  );
}
