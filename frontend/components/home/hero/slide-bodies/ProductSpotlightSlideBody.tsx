"use client";

import { memo } from "react";
import { Sparkles, Zap, Shield, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { HeroPriceBlock } from "../../shared/hero-price-block";
import { ThemedBadge } from "../../shared/themed-badge";
import { ThemedSecondaryButton } from "../../shared/themed-secondary-button";
import { ThemedTrustRow } from "../../shared/themed-trust-row";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import { HeroItem } from "../shared/hero-item";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

interface ProductSpotlightSlideBodyProps {
  slide: HeroSlide & { type: "PRODUCT_SPOTLIGHT" };
  product?: Product;
  isActive: boolean;
  index: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const ProductSpotlightSlideBody = memo(
  function ProductSpotlightSlideBody({
    slide,
    product,
    isActive,
    onMouseEnter,
    onMouseLeave,
  }: ProductSpotlightSlideBodyProps) {
    // Animation run counter - increments when slide becomes active
    const { run, animationKey } = useHeroRunCounter(isActive);

    return (
      <SlideLayout
        textContent={
          <>
            {/* Row 1: Themed Badge */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-badge">
                <ThemedBadge icon={Sparkles}>
                  {slide.badgeText || "Premium Product"}
                </ThemedBadge>
              </div>
            </HeroItem>

            {/* Row 2: Headline */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className={`space-y-3 hero-item-enter hero-headline`}>
                <h1
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold italic leading-tight underline decoration-2 underline-offset-4`}
                  style={{ color: "var(--hero-text)" }}
                >
                  {slide.headline}
                </h1>
                {slide.highlight && (
                  <h2
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-sans font-bold overline decoration-1"
                    style={{ color: "var(--hero-accent)" }}
                  >
                    {slide.highlight}
                  </h2>
                )}
              </div>
            </HeroItem>

            {/* Row 3: Description */}
            <HeroItem run={run} animationKey={animationKey}>
              <p
                className={`text-xs sm:text-sm md:text-base lg:text-lg leading-relaxed hero-item-enter hero-description ${contentClamp.description}`}
                style={{ color: "var(--hero-muted)" }}
              >
                {slide.description}
              </p>
            </HeroItem>

            {/* Row 4: Flexible middle space (Product Name, Price, Specs) */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="space-y-8 hero-item-enter hero-description">
                {product && (
                  <h3
                    className="text-lg sm:text-xl md:text-2xl font-bold"
                    style={{ color: "var(--hero-text)" }}
                  >
                    {product.name}
                  </h3>
                )}
                {product && <HeroPriceBlock product={product} />}
                <div className="flex gap-3">
                  <div className="hero-pill flex items-center gap-2 text-sm font-medium">
                    <Zap className="w-4 h-4" />
                    <span>30hr Battery</span>
                  </div>
                  <div className="hero-pill flex items-center gap-2 text-sm font-medium">
                    <Shield className="w-4 h-4" />
                    <span>5 Colors</span>
                  </div>
                </div>
              </div>
            </HeroItem>

            {/* Row 5: CTAs */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="flex flex-row gap-2 sm:gap-3 md:gap-4 justify-center lg:justify-start hero-item-enter hero-buttons">
                <Link
                  href={slide.ctaPrimary.href}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                >
                  <Button className="group w-auto px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm md:text-base">
                    <span className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                      {slide.ctaPrimary.label}
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
                {slide.ctaSecondary && (
                  <ThemedSecondaryButton
                    label={slide.ctaSecondary.label}
                    href={slide.ctaSecondary.href}
                    className="px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-2 min-h-8 sm:min-h-9 md:min-h-10 text-xs sm:text-sm md:text-sm"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  />
                )}
              </div>
            </HeroItem>

            {/* Row 6: Trust Row */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-description">
                <ThemedTrustRow
                  items={[
                    { icon: Shield, text: "2-Year Warranty" },
                    { icon: Star, text: "Expert Approved" },
                  ]}
                />
              </div>
            </HeroItem>
          </>
        }
        mediaContent={
          <HeroMediaFrame
            slide={slide}
            product={product}
            isActive={isActive}
            badge={
              <div className="hero-badge px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-bold flex items-center gap-1 sm:gap-1.5">
                <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                FEATURED
              </div>
            }
          />
        }
      />
    );
  }
);
