"use client";

import React, { memo, ComponentType } from "react";
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
const FEATURE_ICONS: Record<string, ComponentType<{ className?: string }>> = {
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
      <div className="group relative w-full h-full">
        <SlideLayout
          textContent={
            <>
              {/* Row 1: Themed Badge */}
              <HeroItem run={run} animationKey={animationKey}>
                <div className="hero-item-enter hero-badge">
                  <Badge
                    variant="primary"
                    size="default"
                    className="mt-2 sm:mt-4"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {slide.badgeText || "Premium Product"}
                  </Badge>
                </div>
              </HeroItem>

              {/* Row 2: Headline */}
              <HeroItem run={run} animationKey={animationKey}>
                <div className="hero-item-enter hero-headline mt-0.5 transition-transform duration-700 group-hover:translate-x-2 w-full max-w-full min-w-0">
                  <h1
                    className="text-lg xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] md:leading-none tracking-tighter text-gray-900 mb-0.5 md:mb-1 wrap-break-word"
                  >
                    {slide.headline}
                  </h1>
                  {slide.highlight && (
                    <h2
                      className="text-lg xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] md:leading-none tracking-tight italic text-red-600 mb-3 md:mb-4 wrap-break-word"
                    >
                      {slide.highlight}
                    </h2>
                  )}
                </div>
              </HeroItem>

              {/* Row 3: Description */}
              <HeroItem run={run} animationKey={animationKey}>
                <p
                  className={`text-[10px] sm:text-sm md:text-base lg:text-lg leading-snug font-medium mt-0.5 hero-item-enter hero-description ${contentClamp.description} text-warm-gray-500 line-clamp-2 sm:line-clamp-none w-full max-w-full`}
                >
                  {slide.description}
                </p>
              </HeroItem>

              {/* Row 4: Enhanced Product Details */}
              <HeroItem run={run} animationKey={animationKey}>
                <div className="w-[calc(100%-4px)] mx-auto lg:mx-0 lg:w-full max-w-full min-w-0 space-y-1 mt-1 md:mt-3 hero-item-enter hero-description bg-white/40 backdrop-blur-md p-1.5 md:p-4 rounded-lg border border-red-600/5 shadow-sm transition-all duration-500 group-hover:bg-white/60 group-hover:shadow-md">
                  <div className="space-y-0.5 min-w-0">
                    {product && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-0.5 sm:gap-4 min-w-0">
                        <h3 className="text-xs sm:text-lg md:text-2xl font-display font-black tracking-tight uppercase text-gray-900 truncate">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-1 bg-red-50/50 px-1 py-0 rounded-md text-red-600 w-fit shrink-0 scale-[0.85] sm:scale-100 origin-left">
                          <StarRating
                            rating={4.8}
                            reviewCount={124}
                            size="sm"
                          />
                        </div>
                      </div>
                    )}
                    {product && (
                      <div className="flex items-center gap-1.5 sm:gap-4">
                        <div className="scale-90 sm:scale-100 origin-left shrink-0">
                          <HeroPriceBlock product={product} />
                        </div>
                        <div className="h-3 w-px bg-gray-200 hidden sm:block" />
                        <span className="text-[7px] sm:text-[10px] font-bold uppercase tracking-widest text-red-600 animate-pulse shrink-0">
                          Available
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Dynamic Features List */}
                  <div className="flex flex-wrap gap-2 pt-2 border-t border-red-600/5">
                    {(slide.features && slide.features.length > 0
                      ? slide.features
                      : [
                          { iconName: "Zap", text: "Pro Performance" },
                          { iconName: "Shield", text: "2Y Warranty" },
                        ]
                    ).map((feature, i) => {
                      const Icon =
                        FEATURE_ICONS[
                          feature.iconName as keyof typeof FEATURE_ICONS
                        ] || Zap;
                      return (
                        <div
                          key={i}
                          className="group/feature flex items-center gap-1.5 px-3 py-1 rounded-lg border border-red-600/10 bg-white hover:bg-red-600 hover:text-white transition-all duration-300 cursor-default shadow-sm"
                        >
                          <Icon className="w-3 h-3 text-red-600 group-hover/feature:text-white transition-colors" />
                          <span className="text-[9px] md:text-[10px] font-black tracking-widest uppercase text-gray-900 opacity-80 group-hover/feature:text-white group-hover/feature:opacity-100 transition-colors">
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
                <div className="flex flex-row gap-1.5 mt-1.5 md:mt-4 justify-center lg:justify-start hero-item-enter hero-buttons text-gray-900">
                  <Link
                    href={slide.ctaPrimary.href}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  >
                    <Button size="hero" className="bg-red-600 hover:bg-red-700 text-white border-none shadow-xl hover:scale-105 active:scale-95 transition-all px-2.5 sm:px-6 h-7 sm:h-12">
                      <span className="flex items-center gap-1 font-black uppercase tracking-wider text-[9px] sm:text-sm md:text-base">
                        {slide.ctaPrimary.label}
                        <ArrowRight className="h-2.5 w-2.5 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </Link>
                {slide.ctaSecondary && (
                  <Link
                    href={slide.ctaSecondary.href}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  >
                    <Button
                      size="hero"
                      className="bg-white text-red-600 hover:bg-red-600 hover:text-white border-none shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 px-2.5 sm:px-6 h-7 sm:h-12 font-black uppercase tracking-wider text-[9px] sm:text-sm md:text-base"
                    >
                      {slide.ctaSecondary.label}
                    </Button>
                  </Link>
                )}
                </div>
              </HeroItem>

              {/* Row 6: Enhanced Trust Row */}
              <HeroItem run={run} animationKey={animationKey}>
                <div className="hero-item-enter hero-description pt-1.5 mt-1.5 border-t border-red-600/5">
                  <div className="flex flex-nowrap items-center gap-4 overflow-x-auto">
                    {[
                      { icon: Shield, text: "Protection" },
                      { icon: Truck, text: "Fast Shipping" },
                      { icon: RotateCcw, text: "30D Returns" },
                    ].map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest text-red-600/60"
                      >
                        <item.icon className="h-3 w-3" />
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
                <Badge variant="destructive" size="default">
                  <Sparkles className="w-3.5 h-3.5 text-red-500" />
                  FLAGSHIP
                </Badge>
              }
            />
          }
        />
      </div>
    );
  }
);

export default ProductSpotlightSlideBody;
