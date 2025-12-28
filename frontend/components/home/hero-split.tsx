// Hero slider with smooth sliding animations and synchronized sections
"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SlideIndicators } from "./shared/slide-indicators";
import { HeroSlideRenderer } from "./heroSlideRenderer";
import {
  assertUniqueSlideContent,
  filterActiveSlides,
  sortSlides,
  resolveSlideProduct,
} from "@/lib/utils/heroSlides.utils";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

/**
 * Skeleton loader for HeroSplit component
 * Shows carousel layout with image and content placeholders
 */
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

export function HeroSplitSkeleton() {
  return (
    <Section
      spacing="md"
      className="relative overflow-hidden min-h-[85vh] flex items-center"
      withContainer={false}
    >
      {/* Floating background elements skeleton */}
      <div className="absolute inset-0 -z-10">
        {floatingPositions.map((pos, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 rounded-full animate-shimmer bg-current"
            style={{
              left: `${pos.left}%`,
              top: `${pos.top}%`,
              animationDelay: `${pos.delay}s`,
            }}
          />
        ))}
      </div>

      <Container size="xl" className="relative z-10">
        <div className="relative">
          {/* Main carousel container skeleton */}
          <div className="relative overflow-hidden rounded-lg bg-white/30 backdrop-blur-sm border border-white/30 shadow-lg w-full min-h-[60vh] lg:min-h-[70vh]">
            <div className="grid lg:grid-cols-2 h-full">
              {/* Left side - Image area */}
              <div className="relative">
                <div className="aspect-square md:aspect-auto md:h-full animate-shimmer rounded-l-lg bg-current" />
                {/* Overlay content */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                  <div className="animate-shimmer h-6 w-32 rounded bg-white/20 mb-2" />
                  <div className="animate-shimmer h-4 w-24 rounded bg-white/20" />
                </div>
              </div>

              {/* Right side - Content area */}
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="space-y-6">
                  {/* Badge */}
                  <div className="animate-shimmer h-6 w-20 rounded-full bg-current" />

                  {/* Title */}
                  <div className="space-y-3">
                    <div className="animate-shimmer h-10 w-full rounded bg-current" />
                    <div className="animate-shimmer h-10 w-3/4 rounded bg-current" />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <div className="animate-shimmer h-4 w-full rounded bg-current" />
                    <div className="animate-shimmer h-4 w-5/6 rounded bg-current" />
                    <div className="animate-shimmer h-4 w-4/5 rounded bg-current" />
                  </div>

                  {/* Price */}
                  <div className="animate-shimmer h-8 w-24 rounded bg-current" />

                  {/* Buttons */}
                  <div className="flex gap-4 pt-4">
                    <div className="animate-shimmer h-12 w-32 rounded-lg bg-current" />
                    <div className="animate-shimmer h-12 w-24 rounded-lg bg-current" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Controls skeleton */}
          <div className="flex justify-between items-center mt-6">
            <div className="flex gap-2">
              {Array.from({ length: 3 }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full animate-shimmer bg-current`}
                  style={{ animationDelay: `${i * 0.1}s` }}
                />
              ))}
            </div>
            <div className="flex gap-4">
              <div className="animate-shimmer w-12 h-12 rounded-full bg-current" />
              <div className="animate-shimmer w-12 h-12 rounded-full bg-current" />
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

interface HeroSplitProps {
  slides: HeroSlide[];
  productsBySlug?: Record<string, Product> | Map<string, Product>;
  autoplay?: boolean;
  intervalMs?: number;
}

export function HeroSplit({
  slides,
  productsBySlug,
  autoplay = true,
  intervalMs = 5000,
}: HeroSplitProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoplay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Process slides: filter active, sort by priority, assert uniqueness
  const sortedSlides = useMemo(() => {
    const activeSlides = filterActiveSlides(slides);
    const sorted = sortSlides(activeSlides);

    if (process.env.NODE_ENV === "development") {
      try {
        assertUniqueSlideContent(sorted);
      } catch (e) {
        console.warn("unique slide check failed", e);
      }

      // Dev-only console.table for debugging
      console.table(
        sorted.map((slide) => ({
          id: slide.id,
          type: slide.type,
          isActive: slide.isActive,
          startsAt: slide.startsAt || "No start date",
          endsAt: slide.endsAt || "No expiry",
          priority: slide.priority,
        })),
        ["id", "type", "isActive", "startsAt", "endsAt", "priority"]
      );
    }

    return sorted;
  }, [slides]);

  // Check for prefers-reduced-motion (memoized since it won't change during component lifecycle)
  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    []
  );

  // Auto-play functionality with motion preference support
  useEffect(() => {
    // Clear existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // Set up new interval only if autoplay is enabled and we have multiple slides
    if (isPlaying && sortedSlides.length > 1 && !prefersReducedMotion) {
      intervalRef.current = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sortedSlides.length);
      }, intervalMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying, sortedSlides.length, prefersReducedMotion, intervalMs]);

  // Early return if no slides (after hooks)
  if (!sortedSlides || sortedSlides.length === 0) {
    return null;
  }

  // No more hardcoded slide content - slides come from props or backend

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (!prefersReducedMotion && isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 3000);
    }
  };

  const nextSlide = () => {
    goToSlide((currentSlide + 1) % sortedSlides.length);
  };

  const prevSlide = () => {
    goToSlide((currentSlide - 1 + sortedSlides.length) % sortedSlides.length);
  };

  return (
    <Section
      spacing="md"
      className="relative overflow-hidden min-h-[70vh] sm:min-h-[80vh] lg:min-h-[90vh] py-10 sm:py-14 overflow-x-hidden"
      withContainer={false}
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Unified Background with Floating Elements */}
          <div className="absolute inset-0 -z-10">
            {/* Integrated floating background elements */}
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

          {/* Slide Container - Unified Background */}
          <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-sm border border-white/30 shadow-2xl shadow-slate-900/5 w-full ring-1 ring-white/20">
            {/* Active Slide */}
            {(() => {
              const activeSlide = sortedSlides[currentSlide];
              const product = resolveSlideProduct(activeSlide, productsBySlug);
              return (
                <div
                  key={activeSlide.id}
                  className="transition-opacity duration-500 ease-in-out"
                >
                  <HeroSlideRenderer
                    slide={activeSlide}
                    product={product}
                    isActive={true}
                  />
                </div>
              );
            })()}
          </div>

          {/* Navigation Controls */}
          {sortedSlides.length > 1 && (
            <>
              {/* Arrow Navigation */}
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-30 p-2 sm:p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                aria-label="Next slide"
              >
                <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary-600" />
              </button>

              {/* Simple Minimalist Slide Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
                <SlideIndicators
                  count={sortedSlides.length}
                  activeIndex={currentSlide}
                  onSelect={goToSlide}
                />
              </div>

              {/* Play/Pause Button - Only show if motion is not reduced */}
              {!prefersReducedMotion && (
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-6 lg:right-6 z-30 p-2 sm:p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                  aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                >
                  {isPlaying ? (
                    <Pause className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary-600" />
                  ) : (
                    <Play className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-primary-600" />
                  )}
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
