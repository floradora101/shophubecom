// TrendingNow carousel component - Sorbé-style behavior with CSS scroll-snap
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Product } from "../types";
import type { MockProduct } from "@/lib/mock-data/mock-data";
import { getProductImage } from "@/features/products";
import { formatPrice } from "@/lib/utils";

interface TrendingNowProps {
  products: MockProduct[];
  title?: string;
  subtitle?: string;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='280' height='280'%3E%3Crect fill='%23f3f4f6' width='280' height='280'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

interface TrendingProductCardProps {
  product: MockProduct;
  isActive: boolean;
  prefersReducedMotion: boolean;
}

function TrendingProductCard({
  product,
  isActive,
  prefersReducedMotion,
}: TrendingProductCardProps) {
  const displayImage = !product.image ? PLACEHOLDER_IMAGE : product.image;

  // Calculate discount info for MockProduct
  const originalPrice = product.originalPrice;
  const discountPercent =
    originalPrice && originalPrice > product.price
      ? Math.round(((originalPrice - product.price) / originalPrice) * 100)
      : 0;
  const hasDiscount = !!originalPrice && originalPrice > product.price;

  return (
    <div
      className={`flex-shrink-0 w-[280px] transition-all duration-250 ease-out ${
        isActive ? "scale-[1.03] opacity-100 z-10" : "scale-[0.94] opacity-75"
      } ${
        prefersReducedMotion ? "!transition-none !scale-100 !opacity-100" : ""
      }`}
      style={{
        transform: prefersReducedMotion ? "scale(1)" : undefined,
        opacity: prefersReducedMotion ? 1 : undefined,
      }}
    >
      <div className="group relative flex flex-col bg-white rounded-xl overflow-hidden border border-gray-100 hover:shadow-lg">
        {/* Discount Badge */}
        {hasDiscount && discountPercent > 0 && (
          <div className="absolute top-3 left-3 z-10 bg-linear-to-br from-red-500 to-red-600 text-white px-2.5 py-1 rounded-md text-xs font-bold shadow-lg">
            -{discountPercent}%
          </div>
        )}

        {/* Image Container - Fixed aspect ratio for no layout shift */}
        <div className="relative aspect-square overflow-hidden bg-white">
          <img
            src={displayImage}
            alt={product.name}
            className="w-full h-full object-contain p-4"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER_IMAGE;
            }}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-4 text-center">
          {/* Category */}
          {product.category && (
            <div className="text-[11px] font-medium text-gray-400 uppercase tracking-wide mb-1">
              {product.category}
            </div>
          )}

          {/* Title */}
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug mb-2">
            {product.name}
          </h3>

          {/* Price */}
          <div className="flex items-baseline justify-center gap-2 flex-wrap">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && originalPrice && (
              <span className="text-sm text-gray-400 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function TrendingNow({
  products,
  title = "Trending Now",
  subtitle = "Discover what's hot this season",
}: TrendingNowProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);

  // Check for prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Calculate active index based on scroll position
  const updateActiveIndex = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const containerRect = container.getBoundingClientRect();
    const containerCenter = containerRect.left + containerRect.width / 2;

    let closestIndex = 0;
    let minDistance = Infinity;

    // Find card closest to container center
    const cards = container.querySelectorAll("[data-card-index]");
    cards.forEach((card, index) => {
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(cardCenter - containerCenter);

      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    setActiveIndex(closestIndex);
  }, []);

  // Throttled scroll handler using rAF
  const handleScroll = useCallback(() => {
    if (rafIdRef.current) return;

    rafIdRef.current = requestAnimationFrame(() => {
      updateActiveIndex();
      rafIdRef.current = null;
    });
  }, [updateActiveIndex]);

  // Wheel event handler for horizontal scrolling
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      if (!scrollContainerRef.current) return;

      // Only handle vertical wheel events over the carousel
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();

        const container = scrollContainerRef.current;
        const scrollAmount = e.deltaY * 0.8; // Convert vertical to horizontal scroll

        container.scrollBy({
          left: scrollAmount,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    },
    [prefersReducedMotion]
  );

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener("scroll", handleScroll, { passive: true });
    container.addEventListener("wheel", handleWheel, { passive: false });

    // Initial active index calculation
    updateActiveIndex();

    return () => {
      container.removeEventListener("scroll", handleScroll);
      container.removeEventListener("wheel", handleWheel);
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
    };
  }, [handleScroll, handleWheel, updateActiveIndex]);

  // Navigation functions
  const scrollToCard = useCallback(
    (index: number) => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const cards = container.querySelectorAll("[data-card-index]");
      const targetCard = cards[index] as HTMLElement;

      if (targetCard) {
        const cardRect = targetCard.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const targetScrollLeft =
          container.scrollLeft +
          cardRect.left -
          containerRect.left -
          containerRect.width / 2 +
          cardRect.width / 2;

        container.scrollTo({
          left: targetScrollLeft,
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    },
    [prefersReducedMotion]
  );

  const goToPrevious = useCallback(() => {
    const newIndex = Math.max(0, activeIndex - 1);
    scrollToCard(newIndex);
  }, [activeIndex, scrollToCard]);

  const goToNext = useCallback(() => {
    const newIndex = Math.min(products.length - 1, activeIndex + 1);
    scrollToCard(newIndex);
  }, [activeIndex, products.length, scrollToCard]);

  if (products.length === 0) return null;

  return (
    <section className="py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="space-y-12">
          {/* Section header */}
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-6 h-6 text-primary-500" />
              <Badge variant="secondary" className="px-3 py-1">
                <TrendingUp className="w-4 h-4 mr-1" />
                Hot Picks
              </Badge>
            </div>
            <h2 className="text-section-title text-neutral-900">{title}</h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              {subtitle}
            </p>
          </div>

          {/* Carousel */}
          <div className="relative">
            {/* Navigation buttons */}
            {products.length > 1 && (
              <>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
                  onClick={goToPrevious}
                  disabled={activeIndex === 0}
                  aria-label="Previous product"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 backdrop-blur-sm shadow-lg hover:bg-white"
                  onClick={goToNext}
                  disabled={activeIndex === products.length - 1}
                  aria-label="Next product"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* Scroll container */}
            <div
              ref={scrollContainerRef}
              className="overflow-x-auto flex gap-4 snap-x snap-mandatory pb-4"
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              {products.map((product, index) => (
                <div
                  key={product.id}
                  data-card-index={index}
                  className="snap-center flex-shrink-0"
                >
                  <TrendingProductCard
                    product={product}
                    isActive={index === activeIndex}
                    prefersReducedMotion={prefersReducedMotion}
                  />
                </div>
              ))}
            </div>

            {/* Pagination dots */}
            {products.length > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                {products.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollToCard(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeIndex
                        ? "w-8 bg-primary-500"
                        : "w-2 bg-gray-300 hover:bg-gray-400"
                    }`}
                    aria-label={`Go to product ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
