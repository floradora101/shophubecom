"use client";

import { memo } from "react";
import { Star, Quote, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
          className={`w-3 h-3 ${
            i < rating ? "fill-red-600 text-red-600" : "text-gray-300"
          }`}
        />
      ))}
    </div>
  );
}

function QuoteCard({ slide }: { slide: HeroSlide & { type: "TESTIMONIAL" } }) {
  const sanitizedQuote = sanitizeQuote(slide.quote);
  const initials = getInitials(slide.authorName);

  return (
    <div className="w-[calc(100%-4px)] mx-auto lg:mx-0 lg:w-full max-w-full min-w-0 bg-white/40 backdrop-blur-md border border-white/20 rounded-lg p-1.5 md:p-4 relative shadow-xl overflow-hidden group/quote">
      {/* Decorative Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/5 rounded-full blur-3xl group-hover/quote:bg-red-600/10 transition-colors" />

      {/* Quote Mark */}
      <Quote className="absolute top-1 right-2 w-4 h-4 sm:w-10 sm:h-10 text-red-600/10 transition-transform duration-700 group-hover/quote:scale-110" />

      <div className="relative z-10 min-w-0 space-y-1">
        <div className="scale-85 sm:scale-100 origin-left shrink-0">
          <StarRating rating={slide.rating} />
        </div>

        <blockquote className="text-[11px] xs:text-[13px] sm:text-lg lg:text-xl font-medium leading-tight my-1 sm:my-3 text-gray-900 italic tracking-tight line-clamp-3 sm:line-clamp-none">
          &ldquo;{sanitizedQuote}&rdquo;
        </blockquote>

        <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 mt-1">
          {/* Avatar */}
          <div className="w-6 h-6 sm:w-10 sm:h-10 rounded-lg bg-red-600 flex items-center justify-center text-[8px] sm:text-xs font-black text-white shadow-lg shrink-0">
            {initials}
          </div>
          {/* Name and Label */}
          <div className="min-w-0">
            <div className="text-[9px] sm:text-sm font-black text-gray-900 tracking-tight truncate">
              {slide.authorName}
            </div>
            <div className="text-[7px] sm:text-[10px] font-bold uppercase tracking-widest text-red-600 truncate">
              Verified Buyer
            </div>
          </div>
        </div>

        {/* Stats Grid - Hidden on mobile, compact on others */}
        {slide.stats && slide.stats.length > 0 && (
          <div className="hidden xs:grid grid-cols-3 gap-1 mt-2 pt-2 border-t border-red-600/5">
            {slide.stats.slice(0, 3).map((stat, index) => (
              <div
                key={index}
                className="text-center p-1 rounded-lg bg-red-600/5 border border-red-600/5 transition-all group-hover/quote:bg-white min-w-0"
              >
                <div className="text-[9px] sm:text-xs font-black text-red-600 leading-none mb-0.5 truncate">
                  {stat.value}
                </div>
                <div className="text-[6px] sm:text-[8px] font-bold text-gray-500 uppercase tracking-tighter truncate">
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
  product,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: TestimonialSlideBodyProps) {
  // Animation run counter - increments when slide becomes active
  const { run, animationKey } = useHeroRunCounter(isActive);

  return (
    <div className="group relative w-full h-full">
      <SlideLayout
        textContent={
          <>
            {/* Row 1: Themed Badge */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-badge w-fit max-w-full">
                <Badge
                  variant="primary"
                  size="default"
                  className="mt-1 sm:mt-4 px-2 py-0 h-5 sm:h-auto"
                >
                  <Star className="h-3 w-3 shrink-0" />
                  <span className="truncate text-[10px] sm:text-xs">
                    {slide.badgeText || "Customer Stories"}
                  </span>
                </Badge>
              </div>
            </HeroItem>

            {/* Row 2: Headline */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-headline mt-0.5 transition-transform duration-700 group-hover:translate-x-2 w-full max-w-full min-w-0">
                <h1 className="text-lg xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tighter text-gray-900 wrap-break-word">
                  {slide.headline}
                </h1>
                {slide.highlight && (
                  <h2 className="text-lg xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight italic text-red-600 wrap-break-word">
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

            {/* Row 4: Premium Quote Card */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-description mt-1 md:mt-3">
                <QuoteCard slide={slide} />
              </div>
            </HeroItem>

            {/* Row 5: CTAs */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="flex flex-row gap-1.5 mt-1.5 md:mt-4 hero-item-enter hero-buttons">
                <Link
                  href={slide.ctaPrimary.href}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                >
                  <Button
                    size="hero"
                    className="bg-red-600 hover:bg-red-700 text-white border-none shadow-xl hover:scale-105 active:scale-95 transition-all px-2.5 sm:px-6 h-7 sm:h-12"
                  >
                    <span className="flex items-center gap-1 font-black uppercase tracking-wider text-[9px] sm:text-sm md:text-base">
                      {slide.ctaPrimary.label}
                      <ArrowRight className="h-2.5 w-2.5 md:h-5 md:w-5" />
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
                COMMUNITY
              </Badge>
            }
          />
        }
      />
    </div>
  );
});

export default TestimonialSlideBody;
