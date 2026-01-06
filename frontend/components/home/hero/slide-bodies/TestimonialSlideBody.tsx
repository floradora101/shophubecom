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
    <div className="bg-surface border border-border rounded-2xl p-6 relative">
      {/* Quote Mark */}
      <Quote
        className="absolute top-4 left-4 w-6 h-6 opacity-30"
        style={{ color: "var(--hero-accent)" }}
      />

      {/* Quote */}
      <blockquote
        className="text-base lg:text-lg font-medium leading-relaxed mb-4"
        style={{ color: "var(--hero-text)" }}
      >
        &ldquo;{sanitizedQuote}&rdquo;
      </blockquote>

      {/* Author Info */}
      <div className="flex items-center gap-3">
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
          style={{
            backgroundColor: "var(--hero-accent-weak)",
            color: "var(--hero-accent)",
          }}
        >
          {initials}
        </div>
        {/* Name and Rating */}
        <div>
          <div
            className="text-base font-semibold"
            style={{ color: "var(--hero-text)" }}
          >
            {slide.authorName}
          </div>
          <StarRating rating={slide.rating} />
        </div>
      </div>

      {/* Stats Below Author Name */}
      {slide.stats && slide.stats.length > 0 && (
        <div className="flex gap-2 mt-3">
          {slide.stats.slice(0, 3).map((stat, index) => (
            <div
              key={index}
              className="text-center px-2 py-1 bg-surface-muted rounded-lg border border-border"
            >
              <div
                className="text-sm font-bold leading-tight"
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

          {/* Row 4: Flexible middle space (Quote Card) */}
          <HeroItem run={run} animationKey={animationKey}>
            <div className="hero-item-enter hero-description">
              <QuoteCard slide={slide} />
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
        </>
      }
      mediaContent={<HeroMediaFrame slide={slide} isActive={isActive} />}
    />
  );
});
