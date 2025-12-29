import { memo } from "react";
import { ArrowRight, Grid3X3, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "../shared/section-header";
import { HeroTwoColLayout, HeroMediaFrame } from "../hero-layout-components";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

interface CategorySpotlightSlideProps {
  slide: HeroSlide & { type: "CATEGORY_SPOTLIGHT" };
  accentClasses: ReturnType<
    typeof import("@/lib/ui-tokens").getHeroAccentClasses
  >;
  isActive: boolean;
}

export const CategorySpotlightSlide = memo(function CategorySpotlightSlide({
  slide,
  accentClasses,
  isActive,
}: CategorySpotlightSlideProps) {
  const leftContent = (
    <>
      {/* Badge */}
      <div
        className={`inline-flex items-center w-fit gap-2 px-4 py-2 rounded-full ${accentClasses.badgeBg} ${accentClasses.badgeBorder} shadow-sm`}
      >
        <Grid3X3 className={`h-4 w-4 ${accentClasses.accent}`} />
        <span
          className={`text-sm font-semibold ${accentClasses.accentDark} font-[var(--font-inter)] tracking-wide`}
        >
          {slide.badgeText || "Category Spotlight"}
        </span>
      </div>

      {/* Headline */}
      <div className="space-y-4">
        <SectionTitle
          variant="hero"
          italic={slide.headline}
          bold={slide.highlight || ""}
        />
        <p className="text-[clamp(1rem,2.5vw,1.25rem)] text-gray-600 max-w-lg font-[var(--font-inter)] leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* Category Bullets */}
      <div className="space-y-3">
        {(slide.categoryBullets || []).map((bullet, index) => (
          <div key={index} className="flex items-start gap-3">
            <div
              className={`w-2 h-2 ${accentClasses.accent.replace(
                "text-",
                "bg-"
              )} rounded-full mt-2 flex-shrink-0`}
            ></div>
            <span className="text-gray-700 font-[var(--font-inter)]">
              {bullet}
            </span>
          </div>
        ))}
      </div>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
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
      <div className="flex flex-wrap items-center gap-4 sm:gap-6 lg:gap-8">
        <div
          className={`flex items-center gap-3 px-3 py-2 ${accentClasses.bgSolid} rounded-lg ${accentClasses.borderLight}`}
        >
          <Award className={`h-4 w-4 ${accentClasses.accent}`} />
          <span className="text-sm text-gray-700 font-[var(--font-inter)]">
            Expert Curated
          </span>
        </div>
        <div
          className={`flex items-center gap-3 px-3 py-2 ${accentClasses.bgSolid} rounded-lg ${accentClasses.borderLight}`}
        >
          <div
            className={`w-2 h-2 ${accentClasses.accent.replace(
              "text-",
              "bg-"
            )} rounded-full`}
          ></div>
          <span className="text-sm text-gray-700 font-[var(--font-inter)]">
            Fast Delivery
          </span>
        </div>
      </div>
    </>
  );

  const rightContent = <HeroMediaFrame slide={slide} isActive={isActive} />;

  return (
    <HeroTwoColLayout>
      {leftContent}
      {rightContent}
    </HeroTwoColLayout>
  );
});
