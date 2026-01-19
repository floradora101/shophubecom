/**
 * SubcategoryShowcase Skeleton Component
 *
 * Server component - pure presentational skeleton UI for SubcategoryShowcase section.
 * Extracted from SubcategoryShowcase.tsx to enable server-side rendering.
 */

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
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
                <div className="h-4 w-4 bg-red-600/20 rounded animate-pulse" />
                <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
              </div>
              <div className="h-12 w-64 xs:w-80 md:w-96 bg-gray-200 rounded-lg animate-pulse mx-auto md:mx-0" />
              <div className="h-20 w-full max-w-2xl bg-gray-50 rounded-lg animate-pulse mx-auto md:mx-0" />
            </div>
            <div className="h-12 w-48 bg-gray-100 rounded-lg animate-pulse hidden md:block" />
          </div>

          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-12 w-32 bg-gray-100 rounded-lg animate-pulse shrink-0" />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
            <div className="lg:col-span-5 xl:col-span-4">
              <div className="aspect-[4/5] bg-gray-100 rounded-lg animate-pulse" />
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
