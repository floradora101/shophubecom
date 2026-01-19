/**
 * CategorySpotlight Skeleton Component
 *
 * Server component - pure presentational skeleton UI for CategorySpotlight section.
 * Extracted from CategorySpotlight.tsx to enable server-side rendering.
 */

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";

/**
 * Skeleton loader for Category Spotlight component
 * Updated for the new 2026 Hub layout
 */
export function CategorySpotlightSkeleton() {
  return (
    <Section className="bg-white relative overflow-hidden py-16 sm:py-24">
      <Container>
        <div className="space-y-8 sm:space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-gray-100 pb-8">
            <div className="space-y-4 w-full md:w-auto">
              <SkeletonBlock className="h-6 w-32 rounded-lg" />
              <SkeletonBlock className="h-10 sm:h-14 w-full sm:w-[500px] rounded-lg" />
            </div>
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 sm:pb-0">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBlock
                  key={i}
                  className="h-10 sm:h-12 w-28 sm:w-32 rounded-lg shrink-0"
                />
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-6 sm:gap-10">
            <SkeletonBlock className="lg:col-span-6 xl:col-span-5 h-[500px] sm:h-[700px] rounded-lg" />
            <div className="lg:col-span-6 xl:col-span-7 grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-8">
              {[1, 2, 3, 4].map((i) => (
                <SkeletonBlock
                  key={i}
                  className="h-[280px] sm:h-[320px] rounded-lg"
                />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
