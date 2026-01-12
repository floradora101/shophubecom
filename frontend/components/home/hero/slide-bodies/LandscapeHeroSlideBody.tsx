"use client";

import { memo } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { LandscapeImageSlide } from "@/lib/types/heroSlides.types";
import { getLandscapeTheme } from "@/lib/utils/landscape-style-resolver";
import { HeroItem } from "../shared/hero-item";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";
import { cn } from "@/lib/utils";

/**
 * Landscape Hero Slide Body (2026 Edition)
 *
 * A professionally refactored landscape slide component focused on Red & White aesthetics,
 * glassmorphism, and theme-based packages.
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
  const theme = getLandscapeTheme(slide.theme);
  const { run, animationKey } = useHeroRunCounter(isActive || false);

  // Determine object position for image
  const objectPosition = slide.media.position || "center";

  return (
    <div className="relative w-full h-full overflow-hidden group">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 bg-gray-900">
        <Image
          src={slide.media.imageUrl}
          alt={slide.media.alt || ""}
          fill
          className="object-cover transition-transform duration-[2000ms] group-hover:scale-110"
          style={{
            objectPosition:
              objectPosition !== "center" ? objectPosition : undefined,
          }}
          sizes="100vw"
          priority={isActive}
        />
        {/* Theme-defined Overlay */}
        <div
          className={cn(
            "absolute inset-0 z-10 transition-opacity duration-700",
            theme.overlay
          )}
        />
      </div>

      {/* Content Layer */}
      <div className="relative z-20 w-full h-full flex flex-col justify-center px-6 md:px-12 lg:px-24 xl:px-32">
        <div className={cn("transition-all duration-500", theme.container)}>
          {/* Badge */}
          {slide.content.badge && (
            <HeroItem run={run} animationKey={animationKey}>
              <div
                className={cn(
                  "hero-item-enter hero-badge inline-block",
                  theme.badge
                )}
              >
                {slide.content.badge}
              </div>
            </HeroItem>
          )}

          {/* Headline & Highlight */}
          <HeroItem run={run} animationKey={animationKey}>
            <h1 className="hero-item-enter hero-headline flex flex-col gap-1 md:gap-2 mb-4 md:mb-6">
              <span className={cn("tracking-tighter", theme.headline)}>
                {slide.content.headline}
              </span>
              <span className={cn("tracking-tight", theme.highlight)}>
                {slide.content.highlight}
              </span>
            </h1>
          </HeroItem>

          {/* Description */}
          {slide.content.description && (
            <HeroItem run={run} animationKey={animationKey}>
              <p
                className={cn(
                  "hero-item-enter hero-description leading-relaxed",
                  theme.description
                )}
              >
                {slide.content.description}
              </p>
            </HeroItem>
          )}

          {/* Action Button */}
          {slide.actionButton && (
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-buttons mt-4 sm:mt-8">
                <Button
                  asChild
                  size="hero"
                  className={cn(
                    "transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl",
                    theme.button
                  )}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                >
                  <a href={slide.actionButton.href}>
                    {slide.actionButton.label}
                  </a>
                </Button>
              </div>
            </HeroItem>
          )}
        </div>
      </div>

      {/* Bottom Glass Glow (Decorative) */}
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black/20 to-transparent z-15 pointer-events-none" />
    </div>
  );
});

export default LandscapeHeroSlideBody;
