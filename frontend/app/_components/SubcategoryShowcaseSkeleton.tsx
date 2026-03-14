/**
 * SubcategoryShowcase Skeleton Component
 *
 * Server component - pure presentational skeleton UI for SubcategoryShowcase section.
 * Uses only SkeletonBlock for consistent loading states.
 */

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";

/**
 * Skeleton loader for SubcategoryShowcase component
 */
export function SubcategoryShowcaseSkeleton() {
  return (
    <Section spacing="lg" className="py-24">
      <Container>
        <div className="space-y-16">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
            <div className="space-y-4 flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/10 mb-2 mx-auto md:mx-0">
                <SkeletonBlock className="w-4 h-4 rounded" />
                <SkeletonBlock className="h-4 w-32 rounded" />
              </div>
              <SkeletonBlock className="h-12 w-64 xs:w-80 md:w-96 rounded-lg mx-auto md:mx-0" />
              <SkeletonBlock className="h-20 w-full max-w-2xl rounded-lg mx-auto md:mx-0" />
            </div>
            <SkeletonBlock className="h-12 w-48 rounded-lg hidden md:block shrink-0" />
          </div>

          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-12 w-32 rounded-lg shrink-0" />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5 xl:col-span-4">
              <SkeletonBlock className="aspect-[4/5] w-full rounded-lg" />
            </div>
            <div className="lg:col-span-7 xl:col-span-8">
              <div className="grid grid-cols-2 xl:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ProductCardSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
