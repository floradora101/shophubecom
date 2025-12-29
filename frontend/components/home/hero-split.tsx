"use client";

// Hero slider with smooth sliding animations and synchronized sections

import { useState, useEffect, useRef, useMemo } from "react";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { NavigationButton } from "@/components/ui/navigation-button";
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
      className="relative overflow-hidden min-h-[70svh] py-10 sm:py-14"
      withContainer={false}
    >
      {/* Match HeroSplit wrapper exactly */}
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Solid hero frame (no blur / no glass) */}
          <div className="relative overflow-hidden rounded-2xl bg-white border border-border shadow-2xl ring-1 ring-black/5 w-full">
            <div className="w-full min-h-[70svh] grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 xl:gap-20 px-5 py-6 lg:px-14 lg:py-8">
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
                <div className="relative w-full max-w-[560px] aspect-[16/10] lg:aspect-square">
                  {/* Media frame */}
                  <div className="absolute inset-0 rounded-2xl bg-white border border-border shadow-xl overflow-hidden">
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

  const prefersReducedMotion = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false,
    []
  );

  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

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

  if (!sortedSlides || sortedSlides.length === 0) return null;

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    if (!prefersReducedMotion && isPlaying) {
      setIsPlaying(false);
      setTimeout(() => setIsPlaying(true), 3000);
    }
  };

  const nextSlide = () => goToSlide((currentSlide + 1) % sortedSlides.length);
  const prevSlide = () =>
    goToSlide((currentSlide - 1 + sortedSlides.length) % sortedSlides.length);

  return (
    <Section
      spacing="md"
      className="relative overflow-hidden min-h-[70svh] py-10 sm:py-14 overflow-x-hidden"
      withContainer={false}
    >
      <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
        <div className="relative">
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

          {/* Slides Frame */}
          <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-white/95 via-white/90 to-white/85 backdrop-blur-sm border border-white/30 shadow-2xl shadow-slate-900/5 w-full ring-1 ring-white/20">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {sortedSlides.map((slide, index) => {
                const product = resolveSlideProduct(slide, productsBySlug);
                return (
                  <div key={slide.id} className="shrink-0 w-full min-h-[70svh]">
                    <HeroSlideRenderer
                      slide={slide}
                      product={product}
                      isActive={index === currentSlide}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {sortedSlides.length > 1 && (
            <>
              {/* Arrows */}
              <NavigationButton
                variant="primary"
                direction="left"
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30"
                aria-label="Previous slide"
              />
              <NavigationButton
                variant="primary"
                direction="right"
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30"
                aria-label="Next slide"
              />

              {/* Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30">
                <SlideIndicators
                  count={sortedSlides.length}
                  activeIndex={currentSlide}
                  onSelect={goToSlide}
                />
              </div>

              {/* Play/Pause */}
              {!prefersReducedMotion && (
                <NavigationButton
                  direction={isPlaying ? "pause" : "play"}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute top-2 right-2 sm:top-4 sm:right-4 lg:top-6 lg:right-6 z-30"
                  size="sm"
                  aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                />
              )}
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
