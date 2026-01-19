/**
 * DepartmentTabs Skeleton Component
 *
 * Server component - pure presentational skeleton UI for DepartmentTabs section.
 * Extracted from DepartmentTabs.tsx to enable server-side rendering.
 */

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";

/**
 * Skeleton loader for DepartmentTabs component
 * Shows tab navigation skeleton and product grid skeleton
 */
export function DepartmentTabsSkeleton() {
  return (
    <Section spacing="md" className="relative overflow-hidden bg-transparent">
      <Container className="relative z-10">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-center md:text-left space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 mb-2">
                <SkeletonBlock className="h-4 w-4 rounded" />
                <SkeletonBlock className="h-4 w-32 rounded" />
              </div>
              <SkeletonBlock className="h-10 w-80 rounded" />
              <SkeletonBlock className="h-5 w-96 rounded" />
            </div>
          </div>

          {/* Enhanced Tabs with Icons */}
          <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-2.5 pb-4 overflow-x-auto sm:overflow-x-visible scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className="shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-gray-200"
              >
                <SkeletonBlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded" />
                <SkeletonBlock className="h-3.5 sm:h-4 w-16 sm:w-20 rounded" />
              </div>
            ))}
          </div>

          {/* Department Info Banner Skeleton */}
          <div className="relative overflow-hidden rounded-lg p-5 sm:p-6 bg-linear-to-r from-gray-50 to-gray-100 border border-white/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <SkeletonBlock className="p-2.5 rounded-lg w-10 h-10 shrink-0" />
                <div className="flex-1">
                  <SkeletonBlock className="h-5 w-32 mb-1" />
                  <SkeletonBlock className="h-4 w-full sm:w-48" />
                </div>
              </div>
              <SkeletonBlock className="w-full sm:w-20 h-10 sm:h-8 rounded-lg mt-2 sm:mt-0" />
            </div>
            {/* Subtle decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Content - Grid layout only, consistent across all tabs */}
          <div className="min-h-[350px] transition-all duration-300 ease-in-out">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
              {Array.from({ length: 8 }, (_, index) => (
                <ProductCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
