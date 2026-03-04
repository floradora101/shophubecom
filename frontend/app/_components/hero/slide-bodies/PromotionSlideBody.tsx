"use client";

import { memo } from "react";
import { Sparkles, ArrowRight, Clock, Percent } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { HeroItem } from "../shared/hero-item";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";
import { resolveSlidePrimaryCtaHref } from "@/lib/utils/heroSlides.utils";
import { cn } from "@/lib/utils";
import { shouldUnoptimizeImage } from "@/lib/utils/image-helpers";

interface PromotionSlideBodyProps {
  slide: HeroSlide & { type: "PROMOTION" };
  product?: Product;
  isActive: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const PromotionSlideBody = memo(function PromotionSlideBody({
  slide,
  product,
  isActive,
  onMouseEnter,
  onMouseLeave,
}: PromotionSlideBodyProps) {
  const { run, animationKey } = useHeroRunCounter(isActive);

  const customBg = slide.customColors?.bg || "#0f172a"; 
  const customText = slide.customColors?.text || "#ffffff";

  const imageUrl = slide.media.imageUrl;
  const objectPosition = slide.media.position || "center";

  return (
    <div className="group relative w-full h-full overflow-hidden bg-slate-950">
      {/* Background Media - Cinematic Style */}
      <div className="absolute inset-0 z-0">
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={slide.media.alt || slide.headline}
              fill
              className={cn(
                "object-cover transition-transform duration-10000 ease-out",
                isActive ? "scale-110" : "scale-100"
              )}
              style={{ objectPosition }}
              sizes="100vw"
              priority={isActive}
              unoptimized={shouldUnoptimizeImage(imageUrl)}
            />
            {/* Cinematic Overlays */}
            <div className="absolute inset-0 bg-linear-to-r from-black/90 via-black/40 to-transparent z-1" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(220,38,38,0.15)_0%,transparent_50%)] z-1" />
            <div className="absolute inset-0 bg-linear-to-t from-black/80 via-transparent to-transparent z-1" />
          </>
        ) : (
          <div
            className="absolute inset-0 opacity-20"
            style={{
              background: `radial-gradient(circle at 20% 30%, ${customBg} 0%, transparent 70%)`,
            }}
          />
        )}
        
        {/* Animated Background Accents - Themed to Red */}
        <div className="absolute top-1/3 -right-20 w-[600px] h-[600px] bg-red-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-20 left-1/4 w-[400px] h-[400px] bg-red-600/5 rounded-full blur-[100px] animate-bounce-slow" />
      </div>

      {/* Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32">
        <div className="max-w-4xl">
          {/* Badge: Unique Floating Design */}
          <HeroItem run={run} animationKey={animationKey}>
            <div className="hero-item-enter hero-badge mb-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg shadow-[0_0_20px_rgba(220,38,38,0.4)] transform -rotate-2 hover:rotate-0 transition-transform duration-300">
                <Sparkles className="h-4 w-4 animate-pulse" />
                <span className="text-[11px] font-black tracking-[0.2em] uppercase">
                  {slide.badgeText || "Special Promotion"}
                </span>
              </div>
            </div>
          </HeroItem>

          {/* Headline: Cinematic & Bold */}
          <HeroItem run={run} animationKey={animationKey}>
            <div className="hero-item-enter hero-headline mb-4 md:mb-6">
              <h1 className="flex flex-col gap-0 md:gap-2">
                <span className="text-4xl xs:text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-black text-white leading-[0.85] tracking-tighter uppercase italic">
                  {slide.headline}
                </span>
                {slide.highlight && (
                  <span className="text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-red-600 tracking-tighter leading-[0.85] drop-shadow-[0_0_30px_rgba(220,38,38,0.3)]">
                    {slide.highlight}
                  </span>
                )}
              </h1>
            </div>
          </HeroItem>

          {/* Description: Clean Glass Container */}
          <HeroItem run={run} animationKey={animationKey}>
            <div className="hero-item-enter hero-description relative mb-8 md:mb-10 pl-6 border-l-2 border-red-600/50">
              <p className="text-white/80 text-sm md:text-lg lg:text-xl font-medium leading-relaxed max-w-2xl">
                {slide.description}
              </p>
            </div>
          </HeroItem>

          {/* Trust Row: Glassmorphism Cards */}
          <HeroItem run={run} animationKey={animationKey}>
            <div className="flex flex-wrap items-center gap-4 mb-10 md:mb-12 hero-item-enter hero-description">
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                <Clock className="h-4 w-4 text-red-500" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/90">Limited Time Only</span>
              </div>
              <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 backdrop-blur-md border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
                <Percent className="h-4 w-4 text-red-500" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-white/90">Exclusive Discount</span>
              </div>
            </div>
          </HeroItem>

          {/* CTA: Premium High-Visibility Button */}
          <HeroItem run={run} animationKey={animationKey}>
            <div className="flex flex-row gap-4 hero-item-enter hero-buttons">
              <Link
                href={resolveSlidePrimaryCtaHref(slide)}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className="group/btn relative"
              >
                <div className="absolute -inset-1 bg-red-600 rounded-2xl blur opacity-25 group-hover/btn:opacity-60 transition duration-500" />
                <Button
                  size="hero"
                  className="bg-red-600 hover:bg-red-700 text-white border-none px-12 h-16 md:h-20 rounded-2xl relative overflow-hidden transition-all duration-300"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                  <span className="flex items-center gap-4 font-black uppercase tracking-[0.2em] text-lg md:text-xl relative z-10">
                    {slide.ctaPrimary?.label || "Shop Promotion"}
                    <ArrowRight className="h-6 w-6 group-hover/btn:translate-x-2 transition-transform" />
                  </span>
                </Button>
              </Link>
            </div>
          </HeroItem>
        </div>
      </div>
      
      {/* Decorative Cinematic Progress Line */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 z-20 flex">
        <div className="h-full bg-red-600/20 w-full absolute inset-0" />
        <div 
          className="h-full bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)] transition-all duration-5000 ease-linear relative z-10"
          style={{ width: isActive ? "100%" : "0%" }}
        >
          <div className="absolute right-0 top-0 h-full w-8 bg-linear-to-r from-transparent to-white/40 blur-sm" />
        </div>
      </div>
    </div>
  );
});

export default PromotionSlideBody;
