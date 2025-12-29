import { memo } from "react";
import { ArrowRight, Sparkles, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { Badge } from "@/components/ui/badge";
import { SectionTitle } from "../shared/section-header";
import { HeroTwoColLayout, HeroMediaFrame } from "../hero-layout-components";
import { useHeroPricing } from "@/lib/hooks/use-hero-pricing";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

interface ProductSpotlightSlideProps {
  slide: HeroSlide & { type: "PRODUCT_SPOTLIGHT" };
  product?: Product;
  accentClasses: ReturnType<
    typeof import("@/lib/ui-tokens").getHeroAccentClasses
  >;
  isActive: boolean;
}

export const ProductSpotlightSlide = memo(function ProductSpotlightSlide({
  slide,
  product,
  accentClasses,
  isActive,
}: ProductSpotlightSlideProps) {
  // Use professional pricing hook
  const pricing = useHeroPricing(product);
  const {
    currentPrice,
    originalPrice,
    discountPercent,
    hasDiscount,
    isLimitedTime,
  } = pricing;

  const leftContent = (
    <>
      {/* Badge */}
      <div
        className={`inline-flex items-center w-fit gap-2 px-4 py-2 rounded-full ${accentClasses.badgeBg} ${accentClasses.badgeBorder} shadow-sm`}
      >
        <Sparkles className={`h-4 w-4 ${accentClasses.accent}`} />
        <span
          className={`text-sm font-semibold ${accentClasses.accentDark} font-[var(--font-inter)] tracking-wide`}
        >
          {slide.badgeText || "Premium Product"}
        </span>
      </div>

      {/* Headline */}
      <div className="space-y-4">
        <SectionTitle
          variant="hero"
          italic={slide.headline}
          bold={slide.highlight || ""}
        />

        {/* Product Name */}
        {product && (
          <div className="space-y-2">
            <h2 className="text-[clamp(1.25rem,3vw,1.75rem)] font-bold text-gray-900 leading-tight">
              {product.name}
            </h2>
          </div>
        )}

        <p className="text-[clamp(1rem,2.5vw,1.25rem)] text-gray-600 max-w-lg font-[var(--font-inter)] leading-relaxed">
          {slide.description}
        </p>
      </div>

      {/* Product-specific content */}
      {product && (
        <div className="space-y-8">
          {/* Premium Pricing Section */}
          <div className="space-y-6">
            {/* Limited Time Indicator */}
            {hasDiscount && isLimitedTime && (
              <div className="flex justify-center">
                <Badge
                  variant="warning"
                  size="sm"
                  className="px-4 py-2 text-sm"
                >
                  <Clock className="h-4 w-4 mr-2" />
                  Limited Time Deal
                </Badge>
              </div>
            )}

            {/* Clean Pricing Display */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-white/40 shadow-sm">
              {/* Main Price Display */}
              <div className="text-center mb-2">
                <div className="text-[clamp(1.75rem,4vw,2.5rem)] font-black text-gray-900 leading-none">
                  <Price amount={currentPrice} size="lg" />
                </div>
              </div>

              {/* Discount Information */}
              {hasDiscount && originalPrice && (
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div className="relative text-base text-gray-500 font-medium">
                    <Price amount={originalPrice} />
                    <div className="absolute inset-0 top-1/2 transform -translate-y-1/2 w-full h-0.5 bg-gray-500"></div>
                  </div>
                  <div
                    className={`inline-flex items-center px-2 py-1 ${accentClasses.bgSolid} rounded-full ${accentClasses.borderLight} shadow-sm`}
                  >
                    <span
                      className={`text-xs font-bold ${accentClasses.accentDark} tracking-wide`}
                    >
                      SAVE {discountPercent}%
                    </span>
                  </div>
                </div>
              )}

              {/* Variant Options Preview */}
              {product.variants && product.variants.length > 1 && (
                <div className="border-t border-gray-200 pt-2">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 text-center">
                    Options
                  </div>

                  {/* Color Variants */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="mb-1.5">
                      <div className="flex justify-center gap-1 flex-wrap">
                        {product.colors.slice(0, 5).map((color, index) => (
                          <div
                            key={color}
                            className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color.toLowerCase() }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Storage Options */}
                  {product.variants.some((v) => v.options?.storage) && (
                    <div className="mb-1.5">
                      <div className="flex justify-center gap-1 flex-wrap">
                        {Array.from(
                          new Set(
                            product.variants
                              .map((v) => v.options?.storage)
                              .filter(Boolean)
                          )
                        )
                          .slice(0, 4)
                          .map((storage) => (
                            <div
                              key={storage}
                              className="px-1.5 py-0.5 bg-gray-50 rounded text-xs font-medium text-gray-700 border border-gray-200"
                            >
                              {storage}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Price Range Indicator */}
                  {product.minPrice &&
                    product.maxPrice &&
                    product.minPrice !== product.maxPrice && (
                      <div className="text-center">
                        <div className="text-xs text-gray-500">
                          <Price amount={product.minPrice} /> -{" "}
                          <Price amount={product.maxPrice} />
                        </div>
                      </div>
                    )}
                </div>
              )}

              {/* Key Specs Preview */}
              {product.specs && product.specs.length > 0 && (
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="grid grid-cols-1 gap-1">
                    {product.specs.slice(0, 2).map((spec, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center text-sm"
                      >
                        <span className="text-gray-600 font-medium">
                          {spec.label}:
                        </span>
                        <span className="text-gray-900">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
        <Link href={slide.ctaPrimary.href}>
          <Button className="group w-auto">
            <span className="flex items-center gap-2">
              {slide.ctaPrimary.label}
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </Button>
        </Link>
        {slide.ctaSecondary && (
          <Link href={slide.ctaSecondary.href}>
            <Button variant="outline" className="w-auto">
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
            2-Year Warranty
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
            Free Shipping
          </span>
        </div>
      </div>
    </>
  );

  const rightContent = (
    <HeroMediaFrame
      slide={slide}
      product={product}
      isActive={isActive}
      floatingBadge={
        <div
          className={`bg-white ${accentClasses.accentDark} px-3 py-2 rounded-xl text-xs font-bold shadow-xl ${accentClasses.borderLight} flex items-center gap-2`}
        >
          <div
            className={`w-2 h-2 ${accentClasses.accent.replace(
              "text-",
              "bg-"
            )} rounded-full`}
          ></div>
          <span>FEATURED</span>
        </div>
      }
    />
  );

  return (
    <HeroTwoColLayout>
      {leftContent}
      {rightContent}
    </HeroTwoColLayout>
  );
});
