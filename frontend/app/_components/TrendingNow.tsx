// TrendingNow: Slot-based stage/coverflow carousel
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SlotStageCarousel } from "@/components/ui/slot-stage-carousel";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { ProductCard } from "@/components/shared/ProductCard";
import type { Product, Category } from "@/features/products/types";
import { Sparkles } from "lucide-react";

// Skeleton component extracted to separate server component file
// See: app/_components/TrendingNowSkeleton.tsx

interface TrendingNowProps {
  trendingProducts: Product[];
  categories?: Category[];
}

export function TrendingNow({ trendingProducts }: TrendingNowProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Safety check: ensure trendingProducts is an array
  const safeTrendingProducts = useMemo(
    () => (Array.isArray(trendingProducts) ? trendingProducts : []),
    [trendingProducts]
  );

  // Detect mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Auto-play functionality
  const pauseAutoplayFor = useCallback((ms = 5000) => {
    setIsAutoPlaying(false);
    const timer = setTimeout(() => {
      setIsAutoPlaying(true);
    }, ms);
    return () => clearTimeout(timer);
  }, []);

  // Simplified navigation handlers that work with SlotStageCarousel
  const handleIndexChange = useCallback(
    (index: number) => {
      pauseAutoplayFor(5000);
      setActiveIndex(index);
    },
    [pauseAutoplayFor]
  );

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || safeTrendingProducts.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex(
        (prevIndex) => (prevIndex + 1) % safeTrendingProducts.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, safeTrendingProducts.length]);

  if (!mounted || safeTrendingProducts.length === 0) return null;

  return (
    <Section
      spacing="lg"
      className="relative overflow-hidden bg-transparent"
      withContainer={false}
    >
      <Container className="relative z-10">
        <div className="space-y-8">
          <SectionHeader
            badge={{
              icon: Sparkles,
              text: "Hot Right Now",
            }}
            title={{
              italic: "Trending",
              bold: "Now",
            }}
            description="Discover what everyone's buying right now. These products are flying off the shelves!"
          />

          {/* Slot Stage Carousel with Auto-play */}
          <div
            className="relative"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <SlotStageCarousel
              items={safeTrendingProducts}
              activeIndex={activeIndex}
              onActiveIndexChange={handleIndexChange}
              isMobile={isMobile}
              renderCard={(product, index, isCenter) => (
                <div className="w-[280px]">
                  <ProductCard
                    product={product}
                    layout="vertical"
                    showButtonBelow
                    hideDescription
                    onImageClick={
                      isCenter
                        ? undefined // Center card navigates to product page (default Link behavior)
                        : () => handleIndexChange(index) // Non-center cards get centered
                    }
                  />
                </div>
              )}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
