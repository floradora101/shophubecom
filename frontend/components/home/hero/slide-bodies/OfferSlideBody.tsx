"use client";

import { memo, useState } from "react";
import { Percent, Clock, Gift, Copy, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import { HeroItem } from "../shared/hero-item";
import { SparkleEffect } from "../shared/SparkleEffect";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";
import { getDetailedCountdown } from "@/lib/utils/date";

interface OfferSlideBodyProps {
  slide: HeroSlide & { type: "OFFER" };
  product?: Product;
  isActive: boolean;
  index: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const OfferSlideBody = memo(function OfferSlideBody({
  slide,
  product,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: OfferSlideBodyProps) {
  // Animation run counter - increments when slide becomes active
  const { run, animationKey } = useHeroRunCounter(isActive);

  const promoCode = slide.promoCode || "";
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(promoCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.warn("Failed to copy promo code:", error);
    }
  };

  const detailedCountdown = getDetailedCountdown(slide.offerEndsAt);

  const textContent = (
    <>
      {/* Row 1: Themed Badge */}
      <HeroItem run={run} animationKey={animationKey}>
        <div className="hero-item-enter hero-badge">
          <Badge variant="primary" size="default" className="mt-2 sm:mt-4">
            <Percent className="h-3.5 w-3.5" />
            {slide.badgeText || "Limited Time Offer"}
          </Badge>
        </div>
      </HeroItem>

      {/* Row 2: Headline */}
      <HeroItem run={run} animationKey={animationKey}>
        <div className="hero-item-enter hero-headline mt-1.5 transition-transform duration-700 group-hover:translate-x-2">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] md:leading-none tracking-tighter text-gray-900 mb-0.5 md:mb-1">
            {slide.headline}
          </h1>
          {slide.highlight && (
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] md:leading-none tracking-tight italic text-red-600 mb-3 md:mb-4">
              {slide.highlight}
            </h2>
          )}
        </div>
      </HeroItem>

      {/* Row 3: Description */}
      <HeroItem run={run} animationKey={animationKey}>
        <p
          className={`text-sm md:text-base lg:text-lg leading-relaxed font-medium mt-1 hero-item-enter hero-description ${contentClamp.description} text-warm-gray-500`}
        >
          {slide.description}
        </p>
      </HeroItem>

      {/* Row 4: Professional Countdown & Coupon */}
      <HeroItem run={run} animationKey={animationKey}>
        <div className="relative flex flex-col sm:flex-row items-center justify-center lg:justify-start hero-item-enter hero-description mt-3 md:mt-4 bg-white/40 backdrop-blur-md p-4 md:p-5 rounded-lg border border-red-600/5 shadow-sm transition-all duration-500 group-hover:bg-white/60 group-hover:shadow-md gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center shrink-0 shadow-lg group-hover:rotate-12 transition-transform duration-500">
              <Percent className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <div className="font-black text-lg sm:text-xl md:text-2xl tracking-tighter text-gray-900 truncate">
                {slide.offerLabel}
              </div>
              <div className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-red-600 leading-none">
                Flash Deal
              </div>
            </div>
          </div>

          <div className="flex flex-row gap-2 items-center">
            {/* Digital Countdown */}
            <div className="bg-gray-900 text-white p-2 rounded-lg flex flex-col items-center justify-center min-w-[100px] shadow-xl">
              <div className="flex items-center gap-1.5 text-[9px] font-black tracking-widest text-red-500 mb-0.5">
                <Clock className="w-2.5 h-2.5" />
                ENDS
              </div>
              <div className="flex items-baseline gap-0.5 font-mono">
                <span className="text-xl font-black">
                  {detailedCountdown.hours.toString().padStart(2, "0")}
                </span>
                <span className="text-[9px] font-bold opacity-50">H</span>
                <span className="text-xl font-black ml-1">
                  {detailedCountdown.minutes.toString().padStart(2, "0")}
                </span>
                <span className="text-[9px] font-bold opacity-50">M</span>
              </div>
            </div>

            {/* Modern Coupon Code */}
            {slide.promoCode && (
              <button
                onClick={handleCopyCode}
                className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-dashed border-red-200 bg-red-50/50 hover:bg-white transition-all duration-300 group/coupon min-w-[110px]"
              >
                <div className="text-[9px] font-black tracking-widest text-red-600 mb-0.5">
                  {copied ? "COPIED" : "CODE"}
                </div>
                <div className="flex items-center gap-1.5">
                  <code className="text-lg font-black tracking-tight text-gray-900 font-mono leading-none">
                    {promoCode}
                  </code>
                  {copied ? (
                    <Check className="w-3 h-3 text-green-600" />
                  ) : (
                    <Copy className="w-3 h-3 text-red-400 group-hover/coupon:text-red-600" />
                  )}
                </div>
              </button>
            )}
          </div>
        </div>
      </HeroItem>

      {/* Row 5: CTAs */}
      <HeroItem run={run} animationKey={animationKey}>
        <div className="flex flex-row gap-3 mt-4 md:mt-6 justify-center lg:justify-start hero-item-enter hero-buttons">
          <Link
            href={slide.ctaPrimary.href}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <Button
              size="hero"
              className="bg-red-600 hover:bg-red-700 text-white border-none shadow-xl hover:scale-105 active:scale-95 transition-all px-6 h-11 md:h-12"
            >
              <span className="flex items-center gap-2 font-black uppercase tracking-wider text-sm md:text-base">
                {slide.ctaPrimary.label}
                <Sparkles className="h-4 w-4 md:h-5 md:w-5" />
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
                className="bg-white text-red-600 hover:bg-red-600 hover:text-white border-none shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 px-6 h-11 md:h-12 font-black uppercase tracking-wider text-sm md:text-base"
              >
                {slide.ctaSecondary.label}
              </Button>
            </Link>
          )}
        </div>
      </HeroItem>

      {/* Row 6: Enhanced Trust Row */}
      <HeroItem run={run} animationKey={animationKey}>
        <div className="hero-item-enter hero-description pt-2 mt-2 border-t border-red-600/5">
          <div className="flex flex-nowrap items-center justify-center lg:justify-start gap-4">
            {[
              { icon: Percent, text: "Verified Deal" },
              { icon: Clock, text: "Ends Soon" },
              { icon: Check, text: "Guaranteed" },
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
  );

  return (
    <div className="group relative w-full h-full">
      <SparkleEffect
        isActive={isActive}
        count={60}
        variant="glitter"
        className="opacity-50"
      />
      <SlideLayout
        textContent={textContent}
        mediaContent={
          <HeroMediaFrame
            slide={slide}
            product={product}
            isActive={isActive}
            badge={
              <div className="bg-red-600 text-white px-2 py-1 rounded-lg text-[10px] font-black tracking-widest flex items-center gap-1.5 shadow-2xl animate-bounce">
                <Gift className="w-3 h-3" />
                BONUS
              </div>
            }
          />
        }
      />
    </div>
  );
});

export default OfferSlideBody;
