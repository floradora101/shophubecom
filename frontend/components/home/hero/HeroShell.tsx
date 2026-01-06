"use client";

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useLayoutEffect,
} from "react";
import { NavigationButton } from "@/components/ui/navigation-button";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { SlideIndicators } from "../shared/slide-indicators";
import { SlideBodyRenderer } from "./SlideBodyRenderer";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useSwipe } from "@/lib/hooks/useSwipe";
import { motion } from "@/lib/ui-tokens";
import { validateHeroTheme } from "@/lib/utils/hero-theme-resolver";
import { useHeroSlideProcessor } from "@/lib/utils/hero-slide-hydrator";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

// Predefined floating element positions (avoid Math.random in render)
const floatingPositions = [
  { left: 10, top: 20, delay: 0 },
  { left: 85, top: 15, delay: 0.1 },
  { left: 25, top: 75, delay: 0.2 },
  { left: 90, top: 60, delay: 0.3 },
  { left: 45, top: 35, delay: 0.4 },
  { left: 70, top: 80, delay: 0.5 },
  { left: 15, top: 45, delay: 0.6 },
  { left: 80, top: 25, delay: 0.7 },
  { left: 35, top: 90, delay: 0.8 },
  { left: 65, top: 10, delay: 0.9 },
  { left: 5, top: 65, delay: 1.0 },
  { left: 95, top: 40, delay: 1.1 },
];

export function HeroShellSkeleton() {
  return (
    <div className="relative overflow-hidden h-[var(--hero-h)] py-10 sm:py-14">
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:max-w-none xl:px-0">
        <div className="relative">
          {/* Solid hero frame (no blur / no glass) */}
          <div className="relative overflow-hidden rounded-2xl  border border-border shadow-2xl ring-1 ring-border w-full">
            <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 xl:gap-20 px-5 py-6 lg:px-14 lg:py-8">
              {/* Left: Content */}
              <div className="flex flex-col justify-center space-y-5 min-w-0 text-center lg:text-left">
                {/* Badge */}
                <div className="inline-flex w-fit gap-2 px-4 py-2 rounded-full mx-auto lg:mx-0 bg-gray-100">
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

                {/* Pricing Area (generic card block) */}
                <SkeletonBlock className="h-40 w-full max-w-sm mx-auto lg:mx-0 rounded-xl" />

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                  <SkeletonBlock className="h-12 w-full sm:w-40 rounded-xl" />
                  <SkeletonBlock className="h-12 w-full sm:w-40 rounded-xl" />
                </div>

                {/* Trust pills */}
                <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 justify-center lg:justify-start">
                  <SkeletonBlock className="h-10 w-36 rounded-lg" />
                  <SkeletonBlock className="h-10 w-32 rounded-lg" />
                </div>
              </div>

              {/* Right: Media */}
              <div className="w-full h-full flex items-center justify-center min-w-0">
                <div className="relative w-full h-full">
                  {/* Media frame */}
                  <div className="absolute inset-0 rounded-2xl bg-background border border-border shadow-xl overflow-hidden">
                    <SkeletonBlock className="absolute inset-0 rounded-none" />
                  </div>

                  {/* Floating badge */}
                  <div className="absolute top-4 right-4 z-10">
                    <SkeletonBlock className="h-9 w-28 rounded-xl" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls skeleton */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-2">
              <SkeletonBlock className="w-3 h-3 rounded-full" />
              <SkeletonBlock className="w-3 h-3 rounded-full" />
              <SkeletonBlock className="w-3 h-3 rounded-full" />
            </div>
            <div className="flex gap-4">
              <SkeletonBlock className="w-12 h-12 rounded-full" />
              <SkeletonBlock className="w-12 h-12 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface HeroShellProps {
  slides: HeroSlide[];
  productsBySlug?: Record<string, Product> | Map<string, Product>;
  autoplay?: boolean;
  intervalMs?: number;
  onSlideChange?: (index: number) => void;
}

export function HeroShell({
  slides: rawSlides,
  productsBySlug,
  autoplay = true,
  intervalMs = 5000,
  onSlideChange,
}: HeroShellProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const [isVisible, setIsVisible] = useState(true);
  const [isHovering, setIsHovering] = useState(false);

  // Refs for autoplay management and slide tracking
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideCountRef = useRef<number>(0);
  const currentSlideIdRef = useRef<string | null>(null);
  const slideTrackRef = useRef<HTMLDivElement>(null);

  // Process slides using the centralized processor
  const { slides: processedSlides, getResolvedData } = useHeroSlideProcessor({
    slides: rawSlides,
    productsBySlug,
  });

  // Explicit transition classes for production-grade hero carousel animations
  const transitionClasses =
    "transform-gpu transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform";

  const prefersReducedMotion = usePrefersReducedMotion();

  // Page visibility handling
  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // Production-grade autoplay effect - React 18 Strict Mode compliant
  useEffect(() => {
    // Update slide count ref to avoid stale closures in interval callback
    slideCountRef.current = processedSlides.length;

    // Compute autoplay conditions - centralized logic prevents race conditions
    const shouldPlay =
      isPlaying &&
      processedSlides.length > 1 &&
      !prefersReducedMotion &&
      isVisible &&
      !isHovering;

    // Always clear existing interval first (defensive programming)
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Only set up interval if conditions are met
    if (shouldPlay) {
      intervalRef.current = setInterval(() => {
        // Read from ref to avoid stale closure - critical for React 18 Strict Mode
        const currentCount = slideCountRef.current;

        // Safety check: don't advance if slides changed to 0 or 1
        if (currentCount <= 1) return;

        setCurrentSlide((prev) => (prev + 1) % currentCount);
      }, intervalMs);
    }

    // Cleanup function - always runs on effect re-run or unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    isPlaying,
    processedSlides.length,
    prefersReducedMotion,
    isVisible,
    isHovering,
    intervalMs,
  ]);

  // Handle slides changes - make currentSlide resilient and clamp to valid range
  useEffect(() => {
    if (processedSlides.length === 0) return;

    setCurrentSlide((currentSlide) => {
      let newIndex = currentSlide;

      // If we have a tracked slide ID, try to find it in the new slides
      if (currentSlideIdRef.current) {
        const trackedIndex = processedSlides.findIndex(
          (slide) => slide.id === currentSlideIdRef.current
        );
        if (trackedIndex !== -1) {
          newIndex = trackedIndex;
        } else {
          // Slide no longer exists, fallback to 0
          newIndex = 0;
          currentSlideIdRef.current = null;
        }
      }

      // Clamp index to valid range
      newIndex = Math.max(0, Math.min(newIndex, processedSlides.length - 1));

      // Update tracked slide ID
      if (processedSlides[newIndex]) {
        currentSlideIdRef.current = processedSlides[newIndex].id;
      }

      return newIndex;
    });
  }, [processedSlides]);

  // Notify parent of slide changes
  useEffect(() => {
    onSlideChange?.(currentSlide);
  }, [currentSlide, onSlideChange]);

  // Calculate transform using pixels for more reliable animation
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    if (slideTrackRef.current) {
      const rect = slideTrackRef.current.getBoundingClientRect();
      setContainerWidth(rect.width);
    }
  }, []);

  const transformValue = `translate3d(-${
    currentSlide * containerWidth
  }px, 0, 0)`;

  // Screen reader announcement for slide changes
  const currentSlideTitle = processedSlides[currentSlide]?.headline || "";
  const liveRegionText = `Slide ${currentSlide + 1} of ${
    processedSlides.length
  }: ${currentSlideTitle}`;

  const goToSlide = useCallback(
    (index: number) => {
      if (processedSlides.length === 0) return;

      // Clamp index to valid range
      const clampedIndex = Math.max(
        0,
        Math.min(index, processedSlides.length - 1)
      );

      setCurrentSlide(clampedIndex);
      // Update tracked slide ID
      if (processedSlides[clampedIndex]) {
        currentSlideIdRef.current = processedSlides[clampedIndex].id;
      }
    },
    [processedSlides]
  );

  const nextSlide = useCallback(
    () =>
      processedSlides.length > 0 &&
      goToSlide((currentSlide + 1) % processedSlides.length),
    [goToSlide, currentSlide, processedSlides.length]
  );
  const prevSlide = useCallback(
    () =>
      processedSlides.length > 0 &&
      goToSlide(
        (currentSlide - 1 + processedSlides.length) % processedSlides.length
      ),
    [goToSlide, currentSlide, processedSlides.length]
  );

  // Touch swipe functionality
  const { setElementRef } = useSwipe({
    threshold: 40,
    velocityThreshold: 0.3,
    maxVerticalMovement: 50,
    onSwipeLeft: nextSlide,
    onSwipeRight: prevSlide,
  });

  // Render all slides to enable animations when slides become active
  // Note: Hero slides are typically lightweight (images + text) so rendering all is acceptable
  const slidesToRender = processedSlides.map((_, i) => i);

  // Hover handlers for autoplay pause
  const handleMouseEnter = useCallback(() => setIsHovering(true), []);
  const handleMouseLeave = useCallback(() => setIsHovering(false), []);

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      switch (event.key) {
        case "ArrowLeft":
          event.preventDefault();
          prevSlide();
          break;
        case "ArrowRight":
          event.preventDefault();
          nextSlide();
          break;
        case " ":
          // Space key for play/pause (only when not preferring reduced motion)
          if (!prefersReducedMotion) {
            event.preventDefault();
            setIsPlaying(!isPlaying);
          }
          break;
      }
    },
    [prevSlide, nextSlide, isPlaying, prefersReducedMotion]
  );

  // Early return for empty slides - must be after all hooks
  if (!rawSlides || rawSlides.length === 0) return null;

  // Define currentSlideData early for use in effects
  const currentSlideData =
    processedSlides.length > 0 ? processedSlides[currentSlide] : null;

  return (
    <div className="relative overflow-hidden overflow-x-hidden ">
      {/* Transparent container - blends with global background */}
      <div className="w-full h-[var(--hero-h)] relative">
        {/* Subtle noise overlay */}
        <div className="absolute inset-0 opacity-[0.02] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOSIgbnVtT2N0YXZlcz0iNCIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiLz48L2RlZnM+PC9zdmc+')] mix-blend-mode-multiply" />

        {/* Hero container with fixed dimensions */}
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 xl:max-w-none xl:px-0 h-full relative">
          <div
            className="relative h-full"
            role="region"
            aria-roledescription="carousel"
            aria-label={`Hero slideshow with ${processedSlides.length} slides`}
            tabIndex={0}
            onKeyDown={handleKeyDown}
          >
            {/* Floating Background */}
            <div className="absolute inset-0 -z-10">
              {floatingPositions.map((pos, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 rounded-full bg-primary-500/20 animate-pulse"
                  style={{
                    left: `${pos.left}%`,
                    top: `${pos.top}%`,
                    animationDelay: `${pos.delay}s`,
                  }}
                />
              ))}
            </div>

            {/* Slides Frame - Transparent, blends with global background */}
            <div
              ref={setElementRef}
              className="relative overflow-hidden rounded-2xl w-full h-full"
              data-theme={
                currentSlideData && currentSlideData.type !== "LANDSCAPE_IMAGE"
                  ? validateHeroTheme(
                      currentSlideData.theme?.accentToken,
                      currentSlideData.id
                    )
                  : undefined
              }
            >
              <div
                ref={slideTrackRef}
                className={`flex ${transitionClasses}`}
                style={{
                  transform: transformValue,
                  transition: prefersReducedMotion
                    ? "none"
                    : "transform 700ms cubic-bezier(0.22, 1, 0.36, 1)",
                  willChange: "transform",
                }}
              >
                {processedSlides.map((slide, index) => {
                  const isRendered = slidesToRender.includes(index);
                  const isCurrentSlide = index === currentSlide;

                  return (
                    <div key={slide.id} className="shrink-0 w-full h-full">
                      {isRendered ? (
                        <div className="w-full h-full min-h-0">
                          <SlideBodyRenderer
                            slide={slide}
                            {...getResolvedData(slide)}
                            isActive={isCurrentSlide}
                            index={index}
                            onMouseEnter={handleMouseEnter}
                            onMouseLeave={handleMouseLeave}
                          />
                        </div>
                      ) : (
                        // Lazy placeholder - preserves layout without rendering content
                        <div className="w-full h-full" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Screen reader live region for slide announcements */}
            <div aria-live="polite" aria-atomic="true" className="sr-only">
              {liveRegionText}
            </div>

            {processedSlides.length > 1 && (
              <>
                {/* Arrows */}
                <NavigationButton
                  variant="primary"
                  direction="left"
                  onClick={prevSlide}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-30"
                  aria-label="Previous slide"
                />
                <NavigationButton
                  variant="primary"
                  direction="right"
                  onClick={nextSlide}
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-30"
                  aria-label="Next slide"
                />

                {/* Indicators */}
                <div
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30"
                  onMouseEnter={handleMouseEnter}
                  onMouseLeave={handleMouseLeave}
                >
                  <SlideIndicators
                    count={processedSlides.length}
                    activeIndex={currentSlide}
                    onSelect={goToSlide}
                  />
                </div>

                {/* Play/Pause */}
                {!prefersReducedMotion && (
                  <NavigationButton
                    direction={isPlaying ? "pause" : "play"}
                    onClick={() => setIsPlaying(!isPlaying)}
                    onMouseEnter={handleMouseEnter}
                    onMouseLeave={handleMouseLeave}
                    className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-6 lg:right-6 z-30"
                    size="sm"
                    aria-label={
                      isPlaying ? "Pause slideshow" : "Play slideshow"
                    }
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
