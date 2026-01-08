"use client";

import { memo } from "react";
import { Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ThemedBadge } from "../../shared/themed-badge";
import { ThemedSecondaryButton } from "../../shared/themed-secondary-button";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import { HeroItem } from "../shared/hero-item";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

// Helper to sanitize quotes by stripping wrapping quotes
function sanitizeQuote(quote: string): string {
  return quote.replace(/^["""]|["""]$/g, "");
}

// Helper to get initials from name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

interface TestimonialSlideBodyProps {
  slide: HeroSlide & { type: "TESTIMONIAL" };
  product?: Product;
  isActive: boolean;
  index: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i < rating ? "fill-current" : ""}`}
          style={{
            color: i < rating ? "var(--hero-accent)" : "var(--hero-muted)",
          }}
        />
      ))}
    </div>
  );
}

function QuoteCard({ slide }: { slide: HeroSlide & { type: "TESTIMONIAL" } }) {
  const sanitizedQuote = sanitizeQuote(slide.quote);
  const initials = getInitials(slide.authorName);

  return (
    <div className="bg-surface border border-border rounded-2xl p-3 sm:p-4 md:p-6 relative max-w-full overflow-hidden">
      {/* Quote Mark */}
      <Quote
        className="absolute top-2 left-2 sm:top-3 sm:left-3 md:top-4 md:left-4 w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 opacity-30"
        style={{ color: "var(--hero-accent)" }}
      />

      {/* Quote */}
      <blockquote
        className="text-xs sm:text-sm md:text-base lg:text-lg font-medium leading-relaxed mb-4 pl-6 sm:pl-0"
        style={{ color: "var(--hero-text)" }}
      >
        &ldquo;{sanitizedQuote}&rdquo;
      </blockquote>

      {/* Author Info */}
      <div className="flex items-center gap-2 sm:gap-3 pl-6 sm:pl-0">
        {/* Avatar */}
        <div
          className="w-7 h-7 sm:w-8 sm:h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
          style={{
            backgroundColor: "var(--hero-accent-weak)",
            color: "var(--hero-accent)",
          }}
        >
          {initials}
        </div>
        {/* Name and Rating */}
        <div className="min-w-0 flex-1">
          <div
            className="text-xs sm:text-sm md:text-base font-semibold truncate"
            style={{ color: "var(--hero-text)" }}
          >
            {slide.authorName}
          </div>
          <StarRating rating={slide.rating} />
        </div>
      </div>

      {/* Stats Below Author Name */}
      {slide.stats && slide.stats.length > 0 && (
        <div className="flex gap-0.5 sm:gap-1 md:gap-1.5 lg:gap-2 mt-0.5 sm:mt-1 md:mt-1.5 lg:mt-2 xl:mt-3 pl-6 sm:pl-0 overflow-x-auto">
          {slide.stats.slice(0, 3).map((stat, index) => (
            <div
              key={index}
              className="text-center px-0.5 sm:px-1 md:px-1.5 lg:px-2 py-0.5 bg-surface-muted rounded-md border border-border shrink-0"
            >
              <div
                className="text-xs font-bold leading-tight"
                style={{ color: "var(--hero-accent)" }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs font-medium leading-tight"
                style={{ color: "var(--hero-muted)" }}
              >
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export const TestimonialSlideBody = memo(function TestimonialSlideBody({
  slide,
  product,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: TestimonialSlideBodyProps) {
  // Animation run counter - increments when slide becomes active
  const { run, animationKey } = useHeroRunCounter(isActive);

  return (
    <SlideLayout
      textContent={
        <>
          {/* Row 1: Themed Badge */}
          <HeroItem run={run} animationKey={animationKey}>
            <div className="hero-item-enter hero-badge">
              <ThemedBadge icon={Star}>
                {slide.badgeText || "Customer Stories"}
              </ThemedBadge>
            </div>
          </HeroItem>

          {/* Row 2: Headline */}
          <HeroItem run={run} animationKey={animationKey}>
            <div className={`space-y-3 hero-item-enter hero-headline`}>
              <h1
                className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-(--font-dm-sans) italic leading-tight underline decoration-2 underline-offset-4`}
                style={{ color: "var(--hero-text)" }}
              >
                {slide.headline}
              </h1>
              {slide.highlight && (
                <h2
                  className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-(--font-inter) overline decoration-1"
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

          {/* Row 4: Flexible middle space (Quote Card) */}
          <HeroItem run={run} animationKey={animationKey}>
            <div className="hero-item-enter hero-description">
              <QuoteCard slide={slide} />
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
        </>
      }
      mediaContent={
        <HeroMediaFrame slide={slide} product={product} isActive={isActive} />
      }
    />
  );
});
