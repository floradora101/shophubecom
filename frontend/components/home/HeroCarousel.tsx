// Hero carousel for featured banners.
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/types/product.types";
import { getHeroCarouselBackground } from "@/lib/config/site.config";

interface HeroCarouselProps {
  products: Product[];
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='600'%3E%3Crect fill='%23f3f4f6' width='800' height='600'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='24' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

export function HeroCarousel({
  products,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
}: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Navigation functions
  const goToSlide = useCallback(
    (index: number) => {
      if (isTransitioning || index === currentIndex) return;
      setIsTransitioning(true);
      setCurrentIndex(index);
      setTimeout(() => setIsTransitioning(false), 600);
    },
    [currentIndex, isTransitioning]
  );

  const goToPrevious = useCallback(() => {
    if (isTransitioning) return;
    const newIndex =
      currentIndex === 0 ? products.length - 1 : currentIndex - 1;
    goToSlide(newIndex);
  }, [currentIndex, products.length, isTransitioning, goToSlide]);

  const goToNext = useCallback(() => {
    if (isTransitioning) return;
    const newIndex = (currentIndex + 1) % products.length;
    goToSlide(newIndex);
  }, [currentIndex, products.length, isTransitioning, goToSlide]);

  // Auto-play logic
  useEffect(() => {
    if (products.length <= 1 || isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      goToNext();
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [products.length, isPaused, autoPlayInterval, goToNext]);

  // Touch handlers for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;

    const diff = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50;

    if (Math.abs(diff) > minSwipeDistance) {
      if (diff > 0) {
        goToNext();
      } else {
        goToPrevious();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  if (products.length === 0) return null;

  const currentProduct = products[currentIndex];
  // Get image from variants
  const imageUrl =
    currentProduct.variants?.[0]?.image ??
    currentProduct.variants?.[0]?.images?.[0] ??
    null;
  const displayImage =
    imageErrors[currentIndex] || !imageUrl ? PLACEHOLDER_IMAGE : imageUrl;

  // Get dynamic background color from config
  const backgroundColor = getHeroCarouselBackground();

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative grid grid-cols-1 md:grid-cols-2 h-[500px] md:h-[600px]">
        {/* Left Content Panel */}
        <div
          className="relative flex items-center overflow-hidden transition-colors duration-300"
          style={{ backgroundColor }}
        >
          <div
            key={`content-${currentIndex}`}
            className="w-full px-8 py-12 md:px-12 md:py-16 lg:px-16 lg:py-20 animate-fade-in-up"
          >
            {/* Badge */}
            <div
              className="mb-4 animate-fade-in-up"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="inline-block rounded-full bg-primary-500 px-5 py-2 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                Catch the Offer
              </span>
            </div>

            {/* Title */}
            <h2
              className="mb-4 text-3xl font-bold leading-tight text-gray-900 md:text-4xl lg:text-5xl animate-fade-in-up"
              style={{ animationDelay: "0.2s" }}
            >
              {currentProduct.name}
            </h2>

            {/* Description */}
            {currentProduct.description && (
              <p
                className="mb-8 line-clamp-3 text-base leading-relaxed text-gray-600 md:text-lg animate-fade-in-up"
                style={{ animationDelay: "0.3s" }}
              >
                {currentProduct.description}
              </p>
            )}

            {/* Price & Stock */}
            <div
              className="mb-8 animate-fade-in-up"
              style={{ animationDelay: "0.4s" }}
            >
              <div className="flex flex-col gap-3">
                <span className="text-4xl font-bold text-primary-600 md:text-5xl lg:text-6xl">
                  ${currentProduct.price.toFixed(2)}
                </span>
                {currentProduct.stock > 0 && (
                  <span className="inline-block w-fit rounded-full bg-green-100 px-4 py-1.5 text-sm font-semibold text-green-700">
                    ✓ {currentProduct.stock} in stock
                  </span>
                )}
              </div>
            </div>

            {/* CTA Button */}
            <div
              className="flex gap-4 animate-fade-in-up"
              style={{ animationDelay: "0.5s" }}
            >
              <Link
                href={`/products/${currentProduct.slug}`}
                className="flex-1"
              >
                <Button
                  size="lg"
                  className="w-full text-base shadow-lg group transition-all hover:scale-105"
                >
                  <ShoppingCart className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                  Shop Now
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Right Image Panel */}
        <div
          className="relative flex items-center justify-center overflow-hidden transition-colors duration-300"
          style={{ backgroundColor }}
        >
          <div
            key={`image-${currentIndex}`}
            className="relative w-full h-full animate-fade-in"
          >
            <Image
              src={displayImage}
              alt={currentProduct.name}
              fill
              className="object-contain p-8 md:p-12 lg:p-16 transition-opacity duration-500"
              priority={currentIndex === 0}
              onError={() =>
                setImageErrors((prev) => ({ ...prev, [currentIndex]: true }))
              }
              unoptimized={displayImage.startsWith("data:")}
            />
          </div>
        </div>

        {/* Navigation Arrows */}
        {products.length > 1 && showArrows && (
          <>
            <button
              onClick={goToPrevious}
              disabled={isTransitioning}
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm p-3 shadow-xl transition-all hover:bg-white hover:scale-110 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              aria-label="Previous slide"
            >
              <ChevronLeft className="h-6 w-6 text-gray-900" />
            </button>
            <button
              onClick={goToNext}
              disabled={isTransitioning}
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/90 backdrop-blur-sm p-3 shadow-xl transition-all hover:bg-white hover:scale-110 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              aria-label="Next slide"
            >
              <ChevronRight className="h-6 w-6 text-gray-900" />
            </button>
          </>
        )}
      </div>

      {/* Navigation Dots */}
      {products.length > 1 && showDots && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex gap-2">
          {products.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              disabled={isTransitioning}
              className={`h-3 rounded-full transition-all duration-300 disabled:cursor-not-allowed ${
                index === currentIndex
                  ? "w-10 bg-primary-500 shadow-md"
                  : "w-3 bg-white/70 hover:bg-white hover:scale-110"
              }`}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === currentIndex ? "true" : "false"}
            />
          ))}
        </div>
      )}
    </section>
  );
}
