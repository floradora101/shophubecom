"use client";

import { memo, useState } from "react";
import { Percent, Clock, Gift, Copy, Check } from "lucide-react";
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
          <Badge variant="primary" className="inline-flex items-center gap-1.5 sm:gap-2 rounded-full px-2 sm:px-3 py-1 sm:py-1.5 mt-4 sm:mt-6 w-fit text-xs sm:text-sm font-semibold text-white border border-white/22 bg-linear-to-r from-red-600 via-red-700 to-red-800">
            <Percent className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            {slide.badgeText || "Limited Time Offer"}
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

      {/* Row 4: Ultra-Compact Tech Store Badge - App Notification Style */}
      <HeroItem run={run} animationKey={animationKey}>
        <div className="relative flex items-center justify-center lg:justify-start hero-item-enter hero-description">
          {/* Compact Tech Badge - Like App Store Promotion */}
          <div className="relative max-w-xl w-full">
            <div
              className="relative rounded-lg border overflow-hidden"
              data-no-swipe
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                borderColor: "rgba(250, 6, 3, 0.18)",
                borderWidth: "1px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              {/* Tech Circuit Pattern Background */}
              <div
                className="absolute inset-0 opacity-4"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, #fa0603 25%, transparent 25%),
                    linear-gradient(-45deg, #fa0603 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, #fa0603 75%),
                    linear-gradient(-45deg, transparent 75%, #fa0603 75%)
                  `,
                  backgroundSize: "8px 8px",
                  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                }}
              />

              {/* Responsive Content Layout */}
              <div className="relative p-4 sm:p-6">
                {/* Mobile: Stacked Layout | Desktop: Side-by-Side */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 lg:gap-4">
                  {/* Left: Icon + Offer - Always visible */}
                  <div className="flex items-center gap-4 lg:gap-5 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: "#fa0603",
                        boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Percent className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold text-lg sm:text-xl md:text-2xl lg:text-3xl tracking-tight truncate"
                        style={{ color: "#171717" }}
                      >
                        {slide.offerLabel}
                      </div>
                      <div
                        className="text-xs sm:text-sm md:text-base opacity-80"
                        style={{ color: "#7a6b67" }}
                      >
                        Limited time • Use code below
                      </div>
                    </div>
                  </div>

                  {/* Right: Timer + Coupon Stack - Responsive sizing */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-4 items-start sm:items-center lg:items-end w-full sm:w-auto">
                    {/* Prominent Timer with Labels - Responsive sizing */}
                    <div
                      className="px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-3 lg:px-5 lg:py-3 rounded-lg font-mono text-xs sm:text-sm md:text-base font-bold min-w-[90px] sm:min-w-[100px] md:min-w-[120px] lg:min-w-[140px] w-full sm:w-auto"
                      style={{
                        backgroundColor: "#fa0603",
                        color: "white",
                      }}
                    >
                      <div className="flex items-center gap-1 sm:gap-1.5 md:gap-2 mb-1 sm:mb-1.5 md:mb-2">
                        <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 md:w-4 md:h-4 lg:w-5 lg:h-5" />
                        <span className="text-xs font-semibold">TIME LEFT</span>
                      </div>
                      {detailedCountdown.isEndingSoon ? (
                        <div className="text-sm sm:text-base md:text-lg font-black animate-pulse">
                          ENDING SOON
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1 justify-center">
                          <span className="text-lg sm:text-xl md:text-2xl font-black">
                            {detailedCountdown.hours
                              .toString()
                              .padStart(2, "0")}
                          </span>
                          <span className="text-xs font-bold opacity-90 ml-0.5 sm:ml-1">
                            h
                          </span>
                          <span className="text-lg sm:text-xl md:text-2xl font-black ml-1.5 sm:ml-2">
                            {detailedCountdown.minutes
                              .toString()
                              .padStart(2, "0")}
                          </span>
                          <span className="text-xs font-bold opacity-90 ml-0.5 sm:ml-1">
                            m
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Coupon Badge - Full width on mobile */}
                    {slide.promoCode && (
                      <div
                        className="px-3 py-2 sm:px-4 sm:py-2.5 md:px-5 rounded-lg cursor-pointer border transition-all duration-200 hover:scale-105 w-full sm:w-auto select-none touch-manipulation"
                        data-no-swipe
                        style={{
                          backgroundColor: "rgba(255,255,255,0.1)",
                          borderColor: copied
                            ? "#fa0603"
                            : "transparent",
                          borderWidth: "1px",
                        }}
                        onClick={handleCopyCode}
                      >
                        <div className="flex items-center justify-center sm:justify-start gap-2 sm:gap-2.5">
                          <code
                            className="font-mono font-bold text-xs sm:text-sm md:text-base select-none sm:select-all"
                            style={{ color: "#fa0603" }}
                          >
                            {promoCode}
                          </code>
                          {copied ? (
                            <Check
                              className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse"
                              style={{ color: "#10b981" }}
                            />
                          ) : (
                            <Copy
                              className="w-4 h-4 sm:w-5 sm:h-5"
                              style={{ color: "#7a6b67" }}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
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
                <Percent className="h-3 w-3 sm:h-4 sm:w-4 transition-transform group-hover:scale-110" />
              </span>
            </Button>
          </Link>
          {slide.ctaSecondary && (
            <Link href={slide.ctaSecondary.href} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
              <button
                className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-1.5 sm:py-2 font-semibold rounded-lg shadow-sm hover:shadow-md transition-all duration-200 w-auto min-h-8 sm:min-h-10 text-xs sm:text-sm text-white border border-white/22 bg-linear-to-r from-red-600 via-red-700 to-red-800"
              >
                <span className="flex items-center gap-1.5 sm:gap-2">{slide.ctaSecondary.label}</span>
              </button>
            </Link>
          )}
        </div>
      </HeroItem>

      {/* Row 6: Trust Signals */}
      <HeroItem run={run} animationKey={animationKey}>
        <div className="hero-item-enter hero-description">
          <div className="flex flex-nowrap items-center gap-1.5 sm:gap-3 md:gap-6 lg:gap-8 overflow-x-auto">
            {[
              { icon: Gift, text: "Exclusive Deals" },
              { icon: Clock, text: "Limited Time" },
              { text: "Easy Checkout", useDot: true },
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
  );

  const mediaContent = <HeroMediaFrame slide={slide} isActive={isActive} />;

  return (
    <div className="relative w-full h-full">
      {/* Glittery Sparkle Effect - Best Practice implementation */}
      <SparkleEffect isActive={isActive} count={40} />

      <SlideLayout textContent={textContent} mediaContent={mediaContent} />
    </div>
  );
});
