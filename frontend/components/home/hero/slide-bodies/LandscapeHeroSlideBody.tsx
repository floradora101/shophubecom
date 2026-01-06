import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { LandscapeImageSlide } from "@/lib/types/heroSlides.types";
import {
  getLandscapeTextClasses,
  getLandscapeOverlayClasses,
} from "@/lib/utils/landscape-style-resolver";
import { HeroItem } from "../shared/hero-item";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";

/**
 * Landscape Hero Slide Body
 *
 * Renders a full-frame landscape image with optional text content and overlay buttons.
 * Supports structured text styling variants and maintains backward compatibility.
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
  // Get text classes from resolver
  const textClasses = getLandscapeTextClasses(slide.textStyle);

  // Get overlay classes and styles
  const overlayClasses = getLandscapeOverlayClasses(slide.overlay);

  // Animation run counter - increments when slide becomes active
  const { run, animationKey } = useHeroRunCounter(isActive);

  // Determine content to display (new structured content takes precedence, fallback to legacy fields)
  const content = slide.content || {
    badgeText: slide.badgeText,
    subtitle: slide.subtitle,
    headline: slide.headline,
    highlight: slide.highlight,
    description: slide.description,
  };

  // Check if we should render text content
  const hasTextContent =
    content.badgeText ||
    content.subtitle ||
    content.headline ||
    content.highlight ||
    content.description;

  // Determine object position for image
  const objectPosition = slide.media.position || "center";

  return (
    <div
      className="relative w-full h-full overflow-hidden"
      style={
        {
          minHeight: "var(--hero-h, 600px)",
          "--hero-landscape-accent": "var(--primary-600)",
        } as React.CSSProperties
      }
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
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          zIndex: 1,
          minHeight: "100%",
          objectPosition,
        }}
        loading={isActive ? "eager" : "lazy"}
        fetchPriority={isActive ? "high" : "auto"}
      />

      {/* Overlay scrim for text readability */}
      <div
        className={`absolute inset-0 ${overlayClasses.className}`}
        style={{
          zIndex: 2,
          ...overlayClasses.style,
        }}
      />

      {/* Optional text content overlay */}
      {hasTextContent && (
        <div
          className="absolute inset-0 grid place-items-center px-6 py-12 md:px-12 md:py-16"
          style={{ zIndex: 5 }}
        >
          <div className={textClasses.wrapper}>
            <div className={textClasses.container}>
              {/* Badge */}
              {content.badgeText && (
                <HeroItem run={run} animationKey={animationKey}>
                  <div
                    className={`${textClasses.badge} hero-item-enter hero-badge`}
                  >
                    {content.badgeText}
                  </div>
                </HeroItem>
              )}

              {/* Subtitle */}
              {content.subtitle && (
                <HeroItem run={run} animationKey={animationKey}>
                  <div
                    className={`${textClasses.subtitle} hero-item-enter hero-subtitle`}
                  >
                    {content.subtitle}
                  </div>
                </HeroItem>
              )}

              {/* Headline and Highlight */}
              {(content.headline || content.highlight) && (
                <HeroItem run={run} animationKey={animationKey}>
                  <h1
                    className={`${textClasses.headline} hero-item-enter hero-headline`}
                  >
                    {content.headline && (
                      <span data-text={content.headline}>
                        {content.headline}
                      </span>
                    )}
                    {content.highlight && (
                      <span
                        className={textClasses.highlight}
                        data-text={content.highlight}
                      >
                        {content.highlight}
                      </span>
                    )}
                  </h1>
                </HeroItem>
              )}

              {/* Description */}
              {content.description && (
                <HeroItem run={run} animationKey={animationKey}>
                  <p
                    className={`${textClasses.description} hero-item-enter hero-description`}
                  >
                    {content.description}
                  </p>
                </HeroItem>
              )}

              {/* CTA Buttons */}
              <HeroItem run={run} animationKey={animationKey}>
                <div
                  className={`${textClasses.buttons} hero-item-enter hero-buttons`}
                >
                  {slide.ctaPrimary && (
                    <Button
                      asChild
                      size="lg"
                      className="px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                      onMouseEnter={onMouseEnter}
                      onMouseLeave={onMouseLeave}
                    >
                      <a href={slide.ctaPrimary.href}>
                        {slide.ctaPrimary.label}
                      </a>
                    </Button>
                  )}
                  {slide.ctaSecondary && (
                    <Button
                      asChild
                      variant="outline"
                      size="lg"
                      className="px-8 py-4 text-lg font-semibold border-white text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
                      onMouseEnter={onMouseEnter}
                      onMouseLeave={onMouseLeave}
                    >
                      <a href={slide.ctaSecondary.href}>
                        {slide.ctaSecondary.label}
                      </a>
                    </Button>
                  )}
                </div>
              </HeroItem>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
