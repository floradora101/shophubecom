"use client";

import { memo } from "react";
import { Star, Quote, ArrowRight, Sparkles, Truck, RotateCcw } from "lucide-react";
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
          className={`w-2.5 h-2.5 lg:w-2 lg:h-2 ${i < rating ? "fill-red-600 text-red-600" : "text-gray-300"}`}
        />
      ))}
    </div>
  );
}

function QuoteCard({ slide }: { slide: HeroSlide & { type: "TESTIMONIAL" } }) {
  const sanitizedQuote = sanitizeQuote(slide.quote);
  const initials = getInitials(slide.authorName);

  return (
    <div className="bg-gradient-to-br from-white/70 to-white/40 backdrop-blur-xl border border-white/40 rounded-xl p-3 md:p-4 lg:p-3 w-full relative shadow-2xl overflow-hidden group/quote">
      {/* Decorative Gradient Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/10 rounded-full blur-3xl group-hover/quote:bg-red-600/20 transition-colors" />

      {/* Quote Mark */}
      <Quote
        className="absolute top-1.5 right-3 w-8 h-8 lg:w-6 lg:h-6 text-red-600/10 transition-transform duration-700 group-hover/quote:rotate-12 group-hover/quote:scale-110"
      />

      <div className="relative z-10">
        <blockquote
          className="text-sm md:text-base lg:text-[15px] font-medium leading-relaxed lg:leading-snug mb-2 lg:mb-1.5 text-gray-900 italic tracking-tight pr-4"
        >
          &ldquo;{sanitizedQuote}&rdquo;
        </blockquote>

        <div className="flex items-center justify-between gap-2 py-2 border-y border-red-600/5">
          <div className="flex items-center gap-2">
            {/* Avatar */}
            <div
              className="w-8 h-8 lg:w-7 lg:h-7 rounded-md bg-red-600 flex items-center justify-center text-[10px] font-black text-white shadow-md"
            >
              {initials}
            </div>
            {/* Name and Label */}
            <div>
              <div className="text-[11px] lg:text-[10px] font-black text-gray-900 tracking-tight leading-none">
                {slide.authorName}
              </div>
              <div className="text-[8px] lg:text-[7px] font-bold uppercase tracking-widest text-red-600 mt-0.5">
                Verified Buyer
              </div>
            </div>
          </div>
          <StarRating rating={slide.rating} />
        </div>

        {/* Stats Grid - Ultra Compact */}
        {slide.stats && slide.stats.length > 0 && (
          <div className="grid grid-cols-3 gap-1 mt-2">
            {slide.stats.slice(0, 3).map((stat, index) => (
              <div
                key={index}
                className="text-center p-1 rounded-md bg-white/40 border border-white/10 transition-all group-hover/quote:bg-white"
              >
                <div className="text-[10px] lg:text-[9px] font-black text-red-600 leading-none">
                  {stat.value}
                </div>
                <div className="text-[7px] lg:text-[6px] font-bold text-gray-500 uppercase tracking-tighter mt-0.5">
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
              <div className="hero-item-enter hero-badge">
                <Badge variant="primary" size="default" className="mt-2 sm:mt-4">
                  <Star className="h-3.5 w-3.5" />
                  {slide.badgeText || "Customer Stories"}
                </Badge>
              </div>
            </HeroItem>

            {/* Row 2: Headline */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-headline mt-1.5 transition-transform duration-700 group-hover:translate-x-2">
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] md:leading-none tracking-tighter text-gray-900 mb-0.5 md:mb-1"
                >
                  {slide.headline}
                </h1>
                {slide.highlight && (
                  <h2
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] md:leading-none tracking-tight italic text-red-600 mb-3 md:mb-4"
                  >
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

            {/* Row 4: Premium Quote Card */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-description mt-2 md:mt-3">
                <QuoteCard slide={slide} />
              </div>
            </HeroItem>

            {/* Row 5: CTAs */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="flex flex-row gap-3 mt-4 md:mt-6 hero-item-enter hero-buttons text-gray-900">
                <Link
                  href={slide.ctaPrimary.href}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                >
                  <Button size="hero" className="bg-red-600 hover:bg-red-700 text-white border-none shadow-xl hover:scale-105 active:scale-95 transition-all px-6 h-11 md:h-12">
                    <span className="flex items-center gap-2 font-black uppercase tracking-wider text-sm md:text-base">
                      {slide.ctaPrimary.label}
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />
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
              <div className="hero-item-enter hero-description pt-4 mt-4 border-t border-red-600/5">
                <div className="flex flex-nowrap items-center gap-6 overflow-x-auto">
                  {[
                    { icon: Star, text: "Staff Favorite" },
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
