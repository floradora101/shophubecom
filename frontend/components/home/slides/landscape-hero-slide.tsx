import { memo } from "react";
import { ArrowRight, Sparkles, Shield } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { SectionTitle } from "../shared/section-header";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

interface LandscapeHeroSlideProps {
  slide: HeroSlide & { type: "LANDSCAPE_HERO" };
  accentClasses: ReturnType<
    typeof import("@/lib/ui-tokens").getHeroAccentClasses
  >;
  isActive: boolean;
}

export const LandscapeHeroSlide = memo(function LandscapeHeroSlide({
  slide,
  accentClasses,
  isActive,
}: LandscapeHeroSlideProps) {
  const textPosition = slide.textPosition || "center";
  const overlayOpacity = slide.overlayOpacity ?? 0.4;

  const positionClasses = {
    left: "justify-start text-left",
    center: "justify-center text-center",
    right: "justify-end text-right",
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Background Image */}
      {slide.media.kind === "image" && slide.media.imageUrl && (
        <Image
          src={slide.media.imageUrl}
          alt={slide.media.alt || ""}
          fill
          className="object-cover"
          sizes="100vw"
          priority={isActive}
        />
      )}

      {/* Dark Overlay */}
      <div
        className="absolute inset-0 bg-black"
        style={{ backgroundColor: `rgba(0, 0, 0, ${overlayOpacity})` }}
      />

      {/* Content Overlay */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <Container className="w-full h-full flex items-center justify-center">
          <div
            className={`flex flex-col ${positionClasses[textPosition]} space-y-5 px-5 py-6 lg:px-14 lg:py-10 max-w-4xl mx-auto w-full`}
          >
            {/* Badge */}
            {slide.badgeText && (
              <div
                className={`inline-flex items-center w-fit gap-2 px-4 py-2 rounded-full bg-white shadow-lg border border-white/30 ${
                  textPosition === "center" ? "mx-auto" : ""
                }`}
              >
                <Sparkles className="h-4 w-4 text-gray-700" />
                <span className="text-sm font-semibold text-gray-800 tracking-wide">
                  {slide.badgeText}
                </span>
              </div>
            )}

            {/* Headline and Content */}
            <div className="space-y-6">
              {/* Subtitle */}
              {slide.subtitle && (
                <p className="text-[clamp(1.125rem,3vw,1.5rem)] text-white/90 font-[var(--font-inter)] max-w-2xl">
                  {slide.subtitle}
                </p>
              )}

              {/* Main Headline */}
              <SectionTitle
                variant="hero"
                italic={slide.headline}
                bold={slide.highlight || ""}
                className="text-white"
              />

              {/* Description */}
              <p className="text-[clamp(1rem,2.5vw,1.25rem)] text-white/90 max-w-2xl font-[var(--font-inter)] leading-relaxed">
                {slide.description}
              </p>
            </div>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row gap-4 ${
                textPosition === "center"
                  ? "justify-center"
                  : textPosition === "right"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <Link href={slide.ctaPrimary.href}>
                <Button className="group w-full sm:w-auto">
                  <span className="flex items-center gap-2">
                    {slide.ctaPrimary.label}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              </Link>
              {slide.ctaSecondary && (
                <Link href={slide.ctaSecondary.href}>
                  <Button variant="outline" className="w-full sm:w-auto">
                    {slide.ctaSecondary.label}
                  </Button>
                </Link>
              )}
            </div>

            {/* Trust Signals */}
            <div
              className={`flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8 ${
                textPosition === "center"
                  ? "justify-center"
                  : textPosition === "right"
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg border border-white/20">
                <Shield className="h-4 w-4 text-white" />
                <span className="text-sm text-white font-[var(--font-inter)]">
                  Premium Quality
                </span>
              </div>
              <div className="flex items-center gap-3 px-3 py-2 bg-white/10 rounded-lg border border-white/20">
                <div className="w-2 h-2 bg-white rounded-full"></div>
                <span className="text-sm text-white font-[var(--font-inter)]">
                  Fast Shipping
                </span>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </div>
  );
});
