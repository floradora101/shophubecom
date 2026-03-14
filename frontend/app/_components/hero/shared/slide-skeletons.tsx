import { SkeletonBlock } from "@/components/ui/skeleton";

/**
 * Single generic hero slide skeleton for all hero slide types.
 * Used when a slide body is loading (dynamic import) or as error fallback.
 * One consistent skeleton keeps the hero carousel clean and production-ready.
 */
export function HeroSlideSkeleton() {
  return (
    <div
      className="w-full h-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 xl:gap-20 px-5 py-6 lg:px-14 lg:py-8"
      aria-hidden="true"
    >
      {/* Left: Content */}
      <div className="flex flex-col justify-center space-y-5 min-w-0 text-center lg:text-left">
        <div className="inline-flex w-fit gap-2 px-2.5 py-1 rounded-lg mx-auto lg:mx-0">
          <SkeletonBlock className="w-4 h-4 rounded" />
          <SkeletonBlock className="h-4 w-28 rounded" />
        </div>
        <div className="space-y-3">
          <SkeletonBlock className="h-10 w-[85%] mx-auto lg:mx-0 rounded-lg" />
          <SkeletonBlock className="h-10 w-[70%] mx-auto lg:mx-0 rounded-lg" />
        </div>
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-[90%] mx-auto lg:mx-0 rounded" />
          <SkeletonBlock className="h-4 w-[82%] mx-auto lg:mx-0 rounded" />
          <SkeletonBlock className="h-4 w-[75%] mx-auto lg:mx-0 rounded" />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <SkeletonBlock className="h-12 w-full sm:w-40 rounded-lg" />
          <SkeletonBlock className="h-12 w-full sm:w-40 rounded-lg" />
        </div>
      </div>
      {/* Right: Media */}
      <div className="w-full min-h-[200px] lg:min-h-0 lg:h-full flex items-center justify-center min-w-0">
        <div className="relative w-full aspect-square lg:aspect-auto lg:absolute lg:inset-0 rounded-xl overflow-hidden border border-gray-200/50">
          <SkeletonBlock className="absolute inset-0 rounded-none" />
        </div>
      </div>
    </div>
  );
}

/** @deprecated Use HeroSlideSkeleton. Kept for compatibility. */
export const GenericSlideSkeleton = HeroSlideSkeleton;

/** @deprecated Use HeroSlideSkeleton for all slide loading states. */
export const LandscapeSlideSkeleton = HeroSlideSkeleton;

/** @deprecated Use HeroSlideSkeleton for all slide loading states. */
export const ProductSlideSkeleton = HeroSlideSkeleton;

/** @deprecated Use HeroSlideSkeleton for all slide loading states. */
export const TestimonialSlideSkeleton = HeroSlideSkeleton;

/** @deprecated Use HeroSlideSkeleton for all slide loading states. */
export const ComparisonBattleSlideSkeleton = HeroSlideSkeleton;
