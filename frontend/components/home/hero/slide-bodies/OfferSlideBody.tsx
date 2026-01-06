import { memo, useState } from "react";
import { Percent, Clock, Gift, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ThemedBadge } from "../../shared/themed-badge";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { ThemedSecondaryButton } from "../../shared/themed-secondary-button";
import { ThemedTrustRow } from "../../shared/themed-trust-row";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import { HeroItem } from "../shared/hero-item";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import { getDetailedCountdown } from "@/lib/utils/date";

interface OfferSlideBodyProps {
  slide: HeroSlide & { type: "OFFER" };
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
          <ThemedBadge icon={Percent}>
            {slide.badgeText || "Limited Time Offer"}
          </ThemedBadge>
        </div>
      </HeroItem>

      {/* Row 2: Headline */}
      <HeroItem run={run} animationKey={animationKey}>
        <div className={`space-y-3 hero-item-enter hero-headline`}>
          <h1
            className={`text-3xl md:text-4xl lg:text-5xl font-(--font-dm-sans) font-bold italic leading-tight underline decoration-2 underline-offset-4`}
            style={{ color: "var(--hero-text)" }}
          >
            {slide.headline}
          </h1>
          {slide.highlight && (
            <h2
              className="text-xl md:text-2xl lg:text-3xl font-(--font-inter) font-bold overline decoration-1"
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
          className={`text-lg leading-relaxed hero-item-enter hero-description ${contentClamp.description}`}
          style={{ color: "var(--hero-muted)" }}
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
              style={{
                backgroundColor: "var(--hero-surface, rgba(255,255,255,0.04))",
                borderColor: "var(--hero-border)",
                borderWidth: "1px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
              }}
            >
              {/* Tech Circuit Pattern Background */}
              <div
                className="absolute inset-0 opacity-4"
                style={{
                  backgroundImage: `
                    linear-gradient(45deg, var(--hero-theme-from) 25%, transparent 25%),
                    linear-gradient(-45deg, var(--hero-theme-from) 25%, transparent 25%),
                    linear-gradient(45deg, transparent 75%, var(--hero-theme-from) 75%),
                    linear-gradient(-45deg, transparent 75%, var(--hero-theme-from) 75%)
                  `,
                  backgroundSize: "8px 8px",
                  backgroundPosition: "0 0, 0 4px, 4px -4px, -4px 0px",
                }}
              />

              {/* Compact Content - Single Row Layout */}
              <div className="relative p-6">
                <div className="flex items-center justify-between gap-4">
                  {/* Left: Icon + Offer */}
                  <div className="flex items-center gap-5 flex-1">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        backgroundColor: "var(--hero-theme-from)",
                        boxShadow: "0 3px 6px rgba(0,0,0,0.2)",
                      }}
                    >
                      <Percent className="w-5 h-5 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div
                        className="font-bold text-2xl lg:text-3xl tracking-tight truncate"
                        style={{ color: "var(--hero-text)" }}
                      >
                        {slide.offerLabel}
                      </div>
                      <div
                        className="text-base opacity-80"
                        style={{ color: "var(--hero-muted)" }}
                      >
                        Limited time • Use code below
                      </div>
                    </div>
                  </div>

                  {/* Right: Timer + Coupon Stack */}
                  <div className="flex flex-col gap-4 items-end">
                    {/* Prominent Timer with Labels */}
                    <div
                      className="px-5 py-3 rounded-lg font-mono text-base font-bold min-w-[140px]"
                      style={{
                        backgroundColor: "var(--hero-theme-from)",
                        color: "white",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-5 h-5" />
                        <span className="text-sm font-semibold">TIME LEFT</span>
                      </div>
                      {detailedCountdown.isEndingSoon ? (
                        <div className="text-xl font-black animate-pulse">
                          ENDING SOON
                        </div>
                      ) : (
                        <div className="flex items-baseline gap-1 justify-center">
                          <span className="text-3xl font-black">
                            {detailedCountdown.hours
                              .toString()
                              .padStart(2, "0")}
                          </span>
                          <span className="text-base font-bold opacity-90 ml-1">
                            h
                          </span>
                          <span className="text-3xl font-black ml-2">
                            {detailedCountdown.minutes
                              .toString()
                              .padStart(2, "0")}
                          </span>
                          <span className="text-base font-bold opacity-90 ml-1">
                            m
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Coupon Badge */}
                    {slide.promoCode && (
                      <div
                        className="px-5 py-2.5 rounded-lg cursor-pointer border transition-all duration-200 hover:scale-105"
                        style={{
                          backgroundColor:
                            "var(--hero-surface, rgba(255,255,255,0.1))",
                          borderColor: copied
                            ? "var(--hero-theme-from)"
                            : "transparent",
                          borderWidth: "1px",
                        }}
                        onClick={handleCopyCode}
                      >
                        <div className="flex items-center gap-2.5">
                          <code
                            className="font-mono font-bold text-base select-all"
                            style={{ color: "var(--hero-theme-from)" }}
                          >
                            {promoCode}
                          </code>
                          {copied ? (
                            <Check
                              className="w-5 h-5 animate-pulse"
                              style={{ color: "#10b981" }}
                            />
                          ) : (
                            <Copy
                              className="w-5 h-5"
                              style={{ color: "var(--hero-muted)" }}
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
        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start hero-item-enter hero-buttons">
          <Link
            href={slide.ctaPrimary.href}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
          >
            <Button className="group w-auto">
              <span className="flex items-center gap-2">
                {slide.ctaPrimary.label}
                <Percent className="h-4 w-4 transition-transform group-hover:scale-110" />
              </span>
            </Button>
          </Link>
          {slide.ctaSecondary && (
            <ThemedSecondaryButton
              label={slide.ctaSecondary.label}
              href={slide.ctaSecondary.href}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            />
          )}
        </div>
      </HeroItem>

      {/* Row 6: Trust Signals */}
      <HeroItem run={run} animationKey={animationKey}>
        <div className="hero-item-enter hero-description">
          <ThemedTrustRow
            items={[
              { icon: Gift, text: "Exclusive Deals" },
              { icon: Clock, text: "Limited Time" },
              { text: "Easy Checkout", useDot: true },
            ]}
          />
        </div>
      </HeroItem>
    </>
  );

  const mediaContent = <HeroMediaFrame slide={slide} isActive={isActive} />;

  return (
    <div className="relative overflow-hidden w-full h-full">
      <div className="relative z-10">
        <SlideLayout textContent={textContent} mediaContent={mediaContent} />
      </div>
      {/* <SparkleOverlay enabled={isActive} /> */}
    </div>
  );
});
