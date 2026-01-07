"use client";

import { memo } from "react";
import { Grid3X3, Trophy, ArrowRight } from "lucide-react";
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

interface CategorySpotlightSlideBodyProps {
  slide: HeroSlide & { type: "CATEGORY_SPOTLIGHT" };
  isActive: boolean;
  index: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const CategorySpotlightSlideBody = memo(
  function CategorySpotlightSlideBody({
    slide,
    isActive,
    onMouseEnter,
    onMouseLeave,
  }: CategorySpotlightSlideBodyProps) {
    // Animation run counter - increments when slide becomes active
    const { run, animationKey } = useHeroRunCounter(isActive);

    return (
      <SlideLayout
        textContent={
          <>
            {/* Row 1: Themed Badge */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-badge">
                <ThemedBadge icon={Grid3X3}>
                  {slide.badgeText || "Category Spotlight"}
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

            {/* Row 4: Flexible middle space (Category Tiles) */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="space-y-3 hero-item-enter hero-description">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "var(--hero-text)" }}
                >
                  Top Picks
                </h3>
                <div className="space-y-2">
                  {(slide.categoryBullets || [])
                    .slice(0, 3)
                    .map((bullet, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-surface border border-border hover:bg-surface-muted transition-colors cursor-pointer group"
                      >
                        {/* Left accent bar */}
                        <div
                          className="w-1 h-6 rounded-full shrink-0"
                          style={{ backgroundColor: "var(--hero-accent)" }}
                        />
                        {/* Number */}
                        <span
                          className="text-sm font-mono font-bold tabular-nums min-w-6"
                          style={{ color: "var(--hero-accent)" }}
                        >
                          {(index + 1).toString().padStart(2, "0")}
                        </span>
                        {/* Text */}
                        <span
                          className={`text-sm leading-relaxed flex-1 ${contentClamp.bullet}`}
                          style={{ color: "var(--hero-text)" }}
                        >
                          {bullet}
                        </span>
                        {/* Arrow */}
                        <ArrowRight className="w-4 h-4 text-muted-fg group-hover:translate-x-1 transition-transform shrink-0" />
                      </div>
                    ))}
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
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
                    { icon: Trophy, text: "Expert Curated" },
                    { text: "Fast Delivery", useDot: true },
                  ]}
                />
              </div>
            </HeroItem>
          </>
        }
        mediaContent={<HeroMediaFrame slide={slide} isActive={isActive} />}
      />
    );
  }
);
