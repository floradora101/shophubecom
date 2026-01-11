"use client";

import React, { memo } from "react";
import {
  Sparkles,
  Zap,
  Shield,
  Star,
  ArrowRight,
  Battery,
  Palette,
  Truck,
  RotateCcw,
  LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { HeroPriceBlock } from "../../shared/hero-price-block";
import { Badge } from "@/components/ui/badge";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import { HeroItem } from "../shared/hero-item";
import { StarRating } from "@/components/ui/star-rating";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

// Icon mapping for dynamic features
const FEATURE_ICONS: Record<string, LucideIcon> = {
  Zap,
  Shield,
  Battery,
  Palette,
  Truck,
  RotateCcw,
  Star,
};

interface ProductSpotlightSlideBodyProps {
  slide: HeroSlide & { type: "PRODUCT_SPOTLIGHT" };
  product?: Product;
  isActive: boolean;
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
                <Badge
                  variant="primary"
                  className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 mt-4 sm:mt-6 w-fit text-xs sm:text-sm font-semibold text-white border border-white/22 bg-linear-to-r from-red-600 via-red-700 to-red-800"
                >
                  <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                  {slide.badgeText || "Premium Product"}
                </Badge>
              </div>
            </HeroItem>

            {/* Row 2: Headline */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className={`space-y-3 hero-item-enter hero-headline`}>
                <h1
                  className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold italic leading-tight underline decoration-2 underline-offset-4`}
                  style={{ color: "#171717" }}
                >
                  {slide.headline}
                </h1>
                {slide.highlight && (
                  <h2
                    className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-sans font-bold overline decoration-1"
                    style={{ color: "#fa0603" }}
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
                style={{ color: "#7a6b67" }}
              >
                {slide.description}
              </p>
            </HeroItem>

            {/* Row 4: Enhanced Product Details (Name, Rating, Price, Features) */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="space-y-6 hero-item-enter hero-description">
                <div className="space-y-2">
                  {product && (
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                      <h3
                        className="text-xl sm:text-2xl md:text-3xl font-display font-bold tracking-tight"
                        style={{ color: "#171717" }}
                      >
                        {product.name}
                      </h3>
                      <StarRating
                        rating={4.8}
                        reviewCount={124}
                        size="sm"
                        className="opacity-90"
                      />
                    </div>
                  )}
                  {product && <HeroPriceBlock product={product} />}
                </div>

                {/* Dynamic Features List */}
                <div className="flex flex-wrap gap-3">
                  {(slide.features && slide.features.length > 0
                    ? slide.features
                    : [
                        { iconName: "Zap", text: "30hr Battery" },
                        { iconName: "Shield", text: "Global Warranty" },
                        { iconName: "Palette", text: "Premium Finish" },
                      ]
                  ).map((feature, i) => {
                    const Icon =
                      FEATURE_ICONS[
                        feature.iconName as keyof typeof FEATURE_ICONS
                      ] || Zap;
                    return (
                      <div
                        key={i}
                        className="hero-pill group flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 cursor-default shadow-sm hover:shadow-md hover:-translate-y-0.5"
                      >
                        <Icon className="w-4 h-4 text-primary group-hover:scale-110 transition-transform animate-pulse-slow" />
                        <span className="text-[10px] sm:text-xs font-bold tracking-wider uppercase opacity-90 group-hover:opacity-100">
                          {feature.text}
                        </span>
                      </div>
                    );
                  })}
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
                  <Button className="group w-auto px-3 sm:px-4 md:px-6 py-1.5 sm:py-2 md:py-3 text-xs sm:text-sm md:text-base shadow-xl">
                    <span className="flex items-center gap-1 sm:gap-1.5 md:gap-2">
                      {slide.ctaPrimary.label}
                      <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
                {slide.ctaSecondary && (
                  <Link
                    href={slide.ctaSecondary.href}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  >
                    <button className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-auto min-h-8 sm:min-h-10 text-xs sm:text-sm text-white border border-white/22 bg-linear-to-r from-red-600 via-red-700 to-red-800">
                      <span className="flex items-center gap-1.5 sm:gap-2">
                        {slide.ctaSecondary.label}
                      </span>
                    </button>
                  </Link>
                )}
              </div>
            </HeroItem>

            {/* Row 6: Enhanced Trust Row */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-description pt-4 border-t border-white/5">
                <div className="flex flex-nowrap items-center gap-1.5 sm:gap-3 md:gap-6 lg:gap-8 overflow-x-auto">
                  {[
                    { icon: Shield, text: "2-Year Protection" },
                    { icon: Truck, text: "Free Global Express" },
                    { icon: RotateCcw, text: "30-Day Returns" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 sm:gap-3 font-medium text-xs sm:text-sm text-transparent bg-linear-to-r from-red-600 to-red-700 bg-clip-text"
                    >
                      {item.icon ? (
                        <item.icon className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                      ) : item.useDot ? (
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-red-600" />
                      ) : null}
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
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
