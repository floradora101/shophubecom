/**
 * Product Detail Page Skeletons
 *
 * Loading state components that match the ProductDetail layout.
 * These are server components - pure presentational, no interactivity.
 */

import { Container } from "@/components/ui/container";
import { SkeletonBlock } from "@/components/ui/skeleton";

/**
 * Product Gallery Skeleton - matches ProductGallery layout
 */
export function ProductGallerySkeleton() {
  return (
    <div className="w-full">
      {/* Main image area */}
      <div className="relative aspect-[4/5] w-full rounded-lg overflow-hidden bg-surface-muted/30">
        <SkeletonBlock className="absolute inset-0 rounded-none" />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-4 mt-6 overflow-x-auto pb-2">
        {Array.from({ length: 4 }, (_, i) => (
          <div
            key={i}
            className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-surface-muted/30"
          >
            <SkeletonBlock className="w-full h-full rounded-none" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Product Purchase Panel Skeleton - matches ProductPurchasePanel layout
 */
export function ProductPurchasePanelSkeleton() {
  return (
    <div className="space-y-6">
      {/* Price section */}
      <div className="space-y-2">
        <div className="flex items-baseline gap-3">
          <SkeletonBlock className="h-8 w-24" />
          <SkeletonBlock className="h-6 w-16" />
        </div>
        <SkeletonBlock className="h-4 w-32" />
      </div>

      {/* Variant selectors */}
      <div className="space-y-4">
        {Array.from({ length: 2 }, (_, i) => (
          <div key={i} className="space-y-3">
            <SkeletonBlock className="h-4 w-20" />
            <div className="grid grid-cols-3 gap-2">
              {Array.from({ length: 3 }, (_, j) => (
                <SkeletonBlock key={j} className="h-10 rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Quantity and add to cart */}
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <SkeletonBlock className="h-10 w-32" />
          <SkeletonBlock className="h-12 flex-1 rounded-lg" />
        </div>
      </div>

      {/* Stock info */}
      <SkeletonBlock className="h-4 w-40" />
    </div>
  );
}

/**
 * Product Details Accordion Skeleton - matches ProductDetailsAccordion layout
 */
export function ProductDetailsAccordionSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }, (_, i) => (
        <div
          key={i}
          className="border border-border rounded-lg overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 bg-surface-muted">
            <SkeletonBlock className="h-5 w-48" />
            <SkeletonBlock className="w-5 h-5 rounded" />
          </div>
          <div className="p-4 space-y-3">
            <SkeletonBlock className="h-4 w-full" />
            <SkeletonBlock className="h-4 w-5/6" />
            <SkeletonBlock className="h-4 w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * You May Also Like Skeleton - matches YouMayAlsoLike layout
 */
export function YouMayAlsoLikeSkeleton() {
  return (
    <div className="space-y-8 mt-12 sm:mt-16">
      {/* Header */}
      <div className="flex items-center gap-3">
        <SkeletonBlock className="w-6 h-6 rounded" />
        <SkeletonBlock className="h-8 w-64" />
      </div>

      {/* Products grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {Array.from({ length: 4 }, (_, i) => (
          <div key={i} className="w-full">
            <div className="group flex flex-col w-full">
              {/* Image */}
              <SkeletonBlock className="relative aspect-square rounded-lg overflow-hidden border border-warm-gray-200" />

              {/* Info */}
              <div className="mt-3 space-y-1 min-h-16 flex flex-col justify-end">
                <SkeletonBlock className="h-4 md:h-5" />
                <SkeletonBlock className="h-4 md:h-5 w-3/4" />
                <SkeletonBlock className="h-3 w-1/2 mt-1" />
                <div className="flex items-baseline gap-2 flex-wrap mt-2">
                  <SkeletonBlock className="h-4 md:h-5 w-16" />
                  <SkeletonBlock className="h-3 w-12" />
                  <SkeletonBlock className="h-3 w-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Product Detail Page Skeleton - full page loading state
 */
export function ProductDetailSkeleton() {
  return (
    <div className="min-h-screen relative">
      {/* Breadcrumb */}
      <div className="border-b border-border/60">
        <Container className="py-3 sm:py-4">
          <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
            <SkeletonBlock className="h-4 w-12" />
            <div className="w-3.5 h-3.5 rounded" />
            <SkeletonBlock className="h-4 w-20" />
            <div className="w-3.5 h-3.5 rounded" />
            <SkeletonBlock className="h-4 w-16" />
            <div className="w-3.5 h-3.5 rounded" />
            <SkeletonBlock className="h-4 w-32" />
          </nav>
        </Container>
      </div>

      {/* Main Content */}
      <Container className="py-6 sm:py-8 lg:py-12 pb-24 lg:pb-0">
        <div className="grid gap-8 sm:gap-12 lg:grid-cols-[minmax(0,600px)_minmax(0,1fr)] lg:gap-12 xl:gap-16 2xl:gap-20 min-w-0">
          {/* Left Column - Gallery Only */}
          <div className="order-1 lg:order-1 min-w-0 lg:min-h-[calc(100vh-var(--sticky-top)-16px)]">
            <ProductGallerySkeleton />
          </div>

          {/* Right Column - Sticky Sidebar */}
          <div className="order-2 lg:order-2 min-w-0 lg:sticky lg:top-(--sticky-top) self-start">
            <div className="space-y-6 sm:space-y-8 lg:h-[calc(100vh-var(--sticky-top)-16px)] lg:overflow-y-auto scrollbar-hide">
              {/* MegaStore Brand & Title - Inside scrollable container */}
              <div className="w-full mb-6 sm:mb-8 lg:mb-10 text-left">
                <div className="text-xs sm:text-sm text-gray-500 uppercase tracking-wide font-medium mb-2">
                  <SkeletonBlock className="h-4 w-16" />
                </div>
                <SkeletonBlock className="h-10 w-full" />
              </div>

              <div id="purchase-section">
                <ProductPurchasePanelSkeleton />
              </div>
            </div>
          </div>
        </div>

        {/* Full-width sections below the grid */}
        <div className="mt-12 sm:mt-16 lg:mt-20 space-y-12 sm:space-y-16 lg:space-y-20">
          {/* Product Details Accordion */}
          <ProductDetailsAccordionSkeleton />

          {/* You May Also Like Section */}
          <YouMayAlsoLikeSkeleton />
        </div>
      </Container>
    </div>
  );
}
