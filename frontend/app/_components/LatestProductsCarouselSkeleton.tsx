/**
 * LatestProductsCarousel Skeleton Component
 *
 * Server component - pure presentational skeleton UI for LatestProductsCarousel section.
 * Extracted from DealsCarousel.tsx to enable server-side rendering.
 */

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";

/**
 * Skeleton loader for LatestProductsCarousel component
 * Shows horizontal scroll layout with multiple product card placeholders
 */
export function LatestProductsCarouselSkeleton() {
  return (
    <Section
      spacing="md"
      className="relative overflow-hidden bg-transparent"
      withContainer={false}
    >
      <Container className="relative z-10">
        <div className="space-y-8">
          {/* Header skeleton */}
          <div className="text-center md:text-left space-y-4">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
              <SkeletonBlock className="w-4 h-4 rounded-lg shrink-0" />
              <SkeletonBlock className="h-4 w-32 rounded-lg" />
            </div>
            <SkeletonBlock className="h-10 w-64 sm:w-80 mx-auto md:mx-0 rounded-lg" />
            <SkeletonBlock className="h-5 w-full max-w-md mx-auto md:mx-0 rounded-lg" />
          </div>

          {/* Carousel skeleton */}
          <div className="flex gap-6 overflow-x-auto pb-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="shrink-0 w-[280px]">
                <div className="bg-white rounded-lg shadow-lg border border-warm-gray-200 overflow-hidden">
                  {/* Image */}
                  <SkeletonBlock className="aspect-square" />

                  {/* Content */}
                  <div className="p-4 space-y-3">
                    <SkeletonBlock className="h-5 w-full rounded" />
                    <SkeletonBlock className="h-4 w-3/4 rounded" />
                    <div className="flex items-center justify-between">
                      <SkeletonBlock className="h-6 w-16 rounded" />
                      <SkeletonBlock className="h-8 w-8 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
