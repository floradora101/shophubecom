import { memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { contentClamp } from "../shared/slide-layout";
import type { LandscapeImageSlide } from "@/lib/types/heroSlides.types";

/**
 * Landscape Hero Slide Body
 *
 * Renders a full-frame landscape image with overlay text and buttons.
 * This slide type is optimized for landscape images and only supports image media with buttons.
 */
interface LandscapeHeroSlideBodyProps {
  slide: LandscapeImageSlide;
  isActive: boolean;
}

export const LandscapeHeroSlideBody = memo(function LandscapeHeroSlideBody({
  slide,
  isActive,
}: LandscapeHeroSlideBodyProps) {
  try {
    const textPosition = slide.textPosition || "center";
    const overlayOpacity = slide.overlayOpacity || 0.3;

    return (
      <div
        className="relative w-full h-full overflow-hidden"
        style={{ minHeight: "var(--hero-h, 600px)" }}
      >
        {/* Background: gradient fallback - ensures component renders */}
        <div
          className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900"
          aria-hidden="true"
        >
          Background
        </div>

        {/* Full-frame landscape background image */}
        <img
          src={slide.media.imageUrl}
          alt={slide.media.alt || ""}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ zIndex: 1, minHeight: "100%" }}
        />

        {/* Dark overlay scrim for text readability */}
        <div className="absolute inset-0 bg-black/40" style={{ zIndex: 2 }} />

        {/* Content overlay */}
        <div
          className="absolute inset-0 flex items-center justify-center px-8 py-16"
          style={{ zIndex: 10 }}
        >
          <div className="max-w-2xl space-y-6 text-center">
            {/* Content background for better readability */}
            <div className="bg-black/60 backdrop-blur-sm rounded-2xl p-8 space-y-6">
              {/* Badge */}
              {slide.badgeText && (
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-full">
                  <span>{slide.badgeText}</span>
                </div>
              )}

              {/* Subtitle */}
              {slide.subtitle && (
                <p className="text-lg font-medium leading-relaxed text-white/90">
                  {slide.subtitle}
                </p>
              )}

              {/* Headline */}
              <div className="space-y-3">
                <h1
                  className={`text-4xl lg:text-6xl font-black leading-tight ${contentClamp.headline} text-white`}
                >
                  {slide.headline}
                </h1>
                {slide.highlight && (
                  <h2 className="text-3xl lg:text-4xl font-bold text-white">
                    {slide.highlight}
                  </h2>
                )}
                <p
                  className={`text-lg lg:text-xl leading-relaxed ${contentClamp.description} text-white/90`}
                >
                  {slide.description}
                </p>
              </div>
              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {slide.ctaPrimary && (
                  <Button
                    asChild
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold"
                  >
                    <a href={slide.ctaPrimary.href}>{slide.ctaPrimary.label}</a>
                  </Button>
                )}
                {slide.ctaSecondary && (
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="px-8 py-4 text-lg font-semibold border-white text-white hover:bg-white hover:text-black"
                  >
                    <a href={slide.ctaSecondary.href}>
                      {slide.ctaSecondary.label}
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("LandscapeHeroSlideBody render error:", error);
    return (
      <div className="w-full h-full bg-red-500 flex items-center justify-center text-white text-2xl">
        COMPONENT ERROR: {slide.id}
      </div>
    );
  }
});
