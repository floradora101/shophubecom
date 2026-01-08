"use client";

import { memo } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemedBadge } from "../../shared/themed-badge";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { ThemedSecondaryButton } from "../../shared/themed-secondary-button";
import { ThemedTrustRow } from "../../shared/themed-trust-row";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import { HeroItem } from "../shared/hero-item";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";
import type { LandscapeImageSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

interface LandscapeHeroSlideBodyProps {
  slide: LandscapeImageSlide;
  product?: Product;
  isActive: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const LandscapeHeroSlideBody = memo(function LandscapeHeroSlideBody({
  slide,
  product,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: LandscapeHeroSlideBodyProps) {
  const { run, animationKey } = useHeroRunCounter(isActive);

  // Use structured content if available, otherwise fall back to direct fields
  const content = slide.content || {};
  const badgeText = content.badgeText;
  const headline = content.headline || slide.headline || "Welcome";
  const description = content.description || slide.description;

  return (
    <SlideLayout
      textContent={
        <>
          {badgeText && (
            <HeroItem run={run} animationKey={animationKey}>
              <ThemedBadge>{badgeText}</ThemedBadge>
            </HeroItem>
          )}

          <HeroItem run={run} animationKey={animationKey}>
            <h1 className="hero-item-enter hero-headline text-4xl md:text-6xl font-bold text-white mb-4">
              {headline}
            </h1>
          </HeroItem>

          {description && (
            <HeroItem run={run} animationKey={animationKey}>
              <p className="hero-item-enter hero-description text-lg md:text-xl text-gray-200 mb-6 max-w-lg">
                {description}
              </p>
            </HeroItem>
          )}

          <HeroItem run={run} animationKey={animationKey}>
            <div className="hero-item-enter hero-trust mt-8">
              <ThemedTrustRow
                items={[{ text: "Premium Quality" }, { text: "Fast Delivery" }]}
              />
            </div>
          </HeroItem>
        </>
      }
      mediaContent={
        <HeroMediaFrame slide={slide} product={product} isActive={isActive} />
      }
    />
  );
});
