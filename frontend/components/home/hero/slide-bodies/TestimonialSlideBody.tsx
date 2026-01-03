import { memo } from "react";
import { Star, Quote } from "lucide-react";
import { HeroCTAs } from "../../shared/hero-ctas";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

interface TestimonialSlideBodyProps {
  slide: HeroSlide & { type: "TESTIMONIAL" };
  isActive: boolean;
  index: number;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? "fill-current" : ""}`}
          style={{
            color: i < rating ? "var(--hero-accent)" : "var(--hero-muted)",
          }}
        />
      ))}
    </div>
  );
}

function QuoteCard({ slide }: { slide: HeroSlide & { type: "TESTIMONIAL" } }) {
  return (
    <div className="hero-card relative">
      {/* Quote Icon */}
      <Quote
        className="absolute top-6 left-6 w-8 h-8 opacity-20"
        style={{ color: "var(--hero-accent)" }}
      />

      {/* Rating */}
      <div className="mb-4">
        <StarRating rating={slide.rating} />
      </div>

      {/* Quote */}
      <blockquote
        className={`text-xl lg:text-2xl font-medium leading-relaxed mb-6 ${contentClamp.description}`}
        style={{ color: "var(--hero-text)" }}
      >
        &ldquo;{slide.quote}&rdquo;
      </blockquote>

      {/* Author */}
      <div className="mb-6">
        <div
          className="text-lg font-bold"
          style={{ color: "var(--hero-text)" }}
        >
          {slide.authorName}
        </div>
      </div>

      {/* Stats Row - Max 3 */}
      {slide.stats && slide.stats.length > 0 && (
        <div
          className="flex flex-wrap gap-6 pt-4 border-t"
          style={{ borderColor: "var(--hero-border)" }}
        >
          {slide.stats.slice(0, 3).map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className="text-2xl font-bold"
                style={{ color: "var(--hero-accent)" }}
              >
                {stat.value}
              </div>
              <div
                className="text-sm font-medium"
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
  index,
}: TestimonialSlideBodyProps) {
  return (
    <SlideLayout
      textContent={
        <>
          {/* Badge */}
          <div className="hero-badge inline-flex items-center gap-2">
            <Star className="h-4 w-4 fill-current" />
            <span>{slide.badgeText || "Customer Stories"}</span>
          </div>

          {/* Headline */}
          <div className="space-y-3">
            <h1
              className={`text-4xl lg:text-5xl font-black leading-tight ${contentClamp.headline}`}
              style={{ color: "var(--hero-text)" }}
            >
              {slide.headline}
            </h1>
            {slide.highlight && (
              <h2
                className="text-2xl lg:text-3xl font-bold"
                style={{ color: "var(--hero-text)" }}
              >
                {slide.highlight}
              </h2>
            )}
            <p
              className={`text-lg leading-relaxed ${contentClamp.description}`}
              style={{ color: "var(--hero-muted)" }}
            >
              {slide.description}
            </p>
          </div>

          {/* Premium Quote Card */}
          <QuoteCard slide={slide} />

          {/* CTAs */}
          <HeroCTAs primary={slide.ctaPrimary} secondary={slide.ctaSecondary} />
        </>
      }
      mediaContent={
        <HeroMediaFrame slide={slide} isActive={isActive} />
      }
    />
  );
});
