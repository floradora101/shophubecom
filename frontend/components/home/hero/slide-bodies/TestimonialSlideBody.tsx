import { memo } from "react";
import { Star, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { ThemedBadge } from "../../shared/themed-badge";
import { ThemedSecondaryButton } from "../../shared/themed-secondary-button";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
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

      {/* Author Row with Stats */}
      <div className="flex items-center justify-between">
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

        {/* Stats Chips - Max 3 */}
        {slide.stats && slide.stats.length > 0 && (
          <div className="flex gap-1">
            {slide.stats.slice(0, 3).map((stat, index) => (
              <div
                key={index}
                className="text-center px-1 py-0.5 bg-surface-muted rounded-md border border-border"
              >
                <div
                  className="text-xs font-bold leading-tight"
                  style={{ color: "var(--hero-accent)" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-[10px] font-medium leading-tight"
                  style={{ color: "var(--hero-muted)" }}
                >
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export const TestimonialSlideBody = memo(function TestimonialSlideBody({
  slide,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: TestimonialSlideBodyProps) {
  return (
    <SlideLayout
      textContent={
        <>
          {/* Row 1: Themed Badge */}
          <ThemedBadge icon={Star}>
            {slide.badgeText || "Customer Stories"}
          </ThemedBadge>

          {/* Row 2: Headline */}
          <div className="space-y-3">
            <h1
              className={`text-4xl lg:text-5xl font-black leading-tight underline decoration-2 underline-offset-4 ${contentClamp.headline}`}
              style={{ color: "var(--hero-text)" }}
            >
              {slide.headline}
            </h1>
            {slide.highlight && (
              <h2
                className="text-2xl lg:text-3xl font-bold overline decoration-1"
                style={{ color: "var(--hero-accent)" }}
              >
                {slide.highlight}
              </h2>
            )}
          </div>

          {/* Row 3: Description */}
          <p
            className={`text-lg leading-relaxed ${contentClamp.description}`}
            style={{ color: "var(--hero-muted)" }}
          >
            {slide.description}
          </p>

          {/* Row 4: Flexible middle space (Quote Card) */}
          <QuoteCard slide={slide} />

          {/* Row 5: CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
        </>
      }
      mediaContent={<HeroMediaFrame slide={slide} isActive={isActive} />}
    />
  );
});
