"use client";

import { memo, useMemo } from "react";
import { ArrowRight, Sparkles, Zap, TrendingUp, Award, Grid3x3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { SlideLayout, contentClamp } from "../shared/slide-layout";
import { HeroItem } from "../shared/hero-item";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";
import { ProductCard } from "@/features/products/components/ProductCard";
import { formatPrice } from "@/lib/utils";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import type { CategorySpotlightSlide } from "@/lib/types/heroSlides.types";
import type { Category, Product } from "@/features/products/types";
import { getProductImageWithPlaceholder } from "@/lib/utils/products";

interface CategorySpotlightSlideBodyProps {
  slide: CategorySpotlightSlide;
  category?: Category;
  categories?: Category[];
  productsByCategory?: Record<string, Product[]>;
  isActive?: boolean;
  index?: number;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export const CategorySpotlightSlideBody = memo(
  function CategorySpotlightSlideBody({
    slide,
    category,
    categories = [],
    productsByCategory = {},
    isActive = false,
    index = 0,
    onMouseEnter,
    onMouseLeave,
  }: CategorySpotlightSlideBodyProps) {
    // Animation run counter - increments when slide becomes active
    const { run, animationKey } = useHeroRunCounter(isActive);

    // Build spotlight category data
    const categorySlug = category?.slug || slide.categorySlug;
    const categoryName = category?.name || slide.headline;
    const categoryDescription = category?.description || slide.description;
    const categoryProducts = productsByCategory[categorySlug] || [];

    // Get featured product and grid products
    const featuredProduct = categoryProducts[0];
    const gridProducts = categoryProducts.slice(1, 5);

    // Find subcategories
    const subCategories = useMemo(() => {
      if (!category?.id) return [];
      return categories.filter((c) => c.parentId === category.id).slice(0, 4);
    }, [categories, category]);

    const stats = [
      { label: "Performance", value: "99th Percentile", icon: Zap },
      { label: "Durability", value: "Mil-Spec Rated", icon: Award },
      { label: "Design", value: "Aesthetic Core", icon: TrendingUp },
    ];

    // Media content: Product grid
    const mediaContent = (
      <div className="relative h-full w-full">
        <div className="relative h-full w-full rounded-lg overflow-hidden border ring-1 shadow-xl bg-white/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50/30 via-transparent to-gray-50/30" />

          {featuredProduct ? (
            <div className="relative h-full w-full p-2 sm:p-4">
              {/* Featured Product - Large Display */}
              <div className="relative h-full w-full rounded-lg overflow-hidden bg-gray-900 group/product">
                <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-transparent" />

                <div className="relative h-full flex flex-col">
                  {/* Product Image */}
                  <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_60%)]" />
                    <Image
                      src={getProductImageWithPlaceholder(featuredProduct)}
                      alt={featuredProduct.name}
                      fill
                      className="object-contain p-4 sm:p-8 drop-shadow-2xl group-hover/product:scale-110 transition-transform duration-1000"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="relative z-10 p-3 sm:p-6 bg-gray-900/80 backdrop-blur-sm">
                    <h3 className="text-sm sm:text-xl font-black text-white leading-tight truncate mb-1">
                      {featuredProduct.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <div className="text-lg sm:text-2xl font-black text-white">
                        {formatPrice(featuredProduct.price)}
                      </div>
                      {featuredProduct.image && (
                        <Badge variant="destructive" size="default" className="text-[8px] sm:text-xs">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : gridProducts.length > 0 ? (
            <div className="relative h-full w-full p-2 sm:p-4 grid grid-cols-2 gap-2 sm:gap-4">
              {gridProducts.slice(0, 4).map((product, idx) => (
                <div
                  key={product.id}
                  className="relative rounded-lg overflow-hidden bg-white border border-gray-200 group/product-card"
                >
                  <div className="relative aspect-square">
                    <Image
                      src={getProductImageWithPlaceholder(product)}
                      alt={product.name}
                      fill
                      className="object-cover group-hover/product-card:scale-110 transition-transform duration-500"
                      sizes="(max-width: 1024px) 50vw, 20vw"
                    />
                  </div>
                  <div className="p-1.5 sm:p-2">
                    <h4 className="text-[8px] sm:text-xs font-bold text-gray-900 line-clamp-1 mb-0.5">
                      {product.name}
                    </h4>
                    <div className="text-[10px] sm:text-sm font-black text-red-600">
                      {formatPrice(product.price)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="relative h-full w-full flex items-center justify-center p-4">
              <div className="text-center">
                <Grid3x3 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Products coming soon</p>
              </div>
            </div>
          )}

          {/* Floating badge */}
          {categoryProducts.length > 0 && (
            <div className="absolute top-2 right-2 z-20">
              <Badge variant="destructive" size="default" className="text-[8px] sm:text-xs">
                <Sparkles className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5" />
                {categoryProducts.length} Items
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
                <div className="hero-item-enter hero-badge w-fit max-w-full">
                  <Badge
                    variant="primary"
                    size="default"
                    className="mt-1 sm:mt-4 px-2 py-0 h-5 sm:h-auto"
                  >
                    <Sparkles className="h-3 w-3 shrink-0" />
                    <span className="truncate text-[10px] sm:text-xs">
                      {slide.badgeText || "Category Spotlight"}
                    </span>
                  </Badge>
                </div>
              </HeroItem>

              {/* Row 2: Headline */}
              <HeroItem run={run} animationKey={animationKey}>
                <div className="hero-item-enter hero-headline mt-0.5 transition-transform duration-700 group-hover:translate-x-2 w-full max-w-full min-w-0">
                  <h1 className="text-lg xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tighter text-gray-900 wrap-break-word">
                    {categoryName}
                  </h1>
                  {slide.highlight && (
                    <h2 className="text-lg xs:text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-light leading-tight tracking-tight italic text-red-600 wrap-break-word">
                      {slide.highlight}
                    </h2>
                  )}
                </div>
              </HeroItem>

              {/* Row 3: Description */}
              <HeroItem run={run} animationKey={animationKey}>
                <p
                  className={`text-[10px] sm:text-sm md:text-base lg:text-lg leading-snug font-medium mt-0.5 hero-item-enter hero-description ${contentClamp.description} text-warm-gray-500 line-clamp-2 sm:line-clamp-none w-full max-w-full`}
                >
                  {categoryDescription}
                </p>
              </HeroItem>

              {/* Row 4: Category Stats & Subcategories */}
              <HeroItem run={run} animationKey={animationKey}>
                <div className="w-[calc(100%-4px)] mx-auto lg:mx-0 lg:w-full max-w-full min-w-0 space-y-1 mt-1 md:mt-3 hero-item-enter hero-description bg-white/40 backdrop-blur-md p-1.5 md:p-4 rounded-lg border border-red-600/5 shadow-sm transition-all duration-500 group-hover:bg-white/60 group-hover:shadow-md">
                  <div className="space-y-2 min-w-0">
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-1 sm:gap-2">
                      {stats.map((stat, i) => (
                        <div
                          key={i}
                          className="space-y-0.5 sm:space-y-1 min-w-0"
                        >
                          <stat.icon className="h-2 w-2 sm:h-3 sm:w-3 text-red-600" />
                          <div className="text-[6px] sm:text-[8px] font-black text-gray-500 uppercase tracking-widest truncate">
                            {stat.label}
                          </div>
                          <div className="text-[7px] sm:text-xs font-bold text-gray-900 truncate">
                            {stat.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Subcategories */}
                    {subCategories.length > 0 && (
                      <div className="pt-1.5 border-t border-red-600/5">
                        <div className="text-[6px] sm:text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">
                          Subcategories
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {subCategories.map((subCat) => (
                            <Link
                              key={subCat.id}
                              href={`/products?category=${subCat.slug}`}
                              className="px-1.5 py-0.5 rounded-md border border-red-600/10 bg-white/80 hover:bg-red-600 hover:text-white transition-all duration-300 text-[7px] sm:text-[9px] font-black tracking-widest uppercase text-gray-900 hover:opacity-100"
                            >
                              {subCat.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </HeroItem>

              {/* Row 5: CTAs */}
              <HeroItem run={run} animationKey={animationKey}>
                <div className="flex flex-row gap-1.5 mt-1.5 md:mt-4 justify-center lg:justify-start hero-item-enter hero-buttons text-gray-900">
                  <Link
                    href={slide.ctaPrimary.href}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                  >
                    <Button
                      size="hero"
                      className="bg-red-600 hover:bg-red-700 text-white border-none shadow-xl hover:scale-105 active:scale-95 transition-all px-2.5 sm:px-6 h-7 sm:h-12"
                    >
                      <span className="flex items-center gap-1 font-black uppercase tracking-wider text-[9px] sm:text-sm md:text-base">
                        {slide.ctaPrimary.label}
                        <ArrowRight className="h-2.5 w-2.5 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
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
                        className="bg-white text-red-600 hover:bg-red-600 hover:text-white border-none shadow-xl hover:scale-105 active:scale-95 transition-all duration-500 px-2.5 sm:px-6 h-7 sm:h-12 font-black uppercase tracking-wider text-[9px] sm:text-sm md:text-base"
                      >
                        {slide.ctaSecondary.label}
                      </Button>
                    </Link>
                  )}
                </div>
              </HeroItem>

              {/* Row 6: Enhanced Trust Row */}
              <HeroItem run={run} animationKey={animationKey}>
                <div className="hidden sm:block hero-item-enter hero-description pt-1.5 mt-1.5 border-t border-red-600/5">
                  <div className="flex flex-nowrap items-center gap-4 overflow-x-auto">
                    {[
                      { icon: Zap, text: "Premium Selection" },
                      { icon: TrendingUp, text: "Trending Now" },
                      { icon: Award, text: "Top Rated" },
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
  }
);

export default CategorySpotlightSlideBody;
