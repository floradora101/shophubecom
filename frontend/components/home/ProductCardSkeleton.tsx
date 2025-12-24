// Simple skeleton placeholder for ProductCard when products are missing
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col animate-pulse">
      {/* Image skeleton */}
      <div className="aspect-square rounded-2xl bg-warm-gray-200 border border-warm-gray-200" />

      {/* Text skeleton */}
      <div className="mt-3 space-y-2">
        <div className="h-4 bg-warm-gray-200 rounded w-3/4" />
        <div className="h-4 bg-warm-gray-200 rounded w-1/2" />
        <div className="h-5 bg-warm-gray-200 rounded w-1/3 mt-2" />
      </div>
    </div>
  );
}
