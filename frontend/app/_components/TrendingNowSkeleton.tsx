/**
 * TrendingNow Skeleton Component
 *
 * Server component - pure presentational skeleton UI for TrendingNow section.
 * Extracted from TrendingNow.tsx to enable server-side rendering.
 */

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";

/**
 * Skeleton loader for TrendingNow component
 * Shows carousel layout with multiple product card placeholders
 */
export function TrendingNowSkeleton() {
  return (
    <Section className="bg-linear-to-br from-gray-50 to-white">
      <Container size="full" className="px-4 md:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center md:text-left mb-12">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600">
              <SkeletonBlock className="w-3 h-3 rounded" />
              <SkeletonBlock className="h-3 w-32 rounded" />
            </div>
          </div>
          <SkeletonBlock className="h-5 w-64 mx-auto md:mx-0 rounded" />
        </div>

        {/* Carousel container skeleton */}
        <div className="relative">
          {/* Navigation arrows skeleton */}
          <div className="flex justify-between items-center mb-8">
            <SkeletonBlock className="w-12 h-12 rounded-full" />
            <SkeletonBlock className="w-12 h-12 rounded-full" />
          </div>

          {/* Cards container - showing 5 cards in carousel layout */}
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`shrink-0 transition-all duration-300 ${
                  i === 2 ? "scale-110 opacity-100 z-10" : "scale-90 opacity-60"
                }`}
              >
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 w-64">
                  {/* Category badge */}
                  <div className="flex justify-between items-start mb-3">
                    <SkeletonBlock className="w-16 h-6 rounded-full" />
                    <SkeletonBlock className="w-5 h-5 rounded" />
                  </div>

                  {/* Product image */}
                  <SkeletonBlock className="aspect-square rounded-lg mb-4" />

                  {/* Product details */}
                  <div className="space-y-2">
                    <SkeletonBlock className="h-5 w-full rounded" />
                    <SkeletonBlock className="h-4 w-3/4 rounded" />
                    <SkeletonBlock className="h-4 w-1/2 rounded" />
                  </div>

                  {/* Price and button */}
                  <div className="flex items-center justify-between mt-4">
                    <SkeletonBlock className="w-16 h-6 rounded" />
                    <SkeletonBlock className="w-20 h-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === 0 ? "w-8" : ""}`}
              >
                <SkeletonBlock className="w-full h-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
