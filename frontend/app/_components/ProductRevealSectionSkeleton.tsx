/**
 * ProductRevealSection Skeleton Component
 *
 * Server component - pure presentational skeleton UI for ProductRevealSection section.
 * Extracted from ProductRevealSection.tsx to enable server-side rendering.
 */

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { BackgroundGradients } from "./shared/BackgroundGradients";

/**
 * Skeleton loader for ProductRevealSection component
 * Shows section header skeleton and swipe reveal card skeletons
 */
export function ProductRevealSectionSkeleton() {
  return (
    <Section
      spacing="lg"
      className="relative overflow-hidden bg-transparent"
      withContainer={false}
    >
      <BackgroundGradients variant="decorative" />

      <Container className="relative z-10">
        <div className="space-y-12">
          {/* Header Skeleton - matches consistent SectionHeader structure */}
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/10 mb-2 mx-auto md:mx-0">
              <SkeletonBlock className="w-4 h-4 rounded" />
              <SkeletonBlock className="h-3 w-40 rounded-lg" />
            </div>
            <SkeletonBlock className="h-10 w-64 xs:w-80 md:w-96 rounded-lg mx-auto md:mx-0" />
            <SkeletonBlock className="h-5 w-full max-w-md rounded-lg mx-auto md:mx-0" />
          </div>

          {/* Reveal Cards Grid - matches production: responsive grid layout with 2026 rounded corners */}
          <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="relative">
                <div className="relative rounded-lg shadow-sm border border-gray-100 overflow-hidden min-h-[360px] xs:min-h-[400px] sm:min-h-[480px] bg-gray-900">
                  {/* Card content skeleton - matches SwipeRevealCard structure */}
                  <div className="p-4 xs:p-6 h-full flex flex-col items-center justify-center">
                    <SkeletonBlock className="w-[75%] xs:w-[85%] max-w-[180px] xs:max-w-[250px] sm:max-w-[300px] aspect-square rounded-lg mb-4 sm:mb-8" />
                    <div className="space-y-2 sm:space-y-3 w-full max-w-[200px] xs:max-w-[240px] sm:max-w-xs">
                      <SkeletonBlock className="h-6 sm:h-7 w-full rounded" />
                      <SkeletonBlock className="h-4 sm:h-5 w-2/3 rounded mx-auto" />
                    </div>
                  </div>

                  {/* Swipe handle skeleton */}
                  <div
                    className="absolute top-0 bottom-0 z-20 flex items-center justify-center select-none"
                    style={{ left: "50%", transform: "translateX(-50%)" }}
                  >
                    <SkeletonBlock className="w-10 h-10 rounded-full" />
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
