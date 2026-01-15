import { SkeletonBlock } from "@/components/ui/skeleton";

/**
 * Skeleton loader for Landscape Hero Slide
 * Matches the full-width landscape layout with content overlay
 */
export function LandscapeSlideSkeleton() {
  return (
    <div
      className="relative w-full h-full overflow-hidden"
      role="img"
      aria-label="Loading landscape hero slide"
      aria-busy="true"
    >
      {/* Background skeleton */}
      <div className="absolute inset-0 z-0 bg-gray-900">
        <SkeletonBlock className="w-full h-full rounded-none" />
      </div>

      {/* Content skeleton */}
      <div className="relative z-20 w-full h-full flex flex-col justify-center px-4 sm:px-12 lg:px-24 xl:px-32">
        <div className="space-y-6">
          {/* Badge */}
          <SkeletonBlock className="h-8 w-32 rounded-lg" />

          {/* Headline & Highlight */}
          <div className="space-y-3">
            <SkeletonBlock className="h-12 w-3/4 rounded-lg" />
            <SkeletonBlock className="h-12 w-2/3 rounded-lg" />
          </div>

          {/* Description */}
          <div className="space-y-2 max-w-2xl">
            <SkeletonBlock className="h-4 w-full rounded" />
            <SkeletonBlock className="h-4 w-5/6 rounded" />
            <SkeletonBlock className="h-4 w-4/6 rounded" />
          </div>

          {/* Action Button */}
          <SkeletonBlock className="h-14 w-48 rounded-lg" />
        </div>
      </div>

      {/* Bottom Glass Glow */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-linear-to-t from-black/20 to-transparent z-15 pointer-events-none" />
    </div>
  );
}

/**
 * Generic skeleton for product spotlight and offer slides
 * Matches the split layout (content + media frame)
 */
export function ProductSlideSkeleton() {
  return (
    <div
      className="w-full h-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 xl:gap-20 px-5 py-6 lg:px-14 lg:py-8"
      role="img"
      aria-label="Loading product showcase slide"
      aria-busy="true"
    >
      {/* Left: Content */}
      <div className="flex flex-col justify-center space-y-5 min-w-0 text-center lg:text-left">
        {/* Badge */}
        <div className="inline-flex w-fit gap-2 px-2.5 py-1 rounded-lg mx-auto lg:mx-0 bg-red-600">
          <SkeletonBlock className="w-4 h-4 rounded" />
          <SkeletonBlock className="h-4 w-28 rounded" />
        </div>

        {/* Title */}
        <div className="space-y-3">
          <SkeletonBlock className="h-12 w-[85%] mx-auto lg:mx-0" />
          <SkeletonBlock className="h-12 w-[70%] mx-auto lg:mx-0" />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <SkeletonBlock className="h-4 w-[90%] mx-auto lg:mx-0" />
          <SkeletonBlock className="h-4 w-[82%] mx-auto lg:mx-0" />
          <SkeletonBlock className="h-4 w-[75%] mx-auto lg:mx-0" />
        </div>

        {/* Pricing Area */}
        <SkeletonBlock className="h-40 w-full max-w-sm mx-auto lg:mx-0 rounded-lg" />

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
          <SkeletonBlock className="h-12 w-full sm:w-40 rounded-lg" />
          <SkeletonBlock className="h-12 w-full sm:w-40 rounded-lg" />
        </div>
      </div>

      {/* Right: Media */}
      <div className="w-full h-full flex items-center justify-center min-w-0">
        <div className="relative w-full h-full">
          {/* Media frame */}
          <div className="absolute inset-0 rounded-xl bg-background border border-border shadow-xl overflow-hidden">
            <SkeletonBlock className="absolute inset-0 rounded-none" />
          </div>

          {/* Floating badge */}
          <div className="absolute top-4 right-4 z-10">
            <SkeletonBlock className="h-9 w-28 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton for testimonial slides
 */
export function TestimonialSlideSkeleton() {
  return (
    <div
      className="w-full h-full flex items-center justify-center px-8 py-12"
      role="img"
      aria-label="Loading customer testimonial slide"
      aria-busy="true"
    >
      <div className="max-w-4xl w-full space-y-6 text-center">
        <SkeletonBlock className="h-6 w-32 mx-auto rounded-lg" />
        <SkeletonBlock className="h-16 w-3/4 mx-auto rounded-lg" />
        <SkeletonBlock className="h-4 w-1/2 mx-auto rounded" />
        <div className="flex items-center justify-center gap-4 mt-8">
          <SkeletonBlock className="h-12 w-12 rounded-full" />
          <div className="space-y-2">
            <SkeletonBlock className="h-4 w-24 rounded" />
            <SkeletonBlock className="h-3 w-16 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Skeleton loader for Comparison Battle Slide
 * Matches the complex arena layout with VS divider and dual product comparison
 */
export function ComparisonBattleSlideSkeleton() {
  return (
    <div
      className="relative w-full h-full flex overflow-hidden group/battle select-none"
      role="img"
      aria-label="Loading product comparison battle slide"
      aria-busy="true"
    >
      {/* 1. High-Tech Fluid Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {/* Dynamic Background Split with VS Divider */}
        <div className="absolute inset-0 flex h-full w-full">
          <div className="flex-1 bg-transparent flex-1 relative">
            {/* Left Decorative Mesh */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fa0603_1px,transparent_1px)] bg-size-[24px_24px]" />
          </div>

          {/* Minimalist Tech Divider */}
          <div className="relative w-px h-full bg-linear-to-b from-transparent via-red-600/20 to-transparent">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40">
              <div className="relative">
                {/* Glass HUD VS */}
                <div className="absolute inset-0 rounded-full bg-red-600/20 blur-2xl scale-[2.5] animate-pulse" />
                <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-white/10 backdrop-blur-3xl border border-red-600/40 flex items-center justify-center shadow-2xl relative z-10 animate-pulse">
                  <div className="flex flex-col items-center">
                    <SkeletonBlock className="w-4 h-4 mb-0.5 rounded" />
                    <span className="text-red-600 font-black text-xs tracking-[0.2em] italic">
                      VS
                    </span>
                  </div>
                  {/* Orbiting Ring */}
                  <div className="absolute inset-[-8px] border-t border-red-600/30 rounded-full animate-[spin_8s_linear_infinite]" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 bg-transparent flex-1 relative">
            {/* Right Decorative Mesh */}
            <div className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#fa0603_1px,transparent_1px)] bg-size-[24px_24px]" />
          </div>
        </div>
      </div>

      {/* 2. Unified Header Overlay */}
      <div className="absolute top-6 lg:top-10 left-0 w-full z-50 pointer-events-none px-6 lg:px-14">
        <div className="hero-item-enter flex flex-col items-center text-center max-w-2xl mx-auto gap-2">
          <SkeletonBlock className="px-2.5 py-0.5 rounded-lg bg-red-600/10 h-6 w-40" />
          <SkeletonBlock className="h-10 lg:h-12 w-3/4 rounded-lg" />
          <SkeletonBlock className="h-4 w-2/3 rounded" />
        </div>
      </div>

      {/* 3. The Arena - Compact & Impactful */}
      <div className="relative z-10 w-full h-full flex flex-col lg:flex-row pt-28 lg:pt-36 pb-6 lg:pb-10">
        {/* LEFT GLADIATOR */}
        <div className="relative flex-1 flex flex-col px-6 lg:px-14">
          {/* Gladiator Identity */}
          <div className="mb-4">
            <SkeletonBlock className="h-2 w-32 mb-2" />
            <SkeletonBlock className="h-8 lg:h-10 w-3/4 mb-3" />
            <SkeletonBlock className="h-6 w-24" />
          </div>

          {/* Scaleable Visuals */}
          <div className="flex-1 relative flex items-center justify-center min-h-0 py-2 pointer-events-none">
            {/* Product Shadow/Podestal */}
            <div className="absolute bottom-4 lg:bottom-8 w-3/4 h-6 bg-red-600/5 blur-3xl rounded-full scale-x-150" />
            <SkeletonBlock className="w-full h-[350px] lg:h-[200px] rounded-lg" />
          </div>

          {/* Matrix Data Layer */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 mt-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-16 rounded-lg" />
            ))}
          </div>

          {/* Professional Hero Action */}
          <div className="mt-6 flex justify-center lg:justify-start">
            <SkeletonBlock className="h-12 lg:h-14 w-full sm:w-40 rounded-xl" />
          </div>
        </div>

        {/* RIGHT GLADIATOR */}
        <div className="relative flex-1 flex flex-col px-6 lg:px-14 lg:text-right">
          {/* Gladiator Identity */}
          <div className="mb-4">
            <SkeletonBlock className="h-2 w-32 mb-2 ml-auto lg:ml-0" />
            <SkeletonBlock className="h-8 lg:h-10 w-3/4 mb-3 ml-auto lg:ml-0" />
            <div className="flex lg:justify-end">
              <SkeletonBlock className="h-6 w-24" />
            </div>
          </div>

          {/* Scaleable Visuals */}
          <div className="flex-1 relative flex items-center justify-center min-h-0 py-2 pointer-events-none">
            {/* Product Shadow/Podestal */}
            <div className="absolute bottom-4 lg:bottom-8 w-3/4 h-6 bg-red-600/5 blur-3xl rounded-full scale-x-150" />
            <SkeletonBlock className="w-full h-[350px] lg:h-[200px] rounded-lg" />
          </div>

          {/* Matrix Data Layer */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-1.5 mt-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonBlock key={i} className="h-16 rounded-lg" />
            ))}
          </div>

          {/* Professional Hero Action */}
          <div className="mt-6 flex justify-center lg:justify-end">
            <SkeletonBlock className="h-12 lg:h-14 w-full sm:w-40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Generic fallback skeleton for any slide type
 */
export function GenericSlideSkeleton() {
  return (
    <div
      className="w-full h-full flex items-center justify-center"
      role="img"
      aria-label="Loading slide content"
      aria-busy="true"
    >
      <SkeletonBlock className="w-full h-full rounded-lg" />
    </div>
  );
}
