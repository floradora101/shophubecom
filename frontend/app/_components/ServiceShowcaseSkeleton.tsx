/**
 * ServiceShowcase Skeleton Component
 *
 * Server component - pure presentational skeleton UI for ServiceShowcase section.
 * Extracted from ServiceShowcase.tsx to enable server-side rendering.
 */

import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";

/**
 * Skeleton loader for ServiceShowcase component
 * Shows services grid layout with placeholder cards
 */
export function ServiceShowcaseSkeleton() {
  return (
    <Section
      spacing="lg"
      className="relative overflow-hidden bg-gray-900"
      withContainer={false}
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-600/10 blur-[100px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-700/10 blur-[100px] rounded-full" />
      </div>

      <Container className="relative z-10">
        <div className="space-y-12">
          {/* Header Skeleton */}
          <div className="space-y-4 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600/10 mb-2 mx-auto md:mx-0">
              <div className="h-4 w-4 bg-red-600/20 rounded animate-pulse" />
              <SkeletonBlock className="h-6 w-32 rounded-lg" />
            </div>
            <SkeletonBlock className="h-12 w-64 xs:w-80 md:w-96 rounded mx-auto md:mx-0" />
            <SkeletonBlock className="h-6 w-full max-w-2xl rounded mx-auto md:mx-0" />
          </div>

          {/* Services Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="bg-gray-800/40 backdrop-blur-md rounded-lg p-8 border border-white/5 min-h-[400px] flex flex-col relative overflow-hidden"
              >
                {/* Icon placeholder */}
                <div className="mb-6">
                  <SkeletonBlock className="w-16 h-16 rounded-lg" />
                </div>

                {/* Content skeleton */}
                <div className="space-y-4 flex-1">
                  <div className="space-y-3">
                    <SkeletonBlock className="h-6 w-32 rounded" />
                    <SkeletonBlock className="h-4 w-24 rounded-full" />
                  </div>
                  <SkeletonBlock className="h-4 w-full rounded" />
                  <SkeletonBlock className="h-4 w-4/5 rounded" />

                  {/* Features skeleton */}
                  <div className="space-y-2 mt-4">
                    {Array.from({ length: 3 }, (_, k) => (
                      <div key={k} className="flex items-center gap-2">
                        <SkeletonBlock className="w-4 h-4 rounded-full" />
                        <SkeletonBlock className="h-3 w-24 rounded" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom accent skeleton */}
                <div className="flex gap-4 mt-auto pt-4 border-t border-white/5">
                  <SkeletonBlock className="h-3 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Bottom trust row skeleton */}
          <div className="flex justify-center gap-8 pt-8 border-t border-white/5">
            {Array.from({ length: 2 }, (_, i) => (
              <div key={i} className="flex items-center gap-2">
                <SkeletonBlock className="h-8 w-8 rounded-xl" />
                <SkeletonBlock className="h-4 w-24 rounded" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
