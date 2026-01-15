"use client";

import { memo, useMemo } from "react";
import { ArrowRight, Sparkles, Star, Award, User, Quote, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import { HeroItem } from "../shared/hero-item";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";
import { StarRating } from "@/components/ui/star-rating";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { EditorsPickSlide } from "@/lib/types/heroSlides.types";
import type { Product } from "@/features/products/types";
import { getProductImageWithPlaceholder } from "@/lib/utils/products";

interface EditorsPickSlideBodyProps {
  slide: EditorsPickSlide;
  products?: Product[];
  productsBySlug?: Record<string, Product> | Map<string, Product>;
  isActive?: boolean;
  index?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const EditorsPickSlideBody = memo(function EditorsPickSlideBody({
  slide,
  products = [],
  productsBySlug,
  isActive = false,
  onMouseEnter,
  onMouseLeave,
}: EditorsPickSlideBodyProps) {
  // Animation run counter - increments when slide becomes active
  const { run, animationKey } = useHeroRunCounter(isActive);

  // Resolve products from slugs
  const editorProducts = useMemo(() => {
    // If direct products are passed (e.g. from a filter or props)
    if (products.length > 0) {
      return products.slice(0, 4);
    }

    // Otherwise resolve from slugs using productsBySlug map/record
    const resolvedProducts: Product[] = [];
    const slugs = slide.productSlugs || [];

    for (const slug of slugs.slice(0, 4)) {
      let product: Product | undefined;
      if (productsBySlug instanceof Map) {
        product = productsBySlug.get(slug);
      } else if (productsBySlug) {
        product = productsBySlug[slug];
      }
      if (product) {
        resolvedProducts.push(product);
      }
    }
    return resolvedProducts;
  }, [slide.productSlugs, products, productsBySlug]);

  // Media content: Product grid with "Staff Favorite" badges
  const mediaContent = (
    <div className="relative h-full w-full">
      <div className="relative h-full w-full rounded-lg overflow-hidden border ring-1 shadow-xl bg-white/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/30 via-transparent to-red-50/30" />

        {editorProducts.length > 0 ? (
          <div className="relative h-full w-full p-2 sm:p-4">
            {editorProducts.length === 1 ? (
              // Single featured product - large display
              <Link
                href={`/products/${editorProducts[0].slug}`}
                className="block relative h-full w-full rounded-lg overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 group/product"
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 to-transparent" />

                <div className="relative h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_60%)]" />
                    <Image
                      src={getProductImageWithPlaceholder(editorProducts[0])}
                      alt={editorProducts[0].name}
                      fill
                      className="object-contain object-center p-4 sm:p-8 drop-shadow-2xl group-hover/product:scale-110 transition-transform duration-1000"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="relative z-10 p-3 sm:p-6 bg-gray-900/80 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-2">
                      <Badge
                        variant="destructive"
                        size="default"
                        className="text-[8px] sm:text-xs"
                      >
                        <Star className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 mr-1" />
                        Staff Favorite
                      </Badge>
                    </div>
                    <h3 className="text-sm sm:text-xl font-black text-white leading-tight truncate mb-1">
                      {editorProducts[0].name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="text-lg sm:text-2xl font-black text-white">
                        {formatPrice(editorProducts[0].price)}
                      </div>
                      <div className="flex items-center text-white/90">
                        <StarRating rating={4.8} reviewCount={124} size="xs" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              // Grid layout for 2-4 products
              <div
                className={cn(
                  "grid gap-2 sm:gap-4 h-full",
                  editorProducts.length === 2 ? "grid-cols-1" : "grid-cols-2"
                )}
              >
                {editorProducts.map((product, idx) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="relative rounded-lg overflow-hidden bg-white border border-gray-200 group/product-card hover:shadow-xl transition-all duration-300"
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  >
                    {/* Staff Favorite Badge */}
                    <div className="absolute top-1.5 left-1.5 z-10">
                      <Badge
                        variant="destructive"
                        size="default"
                        className="text-[6px] sm:text-[8px] px-1 py-0 h-3.5 sm:h-4"
                      >
                        <Star className="w-1.5 h-1.5 sm:w-2 sm:h-2 mr-0.5" />
                        Pick
                      </Badge>
                    </div>

                    <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100">
                      <Image
                        src={getProductImageWithPlaceholder(product)}
                        alt={product.name}
                        fill
                        className="object-contain object-center p-2 sm:p-4 group-hover/product-card:scale-110 transition-transform duration-500"
                        sizes="(max-width: 1024px) 50vw, 20vw"
                      />
                    </div>
                    <div className="p-1.5 sm:p-2 bg-white">
                      <h4 className="text-[8px] sm:text-xs font-bold text-gray-900 line-clamp-1 mb-0.5">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between gap-1">
                        <div className="text-[10px] sm:text-sm font-black text-red-600">
                          {formatPrice(product.price)}
                        </div>
                        <StarRating
                          rating={4.5 + (idx % 3) * 0.2}
                          reviewCount={50 + idx * 20}
                          size="xs"
                          showCount={false}
                        />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="relative h-full w-full flex items-center justify-center p-4">
            <div className="text-center">
              <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">Editor picks coming soon</p>
            </div>
          </div>
        )}

        {/* Floating count badge */}
        {editorProducts.length > 0 && (
          <div className="absolute top-2 right-2 z-20">
            <Badge
              variant="destructive"
              size="default"
              className="text-[8px] sm:text-xs"
            >
              <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
              {editorProducts.length} Picks
            </Badge>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="group relative w-full h-full">
      <SlideLayout
        textContent={
          <>
            {/* Row 1: Themed Badge */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-badge">
                <Badge
                  variant="primary"
                  size="default"
                  className="mt-2 sm:mt-4"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  {slide.badgeText || "Editor's Pick"}
                </Badge>
              </div>
            </HeroItem>

            {/* Row 2: Headline */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-headline mt-1.5 transition-transform duration-700 group-hover:translate-x-2">
                <h1
                  className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-[1.1] md:leading-none tracking-tighter text-gray-900 mb-0.5 md:mb-1"
                >
                  {slide.headline}
                </h1>
                {slide.highlight && (
                  <h2
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-[1.1] md:leading-none tracking-tight italic text-red-600 mb-3 md:mb-4"
                  >
                    {slide.highlight}
                  </h2>
                )}
              </div>
            </HeroItem>

            {/* Row 3: Description */}
            <HeroItem run={run} animationKey={animationKey}>
              <p
                className={`text-sm md:text-base lg:text-lg leading-relaxed font-medium mt-1 hero-item-enter hero-description ${contentClamp.description} text-warm-gray-500`}
              >
                {slide.description}
              </p>
            </HeroItem>

            {/* Row 4: Editor Note & Product Stats */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="space-y-3 mt-4 hero-item-enter hero-description bg-white/40 backdrop-blur-md p-4 rounded-lg border border-red-600/5 shadow-sm transition-all duration-500 hover:bg-white/60 hover:shadow-md">
                <div className="space-y-3 min-w-0">
                  {/* Editor Note */}
                  {slide.editorNote && (
                    <div className="space-y-2 border-b border-red-600/5 pb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <User className="h-3.5 w-3.5 text-red-600 shrink-0" />
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                          Editor's Note
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Quote className="h-4 w-4 text-red-600/20 shrink-0 mt-0.5" />
                        <p className="text-sm font-medium text-gray-700 italic leading-relaxed">
                          {slide.editorNote}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Product Stats */}
                  {editorProducts.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        {
                          icon: Star,
                          label: "Top Rated",
                          value: `${editorProducts.length} Products`,
                        },
                        {
                          icon: Award,
                          label: "Curated",
                          value: "Staff Picks",
                        },
                        {
                          icon: Sparkles,
                          label: "Quality",
                          value: "Verified",
                        },
                      ].map((stat, i) => (
                        <div
                          key={i}
                          className="min-w-0"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <stat.icon className="h-3.5 w-3.5 text-red-600" />
                            <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest truncate">
                              {stat.label}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm font-black text-gray-900 truncate">
                            {stat.value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </HeroItem>

            {/* Row 5: CTAs */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="flex flex-row gap-3 mt-6 justify-center lg:justify-start hero-item-enter hero-buttons text-gray-900">
                <Link
                  href={slide.ctaPrimary.href}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                >
                  <Button
                    size="hero"
                    className="bg-red-600 hover:bg-red-700 text-white border-none shadow-xl hover:scale-105 active:scale-95 transition-all px-6 h-11 md:h-12"
                  >
                    <span className="flex items-center gap-1 font-black uppercase tracking-wider text-sm md:text-base">
                      {slide.ctaPrimary.label}
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Button>
                </Link>
                {slide.ctaSecondary && (
                  <Link
                    href={slide.ctaSecondary.href}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  >
                    <Button
                      size="hero"
                      className="bg-white text-red-600 hover:bg-red-600 hover:text-white border-none shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 px-6 h-11 md:h-12 font-black uppercase tracking-wider text-sm md:text-base"
                    >
                      {slide.ctaSecondary.label}
                    </Button>
                  </Link>
                )}
              </div>
            </HeroItem>

            {/* Row 6: Enhanced Trust Row */}
            <HeroItem run={run} animationKey={animationKey}>
              <div className="hero-item-enter hero-description pt-4 mt-4 border-t border-red-600/5">
                <div className="flex flex-nowrap items-center gap-6 overflow-x-auto">
                  {[
                    { icon: Star, text: "Staff Favorite" },
                    { icon: Truck, text: "Fast Shipping" },
                    { icon: RotateCcw, text: "30D Returns" },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1.5 font-bold text-[10px] uppercase tracking-widest text-red-600/60"
                    >
                      <item.icon className="h-3 w-3" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </HeroItem>
          </>
        }
        mediaContent={mediaContent}
      />
    </div>
  );
});

export default EditorsPickSlideBody;
