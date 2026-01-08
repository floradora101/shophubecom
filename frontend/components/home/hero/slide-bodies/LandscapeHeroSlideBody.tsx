"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import type { LandscapeImageSlide } from "@/lib/types/heroSlides.types";
import { getLandscapeTextClasses } from "@/lib/utils/landscape-style-resolver";
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
  isActive?: boolean;
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

  // Animation run counter - increments when slide becomes active
  const { run, animationKey } = useHeroRunCounter(isActive || false);

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
      {/* Dark gray background */}
      <div className="absolute inset-0 bg-gray-900" />

      {/* Full-frame landscape background image */}
      <img
        src={slide.media.imageUrl}
        alt={slide.media.alt || ""}
        className="absolute inset-0 w-full h-full object-contain md:object-cover object-center md:object-top"
        style={{
          zIndex: 1,
          minHeight: "100%",
          objectPosition:
            objectPosition !== "center" ? objectPosition : undefined,
        }}
        loading={isActive ? "eager" : "lazy"}
        fetchPriority={isActive ? "high" : "auto"}
        decoding="async"
      />

      {/* Optional text content overlay */}
      {hasTextContent && (
        <div
          className="absolute inset-0 grid place-items-center px-4 py-8 sm:px-6 sm:py-12 md:px-12 md:py-16"
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
                  <h1 className="hero-item-enter hero-headline">
                    {content.headline && (
                      <span
                        className={textClasses.headline}
                        data-text={content.headline}
                      >
                        {content.headline}
                      </span>
                    )}
                    {content.headline && content.highlight && " "}
                    {content.highlight && (
                      <span
                        className={`${textClasses.highlight} ml-2`}
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
                      className="w-full min-h-[48px] px-6 py-3 text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
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
                      className="w-full min-h-[48px] px-6 py-3 text-base font-semibold border-white text-white hover:bg-white hover:text-black transition-all duration-300 hover:scale-[1.02] hover:shadow-lg active:scale-95 sm:w-auto sm:px-8 sm:py-4 sm:text-lg"
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
