import { memo, useMemo } from "react";
import { ArrowRight, Clock, Tag, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SectionTitle } from "../shared/section-header";
import { HeroTwoColLayout, HeroMediaFrame } from "../hero-layout-components";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

interface OfferSlideProps {
  slide: HeroSlide & { type: "OFFER" };
  accentClasses: ReturnType<
    typeof import("@/lib/ui-tokens").getHeroAccentClasses
  >;
  isActive: boolean;
}

export const OfferSlide = memo(function OfferSlide({
  slide,
  accentClasses,
  isActive,
}: OfferSlideProps) {
  const daysLeft = useMemo(() => {
    const timeLeft =
      new Date(slide.offerEndsAt).getTime() - new Date().getTime();
    return Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
  }, [slide.offerEndsAt]);

  const leftContent = (
    <>
      {/* Badge */}
      <div
        className={`inline-flex items-center w-fit gap-2 px-4 py-2 rounded-full ${accentClasses.bgGradient} shadow-lg ${accentClasses.border}`}
      >
        <Clock className={`h-4 w-4 ${accentClasses.accentDark}`} />
        <span
          className={`text-sm font-bold ${accentClasses.accentDark} font-[var(--font-inter)] tracking-wide`}
        >
          {slide.badgeText || "Limited Time"}
        </span>
      </div>

      {/* Headline with Offer Label */}
      <div className="space-y-4">
        <div
          className={`inline-block px-6 py-3 rounded-2xl ${accentClasses.bgGradient} border-2 ${accentClasses.border} shadow-xl text-[clamp(2.25rem,8vw,3.75rem)] font-bold ${accentClasses.accentDark} font-[var(--font-dm-sans)] tracking-tight`}
        >
          {slide.offerLabel}
        </div>
        <SectionTitle
          variant="hero"
          italic={slide.headline}
          bold={slide.highlight || ""}
        />
        <p className="text-[clamp(1rem,2.5vw,1.25rem)] text-gray-600 max-w-lg font-[var(--font-inter)] leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* Offer Details */}
      <div className="space-y-4">
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <div className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray-200">
            <Clock className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-semibold text-gray-700">
              {daysLeft > 0 ? `${daysLeft} days left` : "Ending soon"}
            </span>
          </div>
          {slide.promoCode && (
            <div
              className={`flex items-center gap-2 px-4 py-3 ${accentClasses.bgGradient} rounded-xl ${accentClasses.borderLight}`}
            >
              <Tag className={`h-4 w-4 ${accentClasses.accent}`} />
              <span
                className={`text-sm font-bold ${accentClasses.accentDark} tracking-wider`}
              >
                {slide.promoCode}
              </span>
            </div>
          )}
        </div>
        <div className="text-center">
          <p className="text-sm text-gray-600 font-[var(--font-inter)] max-w-md mx-auto leading-relaxed">
            Don&apos;t miss out on this exclusive offer! Limited time only - use
            code at checkout.
          </p>
        </div>
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
          <Shield className={`h-4 w-4 ${accentClasses.accent}`} />
          <span className="text-sm text-gray-700 font-[var(--font-inter)]">
            Secure Checkout
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
            Free Returns
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
