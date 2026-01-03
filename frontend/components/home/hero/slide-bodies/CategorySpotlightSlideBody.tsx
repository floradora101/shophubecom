import { memo } from "react";
import { Grid3X3, Trophy } from "lucide-react";
import { HeroCTAs } from "../../shared/hero-ctas";
import { HeroTrustRow } from "../../shared/hero-trust-row";
import { HeroMediaFrame } from "../shared/hero-media-frame";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

interface CategorySpotlightSlideBodyProps {
  slide: HeroSlide & { type: "CATEGORY_SPOTLIGHT" };
  isActive: boolean;
  index: number;
}

export const CategorySpotlightSlideBody = memo(
  function CategorySpotlightSlideBody({
    slide,
    isActive,
    index,
  }: CategorySpotlightSlideBodyProps) {
    return (
      <SlideLayout
        textContent={
          <>
            {/* Badge */}
            <div className="hero-badge inline-flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              <span>{slide.badgeText || "Category Spotlight"}</span>
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

            {/* Category Bullets - Max 3 */}
            <div className="space-y-2">
              {(slide.categoryBullets || [])
                .slice(0, 3)
                .map((bullet, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div
                      className="w-2 h-2 rounded-full mt-2 shrink-0"
                      style={{ backgroundColor: "var(--hero-accent)" }}
                    />
                    <span
                      className={`text-sm sm:text-base leading-relaxed ${contentClamp.bullet}`}
                      style={{ color: "var(--hero-text)" }}
                    >
                      {bullet}
                    </span>
                  </div>
                ))}
            </div>

            {/* CTAs */}
            <HeroCTAs
              primary={slide.ctaPrimary}
              secondary={slide.ctaSecondary}
            />

            {/* Trust Signals */}
            <HeroTrustRow
              items={[
                { icon: Trophy, text: "Expert Curated" },
                { text: "Fast Delivery", useDot: true },
              ]}
            />
          </>
        }
        mediaContent={<HeroMediaFrame slide={slide} isActive={isActive} />}
      />
    );
  }
);
