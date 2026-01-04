import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { LandscapeImageSlide } from "@/lib/types/heroSlides.types";

/**
 * Landscape Hero Slide Body
 *
 * Renders a full-frame landscape image with overlay buttons only.
 * This slide type is optimized for landscape images and displays only CTA buttons.
 */
interface LandscapeHeroSlideBodyProps {
  slide: LandscapeImageSlide;
  isActive: boolean;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const LandscapeHeroSlideBody = memo(function LandscapeHeroSlideBody({
  slide,
  isActive,
  onMouseEnter,
  onMouseLeave,
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

        {/* Buttons overlay - bottom center */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-4"
          style={{ zIndex: 10 }}
        >
          {slide.ctaPrimary && (
            <Button
              asChild
              size="lg"
              className="px-8 py-4 text-lg font-semibold"
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
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
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
            >
              <a href={slide.ctaSecondary.href}>{slide.ctaSecondary.label}</a>
            </Button>
          )}
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
