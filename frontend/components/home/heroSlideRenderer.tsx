import { useMemo, memo } from "react";
import {
  ArrowRight,
  Star,
  Clock,
  Tag,
  Users,
  Award,
  Shield,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Price } from "@/components/ui/price";
import { SectionTitle } from "./shared/section-header";
import { getProductImageWithPlaceholder } from "@/lib/utils";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";

interface HeroSlideRendererProps {
  slide: HeroSlide;
  product?: Product; // Optional product data if slide references one
  isActive?: boolean; // Whether this slide is currently active/visible
}

export function HeroSlideRenderer({
  slide,
  product,
  isActive = false,
}: HeroSlideRendererProps) {
  const accentClasses = useMemo(() => {
    const token = slide.theme?.accentToken;
    return {
      color:
        token === "blue"
          ? "text-blue-600"
          : token === "green"
          ? "text-green-600"
          : "text-primary-600",
      bg:
        token === "blue"
          ? "from-blue-50 to-blue-100/50"
          : token === "green"
          ? "from-green-50 to-green-100/50"
          : "from-primary-50 to-primary-100/50",
      border:
        token === "blue"
          ? "border-blue-200/50"
          : token === "green"
          ? "border-green-200/50"
          : "border-primary-200/50",
    };
  }, [slide.theme?.accentToken]);

  const {
    color: accentColorClass,
    bg: accentBgClass,
    border: accentBorderClass,
  } = accentClasses;

  switch (slide.type) {
    case "PRODUCT_SPOTLIGHT":
      return (
        <ProductSpotlightSlide
          slide={slide}
          product={product}
          accentColorClass={accentColorClass}
          accentBgClass={accentBgClass}
          accentBorderClass={accentBorderClass}
          isActive={isActive}
        />
      );

    case "CATEGORY_SPOTLIGHT":
      return (
        <CategorySpotlightSlide
          slide={slide}
          accentColorClass={accentColorClass}
          accentBgClass={accentBgClass}
          accentBorderClass={accentBorderClass}
          isActive={isActive}
        />
      );

    case "OFFER":
      return (
        <OfferSlide
          slide={slide}
          accentColorClass={accentColorClass}
          accentBgClass={accentBgClass}
          accentBorderClass={accentBorderClass}
          isActive={isActive}
        />
      );

    case "TESTIMONIAL":
      return (
        <TestimonialSlide
          slide={slide}
          accentColorClass={accentColorClass}
          accentBgClass={accentBgClass}
          accentBorderClass={accentBorderClass}
          isActive={isActive}
        />
      );

    default:
      return null;
  }
}

const ProductSpotlightSlide = memo(function ProductSpotlightSlide({
  slide,
  product,
  accentColorClass,
  accentBgClass,
  accentBorderClass,
  isActive,
}: {
  slide: HeroSlide & { type: "PRODUCT_SPOTLIGHT" };
  product?: Product;
  accentColorClass: string;
  accentBgClass: string;
  accentBorderClass: string;
  isActive: boolean;
}) {
  // Calculate discount info if product is available
  const discountInfo = useMemo(() => {
    if (!product) {
      return {
        discountPercent: 0,
        originalPrice: undefined,
        hasDiscount: false,
      };
    }

    const discountPercent =
      product.discount?.discountPercent || product.discountValue || 0;
    const originalPrice =
      product.discount?.originalPrice || product.originalPrice;
    const hasDiscount =
      !!originalPrice &&
      originalPrice > product.price &&
      (product.discount?.isOnSale ?? product.isOnSale ?? discountPercent > 0);

    return { discountPercent, originalPrice, hasDiscount };
  }, [product]);

  const { discountPercent, originalPrice, hasDiscount } = discountInfo;

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 xl:gap-20 px-6 sm:px-10 lg:px-14 py-8 sm:py-10">
      {/* Left: Hero Content */}
      <div className="flex flex-col justify-center space-y-8 min-w-0 order-1 lg:order-1 text-center lg:text-left">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r ${accentBgClass} rounded-full border ${accentBorderClass} backdrop-blur-sm`}
        >
          <div
            className={`w-2 h-2 ${accentColorClass.replace(
              "text-",
              "bg-"
            )} rounded-full animate-pulse shadow-sm`}
          ></div>
          <span className="text-sm text-slate-700 font-[var(--font-inter)] font-semibold tracking-wide">
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
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-lg font-[var(--font-inter)] font-light leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Product-specific content */}
        {product && (
          <div className="space-y-3">
            {hasDiscount && originalPrice && (
              <div className="text-sm text-slate-500 line-through">
                was <Price amount={originalPrice} />
              </div>
            )}
            <div className="relative inline-block">
              <div className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white text-lg font-bold rounded-xl shadow-lg">
                <Price amount={product.price} />
                {hasDiscount && discountPercent > 0 && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-bold shadow-md animate-pulse">
                    SAVE
                  </div>
                )}
              </div>
            </div>
            <div className="text-sm text-slate-600">
              {product.specs?.find(
                (spec) => spec.label === "Storage" || spec.label === "RAM"
              )?.value || "Premium Quality"}
            </div>
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
          <div className="flex items-center gap-3 px-3 py-2 bg-white/60 rounded-lg backdrop-blur-sm border border-white/20">
            <Shield className="h-4 w-4 text-primary-600" />
            <span className="text-sm text-slate-700 font-[var(--font-inter)] font-medium">
              2-Year Warranty
            </span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 bg-white/60 rounded-lg backdrop-blur-sm border border-white/20">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-slate-700 font-[var(--font-inter)] font-medium">
              Free Shipping
            </span>
          </div>
        </div>
      </div>

      {/* Right: Product Display */}
      <div className="w-full h-full flex items-center justify-center min-w-0 order-2 lg:order-2">
        <div className="relative w-full max-w-[560px] aspect-[4/3] sm:aspect-square group">
          {/* Product Image Container */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-200/30 via-white/20 to-slate-300/30 backdrop-blur-sm shadow-xl">
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/60 via-slate-50/40 to-white/60 backdrop-blur-md shadow-lg border border-white/40 overflow-hidden">
              {slide.media.kind === "product" && product ? (
                <Image
                  src={getProductImageWithPlaceholder(product)}
                  alt={slide.media.alt || product.name}
                  fill
                  className="object-contain sm:object-cover transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority={isActive}
                />
              ) : slide.media.kind === "image" && slide.media.imageUrl ? (
                <Image
                  src={slide.media.imageUrl}
                  alt={slide.media.alt || ""}
                  fill
                  className="object-contain sm:object-cover transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority={isActive}
                />
              ) : null}
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute top-4 right-4 z-30">
            <div className="bg-white/95 backdrop-blur-sm text-slate-800 px-3 py-2 rounded-xl text-xs font-bold shadow-xl border border-white/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span>FEATURED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const CategorySpotlightSlide = memo(function CategorySpotlightSlide({
  slide,
  accentColorClass,
  accentBgClass,
  accentBorderClass,
  isActive,
}: {
  slide: HeroSlide & { type: "CATEGORY_SPOTLIGHT" };
  accentColorClass: string;
  accentBgClass: string;
  accentBorderClass: string;
  isActive: boolean;
}) {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 xl:gap-20 px-6 sm:px-10 lg:px-14 py-8 sm:py-10">
      {/* Left: Hero Content */}
      <div className="flex flex-col justify-center space-y-8 min-w-0 order-1 lg:order-1 text-center lg:text-left">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r ${accentBgClass} rounded-full border ${accentBorderClass} backdrop-blur-sm`}
        >
          <div
            className={`w-2 h-2 ${accentColorClass.replace(
              "text-",
              "bg-"
            )} rounded-full animate-pulse shadow-sm`}
          ></div>
          <span className="text-sm text-slate-700 font-[var(--font-inter)] font-semibold tracking-wide">
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
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-lg font-[var(--font-inter)] font-light leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Category Bullets - Unique to Category Spotlight */}
        <div className="space-y-3">
          {(slide.categoryBullets || []).map((bullet, index) => (
            <div key={index} className="flex items-start gap-3">
              <div
                className={`w-2 h-2 ${accentColorClass.replace(
                  "text-",
                  "bg-"
                )} rounded-full mt-2 flex-shrink-0`}
              ></div>
              <span className="text-slate-700 font-[var(--font-inter)] font-medium">
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
          <div className="flex items-center gap-3 px-3 py-2 bg-white/60 rounded-lg backdrop-blur-sm border border-white/20">
            <Award className="h-4 w-4 text-primary-600" />
            <span className="text-sm text-slate-700 font-[var(--font-inter)] font-medium">
              Expert Curated
            </span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 bg-white/60 rounded-lg backdrop-blur-sm border border-white/20">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-slate-700 font-[var(--font-inter)] font-medium">
              Fast Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Right: Media Display */}
      <div className="w-full h-full flex items-center justify-center min-w-0 order-2 lg:order-2">
        <div className="relative w-full max-w-[560px] aspect-[4/3] sm:aspect-square group">
          {/* Media Image Container */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-200/30 via-white/20 to-slate-300/30 backdrop-blur-sm shadow-xl">
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/60 via-slate-50/40 to-white/60 backdrop-blur-md shadow-lg border border-white/40 overflow-hidden">
              {slide.media.kind === "image" && slide.media.imageUrl && (
                <Image
                  src={slide.media.imageUrl}
                  alt={slide.media.alt || ""}
                  fill
                  className="object-contain sm:object-cover transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority={isActive}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const OfferSlide = memo(function OfferSlide({
  slide,
  accentColorClass,
  accentBgClass,
  accentBorderClass,
  isActive,
}: {
  slide: HeroSlide & { type: "OFFER" };
  accentColorClass: string;
  accentBgClass: string;
  accentBorderClass: string;
  isActive: boolean;
}) {
  const daysLeft = useMemo(() => {
    const timeLeft =
      new Date(slide.offerEndsAt).getTime() - new Date().getTime();
    return Math.max(0, Math.floor(timeLeft / (1000 * 60 * 60 * 24)));
  }, [slide.offerEndsAt]);

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 xl:gap-20 px-6 sm:px-10 lg:px-14 py-8 sm:py-10">
      {/* Left: Hero Content */}
      <div className="flex flex-col justify-center space-y-8 min-w-0 order-1 lg:order-1 text-center lg:text-left">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r ${accentBgClass} rounded-full border ${accentBorderClass} backdrop-blur-sm`}
        >
          <Clock className={`h-4 w-4 ${accentColorClass}`} />
          <span className="text-sm text-slate-700 font-[var(--font-inter)] font-semibold tracking-wide">
            {slide.badgeText || "Limited Time"}
          </span>
        </div>

        {/* Headline with Offer Label */}
        <div className="space-y-4">
          <div
            className={`text-4xl sm:text-5xl lg:text-6xl font-bold ${accentColorClass} font-[var(--font-dm-sans)] tracking-tight`}
          >
            {slide.offerLabel}
          </div>
          <SectionTitle
            variant="hero"
            italic={slide.headline}
            bold={slide.highlight || ""}
          />
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-lg font-[var(--font-inter)] font-light leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Offer Details - Unique to Offer slides */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="flex items-center gap-2 px-4 py-3 bg-white/80 rounded-xl border border-white/30">
              <Clock className="h-4 w-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">
                {daysLeft > 0 ? `${daysLeft} days left` : "Ending soon"}
              </span>
            </div>
            {slide.promoCode && (
              <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 rounded-xl border border-green-200/50">
                <Tag className="h-4 w-4 text-green-600" />
                <span className="text-sm font-bold text-green-700 tracking-wider">
                  {slide.promoCode}
                </span>
              </div>
            )}
          </div>
          <div className="text-center">
            <p className="text-sm text-slate-600 font-[var(--font-inter)] max-w-md mx-auto leading-relaxed">
              Don&apos;t miss out on this exclusive offer! Limited time only -
              use code at checkout.
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
          <div className="flex items-center gap-3 px-3 py-2 bg-white/60 rounded-lg backdrop-blur-sm border border-white/20">
            <Shield className="h-4 w-4 text-primary-600" />
            <span className="text-sm text-slate-700 font-[var(--font-inter)] font-medium">
              Secure Checkout
            </span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 bg-white/60 rounded-lg backdrop-blur-sm border border-white/20">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-slate-700 font-[var(--font-inter)] font-medium">
              Free Returns
            </span>
          </div>
        </div>
      </div>

      {/* Right: Media Display */}
      <div className="w-full h-full flex items-center justify-center min-w-0 order-2 lg:order-2">
        <div className="relative w-full max-w-[560px] aspect-[4/3] sm:aspect-square group">
          {/* Media Image Container */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-200/30 via-white/20 to-slate-300/30 backdrop-blur-sm shadow-xl">
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/60 via-slate-50/40 to-white/60 backdrop-blur-md shadow-lg border border-white/40 overflow-hidden">
              {slide.media.kind === "image" && slide.media.imageUrl && (
                <Image
                  src={slide.media.imageUrl}
                  alt={slide.media.alt || ""}
                  fill
                  className="object-contain sm:object-cover transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority={isActive}
                />
              )}
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute top-4 right-4 z-30">
            <div className="bg-white/95 backdrop-blur-sm text-slate-800 px-3 py-2 rounded-xl text-xs font-bold shadow-xl border border-white/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span>FEATURED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

const TestimonialSlide = memo(function TestimonialSlide({
  slide,
  accentColorClass,
  accentBgClass,
  accentBorderClass,
  isActive,
}: {
  slide: HeroSlide & { type: "TESTIMONIAL" };
  accentColorClass: string;
  accentBgClass: string;
  accentBorderClass: string;
  isActive: boolean;
}) {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-12 xl:gap-20 px-6 sm:px-10 lg:px-14 py-8 sm:py-10">
      {/* Left: Hero Content */}
      <div className="flex flex-col justify-center space-y-6 min-w-0 order-1 lg:order-1 text-center lg:text-left">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r ${accentBgClass} rounded-full border ${accentBorderClass} backdrop-blur-sm`}
        >
          <Users className={`h-4 w-4 ${accentColorClass}`} />
          <span className="text-sm text-slate-700 font-[var(--font-inter)] font-semibold tracking-wide">
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
          <p className="text-base sm:text-lg lg:text-xl text-slate-600 max-w-lg font-[var(--font-inter)] font-light leading-relaxed">
            {slide.description}
          </p>
        </div>

        {/* Testimonial Quote - Unique to Testimonial slides */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-lg border border-white/30">
          <div className="text-5xl text-slate-300 leading-none mb-3">
            &ldquo;
          </div>
          <blockquote className="text-base text-slate-700 font-[var(--font-inter)] italic leading-relaxed mb-3">
            {slide.quote}
          </blockquote>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-slate-600">
                  {slide.authorName.charAt(0)}
                </span>
              </div>
              <div>
                <div className="font-semibold text-slate-800">
                  {slide.authorName}
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${
                        i < slide.rating
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-slate-300"
                      }`}
                    />
                  ))}
                  <span className="text-sm text-slate-600 ml-1">
                    {slide.rating}/5
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats - Unique to Testimonial slides */}
        {slide.stats && slide.stats.length > 0 && (
          <div className="grid grid-cols-3 gap-3">
            {slide.stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-lg font-bold text-slate-800 font-[var(--font-dm-sans)]">
                  {stat.value}
                </div>
                <div className="text-xs text-slate-600 font-[var(--font-inter)]">
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
          <div className="flex items-center gap-3 px-3 py-2 bg-white/60 rounded-lg backdrop-blur-sm border border-white/20">
            <Award className="h-4 w-4 text-primary-600" />
            <span className="text-sm text-slate-700 font-[var(--font-inter)] font-medium">
              Trusted Reviews
            </span>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 bg-white/60 rounded-lg backdrop-blur-sm border border-white/20">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-slate-700 font-[var(--font-inter)] font-medium">
              Verified Buyers
            </span>
          </div>
        </div>
      </div>

      {/* Right: Media Display */}
      <div className="w-full h-full flex items-center justify-center min-w-0 order-2 lg:order-2">
        <div className="relative w-full max-w-[560px] aspect-[4/3] sm:aspect-square group">
          {/* Media Image Container */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-200/30 via-white/20 to-slate-300/30 backdrop-blur-sm shadow-xl">
            <div className="absolute inset-1 rounded-2xl bg-gradient-to-br from-white/60 via-slate-50/40 to-white/60 backdrop-blur-md shadow-lg border border-white/40 overflow-hidden">
              {slide.media.kind === "image" && slide.media.imageUrl && (
                <Image
                  src={slide.media.imageUrl}
                  alt={slide.media.alt || ""}
                  fill
                  className="object-contain sm:object-cover transition-all duration-700 group-hover:scale-105"
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  priority={isActive}
                />
              )}
            </div>
          </div>

          {/* Floating badge */}
          <div className="absolute top-4 right-4 z-30">
            <div className="bg-white/95 backdrop-blur-sm text-slate-800 px-3 py-2 rounded-xl text-xs font-bold shadow-xl border border-white/30 flex items-center gap-2">
              <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
              <span>FEATURED</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
