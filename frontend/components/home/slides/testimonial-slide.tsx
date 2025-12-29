import { memo } from "react";
import { ArrowRight, Users, Star, Award } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "../shared/section-header";
import { HeroTwoColLayout, HeroMediaFrame } from "../hero-layout-components";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

interface TestimonialSlideProps {
  slide: HeroSlide & { type: "TESTIMONIAL" };
  accentClasses: ReturnType<
    typeof import("@/lib/ui-tokens").getHeroAccentClasses
  >;
  isActive: boolean;
}

export const TestimonialSlide = memo(function TestimonialSlide({
  slide,
  accentClasses,
  isActive,
}: TestimonialSlideProps) {
  const leftContent = (
    <>
      {/* Badge */}
      <div
        className={`inline-flex items-center w-fit gap-2 px-4 py-2 rounded-full ${accentClasses.badgeBg} ${accentClasses.badgeBorder} shadow-sm`}
      >
        <Users className={`h-4 w-4 ${accentClasses.accent}`} />
        <span
          className={`text-sm font-semibold ${accentClasses.accentDark} font-[var(--font-inter)] tracking-wide`}
        >
          {slide.badgeText || "Customer Stories"}
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

      {/* Testimonial Quote */}
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="text-5xl text-gray-300 leading-none mb-3">&ldquo;</div>
        <blockquote className="text-base text-gray-700 font-[var(--font-inter)] italic leading-relaxed mb-3">
          {slide.quote}
        </blockquote>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-bold text-gray-600">
                {slide.authorName.charAt(0)}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-800">
                {slide.authorName}
              </div>
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < slide.rating
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="text-sm text-gray-600 ml-1">
                  {slide.rating}/5
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      {slide.stats && slide.stats.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {slide.stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div
                className={`text-lg font-bold ${accentClasses.accent} font-[var(--font-dm-sans)]`}
              >
                {stat.value}
              </div>
              <div className="text-xs text-gray-600 font-[var(--font-inter)]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      )}

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
            Trusted Reviews
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
            Verified Buyers
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
