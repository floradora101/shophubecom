// TrendingNow: Slot-based stage/coverflow carousel
"use client";

import { useState, useEffect, useCallback, useMemo, memo } from "react";
import type { MouseEvent } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { SlotStageCarousel } from "@/components/ui/slot-stage-carousel";
import { Text } from "@/components/ui/typography";
import { SectionHeader, SectionTitle } from "./shared/section-header";
import { ui } from "@/lib/ui-tokens";
import { cn } from "@/lib/utils/cn";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { Product, Category } from "@/features/products/types";
import { useCart } from "@/features/cart/hooks";
import { getEffectiveStock } from "@/features/products/utils/inventory";
import { formatPrice } from "@/lib/utils";
import {
  getProductImageWithPlaceholder,
  getDiscountInfo,
} from "@/lib/utils/products";
import { ShoppingCart, Sparkles } from "lucide-react";
import { getGradientClass } from "@/lib/utils/gradients";

/**
 * Skeleton loader for TrendingNow component
 * Shows carousel layout with multiple product card placeholders
 */
export function TrendingNowSkeleton() {
  return (
    <Section className="bg-linear-to-br from-gray-50 to-white">
      <Container size="full" className="px-4 md:px-6 lg:px-8">
        {/* Header skeleton */}
        <div className="text-center md:text-left mb-12">
          <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-600">
              <SkeletonBlock className="w-3 h-3 rounded" />
              <SkeletonBlock className="h-3 w-32 rounded" />
            </div>
          </div>
          <SkeletonBlock className="h-5 w-64 mx-auto md:mx-0 rounded" />
        </div>

        {/* Carousel container skeleton */}
        <div className="relative">
          {/* Navigation arrows skeleton */}
          <div className="flex justify-between items-center mb-8">
            <SkeletonBlock className="w-12 h-12 rounded-full" />
            <SkeletonBlock className="w-12 h-12 rounded-full" />
          </div>

          {/* Cards container - showing 5 cards in carousel layout */}
          <div className="flex gap-4 overflow-hidden">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`shrink-0 transition-all duration-300 ${
                  i === 2 ? "scale-110 opacity-100 z-10" : "scale-90 opacity-60"
                }`}
              >
                <div className="bg-white rounded-lg shadow-lg border border-gray-100 p-4 w-64">
                  {/* Category badge */}
                  <div className="flex justify-between items-start mb-3">
                    <SkeletonBlock className="w-16 h-6 rounded-full" />
                    <SkeletonBlock className="w-5 h-5 rounded" />
                  </div>

                  {/* Product image */}
                  <SkeletonBlock className="aspect-square rounded-lg mb-4" />

                  {/* Product details */}
                  <div className="space-y-2">
                    <SkeletonBlock className="h-5 w-full rounded" />
                    <SkeletonBlock className="h-4 w-3/4 rounded" />
                    <SkeletonBlock className="h-4 w-1/2 rounded" />
                  </div>

                  {/* Price and button */}
                  <div className="flex items-center justify-between mt-4">
                    <SkeletonBlock className="w-16 h-6 rounded" />
                    <SkeletonBlock className="w-20 h-8 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination dots */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: 5 }, (_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${i === 0 ? "w-8" : ""}`}
              >
                <SkeletonBlock className="w-full h-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

interface TrendingNowProps {
  trendingProducts: Product[];
  categories?: Category[];
}

const TrendingProductCard = memo(
  ({
    product,
    onCardClick,
    isCenter,
  }: {
    product: Product;
    onCardClick: () => void;
    isCenter: boolean;
  }) => {
    const { addItem, toggleCart } = useCart();
    const router = useRouter();

    const effectiveStock = getEffectiveStock(product);
    const isOutOfStock = effectiveStock === 0;

    const variantCount = product.variants?.length ?? 0;
    const requiresSelection = variantCount !== 1;

    // Calculate discount info using utility function
    const discountInfo = getDiscountInfo(product);
    const { hasDiscount, discountPercent, originalPrice } = discountInfo;

    const handlePrimaryAction = async (
      event: MouseEvent<HTMLButtonElement>
    ) => {
      event.preventDefault();
      event.stopPropagation();

      if (requiresSelection) {
        router.push(`/products/${product.slug}`);
      } else {
        const variant = product.variants![0];
        if (!variant?.id) {
          toast.error("Unable to add item to cart. Please try again.");
          return;
        }

        try {
          await addItem(product, {
            variantId: variant.id,
            variantSku: variant.sku ?? null,
            selectedOptions: variant.options as Record<string, string>,
          });
          toast.success(`${product.name} added to cart!`);
          toggleCart(true);
        } catch (error) {
          console.error("Failed to add item to cart:", error);
          toast.error("Failed to add item to cart. Please try again.");
        }
      }
    };

    const handleCardClick = (e: MouseEvent) => {
      // If card is in center position, navigate to product page
      // Otherwise, center the card
      if (!(e.target as HTMLElement).closest("button")) {
        e.preventDefault();
        e.stopPropagation();
        if (isCenter) {
          router.push(`/products/${product.slug}`);
        } else {
          onCardClick();
        }
      }
    };

    return (
      <div
        className="group flex flex-col w-[280px] cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Modified ProductCard without Link wrapper */}
        <div className="relative aspect-square rounded-lg overflow-hidden transition-all duration-400 ease-out border border-warm-gray-200 hover:border-warm-gray-300 hover:shadow-xl hover:shadow-warm-gray-900/10 hover:scale-[1.02] bg-white">
          {/* Full Image Background */}
          <div className="absolute inset-0">
            {/* Primary Image */}
            <Image
              src={getProductImageWithPlaceholder(product)}
              alt={product.name}
              fill
              className="object-cover transition-all duration-600 ease-out opacity-100"
              sizes="280px"
              unoptimized={getProductImageWithPlaceholder(product).startsWith(
                "data:"
              )}
            />
          </div>

          {/* Discount Badge */}
          {hasDiscount && discountPercent > 0 && (
            <div className="absolute top-3 right-3 z-sticky">
              <div
                className={`font-bold text-xs md:text-sm px-2.5 md:px-3 py-1 md:py-1.5 shadow-lg text-white rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl ${getGradientClass(
                  "discount"
                )}`}
              >
                <Sparkles className="h-3 w-3 inline-block mr-2 transition-transform duration-500 hover:rotate-12" />
                <span>-{discountPercent}% OFF</span>
              </div>
            </div>
          )}

          {/* Out of Stock Overlay */}
          {isOutOfStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-30">
              <span className="bg-warm-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info Below Image */}
        <div className="mt-3 space-y-1 min-h-16 flex flex-col justify-end">
          <h3 className="text-sm md:text-base font-trendy font-semibold text-warm-gray-900 line-clamp-2">
            {product.name}
          </h3>

          {/* Product Description */}
          {product.description && (
            <p className="text-xs md:text-sm text-warm-gray-600 line-clamp-2">
              {product.description}
            </p>
          )}

          {/* Price Section */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-sm md:text-base font-semibold text-warm-gray-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && originalPrice && (
              <span className="relative text-xs md:text-sm text-warm-gray-400 font-medium px-1.5 py-0.5 rounded-sm bg-linear-to-r from-warm-gray-100/50 to-transparent">
                {formatPrice(originalPrice)}
                {/* Modern diagonal strike-through */}
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-full h-px bg-linear-to-r from-transparent via-warm-gray-400 to-transparent transform rotate-12 origin-center opacity-80"></span>
                </span>
              </span>
            )}
            {hasDiscount && discountPercent > 0 && originalPrice && (
              <span className="text-[10px] md:text-xs text-red-600 font-black bg-red-50 px-2 py-1 rounded-lg uppercase tracking-wider">
                Save {formatPrice(originalPrice - product.price)}
              </span>
            )}
          </div>
        </div>

        {/* Add to Cart Button - At Bottom */}
        {!isOutOfStock && (
          <div className="mt-4 flex justify-center">
            <button
              className="inline-flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg text-xs md:text-sm font-semibold hover:bg-red-700 active:bg-red-700 transition-all duration-300 shadow-xl"
              aria-label={
                requiresSelection
                  ? `Select options for ${product.name}`
                  : `Add ${product.name} to cart`
              }
              onClick={handlePrimaryAction}
            >
              <ShoppingCart className="h-3.5 w-3.5 md:h-4 md:w-4 transition-transform duration-300 group-hover:scale-110" />
              <span className="whitespace-nowrap">
                {requiresSelection ? "Select Option" : "Add to Cart"}
              </span>
            </button>
          </div>
        )}
      </div>
    );
  }
);

TrendingProductCard.displayName = "TrendingProductCard";

export function TrendingNow({ trendingProducts }: TrendingNowProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Safety check: ensure trendingProducts is an array
  const safeTrendingProducts = useMemo(
    () => (Array.isArray(trendingProducts) ? trendingProducts : []),
    [trendingProducts]
  );

  // Detect mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
  }, []);

  // Auto-play functionality
  const pauseAutoplayFor = useCallback((ms = 5000) => {
    setIsAutoPlaying(false);
    const timer = setTimeout(() => {
      setIsAutoPlaying(true);
    }, ms);
    return () => clearTimeout(timer);
  }, []);

  // Simplified navigation handlers that work with SlotStageCarousel
  const handleIndexChange = useCallback(
    (index: number) => {
      pauseAutoplayFor(5000);
      setActiveIndex(index);
    },
    [pauseAutoplayFor]
  );

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || safeTrendingProducts.length <= 1) return;

    const interval = setInterval(() => {
      setActiveIndex(
        (prevIndex) => (prevIndex + 1) % safeTrendingProducts.length
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, safeTrendingProducts.length]);

  if (!mounted || safeTrendingProducts.length === 0) return null;

  return (
    <Section
      spacing="lg"
      className="relative overflow-hidden bg-transparent"
      withContainer={false}
    >
      <Container className="relative z-10">
        <div className="space-y-8">
          <SectionHeader
            badge={{
              icon: Sparkles,
              text: "Hot Right Now",
            }}
            title={{
              italic: "Trending",
              bold: "Now",
            }}
            description="Discover what everyone's buying right now. These products are flying off the shelves!"
          />

          {/* Slot Stage Carousel with Auto-play */}
          <div
            className="relative"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            <SlotStageCarousel
              items={safeTrendingProducts}
              activeIndex={activeIndex}
              onActiveIndexChange={handleIndexChange}
              isMobile={isMobile}
              renderCard={(product, index, isCenter) => (
                <TrendingProductCard
                  product={product}
                  onCardClick={() => handleIndexChange(index)}
                  isCenter={isCenter}
                />
              )}
            />
          </div>
        </div>
      </Container>
    </Section>
  );
}
