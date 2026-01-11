import { Container } from "@/components/ui/container";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { ProductsGridSkeleton } from "@/lib/ui/loading";

export default function ProductsLoading() {
  return (
    <div className="min-h-screen">
      {/* Category Carousel Skeleton - Boutique Style */}
      <div className="bg-warm-gray-50/80 border-b border-warm-gray-100 py-10">
        <Container>
          <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div className="space-y-2">
                <SkeletonBlock className="h-6 w-32 rounded-full" />
                <SkeletonBlock className="h-10 w-64 rounded-lg" />
              </div>
              <div className="hidden sm:flex gap-3">
                <SkeletonBlock className="h-12 w-12 rounded-full" />
                <SkeletonBlock className="h-12 w-12 rounded-full" />
              </div>
            </div>
            <div className="flex gap-6 overflow-hidden">
              {Array.from({ length: 8 }, (_, i) => (
                <SkeletonBlock key={i} className="shrink-0 h-[120px] w-[140px] rounded-lg" />
              ))}
            </div>
          </div>
        </Container>
      </div>

      <Container className="py-10">
        <div className="flex gap-12 lg:gap-16">
          {/* Sidebar Skeleton */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="space-y-8">
              <SkeletonBlock className="h-8 w-full rounded-lg" />
              <div className="space-y-4">
                {Array.from({ length: 5 }, (_, i) => (
                  <SkeletonBlock key={i} className="h-6 w-3/4 rounded" />
                ))}
              </div>
              <SkeletonBlock className="h-40 w-full rounded-lg" />
            </div>
          </aside>

          {/* Grid Skeleton */}
          <div className="flex-1 space-y-8">
            <div className="flex justify-between items-center">
              <SkeletonBlock className="h-6 w-32 rounded" />
              <SkeletonBlock className="h-10 w-48 rounded-lg" />
            </div>
            <ProductsGridSkeleton count={8} />
          </div>
        </div>
      </Container>
    </div>
  );
}
