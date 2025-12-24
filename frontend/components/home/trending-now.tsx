// TrendingNow: Slot-based stage/coverflow carousel
"use client";

import { useState, useEffect, useCallback, useMemo, memo, useRef } from "react";
import type { ComponentType, MouseEvent } from "react";
import {
  Flame,
  ChevronLeft,
  ChevronRight,
  Laptop,
  Shirt,
  Home,
  BookOpen,
  ShoppingCart,
  ArrowRight,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { SlotStageCarousel } from "@/components/ui/slot-stage-carousel";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Product, Category } from "@/features/products/types";
import { useCart } from "@/features/cart/hooks";
import { getEffectiveStock } from "@/features/products/utils/inventory";
import { formatPrice } from "@/lib/utils";

interface TrendingNowProps {
  trendingProducts: Product[];
  categories?: Category[];
}

// Category icon mapping
const categoryIcons: Record<string, ComponentType<{ className?: string }>> = {
  electronics: Laptop,
  clothing: Shirt,
  "home-garden": Home,
  books: BookOpen,
};

// Default categories (moved outside component for stability)
const DEFAULT_CATEGORIES: Category[] = [
  {
    id: "default-electronics",
    slug: "electronics",
    name: "Electronics",
    description: "",
    parentId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "default-clothing",
    slug: "clothing",
    name: "Clothing",
    description: "",
    parentId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "default-home-garden",
    slug: "home-garden",
    name: "Home & Garden",
    description: "",
    parentId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
  {
    id: "default-books",
    slug: "books",
    name: "Books",
    description: "",
    parentId: null,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  },
];

// Icon position arrays - reduced counts for performance
const ICON_POSITIONS_LAYER1 = [
  { top: "5%", left: "3%", size: 48 },
  { top: "12%", right: "4%", size: 44 },
  { top: "20%", left: "2%", size: 52 },
  { top: "28%", right: "3%", size: 46 },
  { top: "35%", left: "4%", size: 50 },
  { top: "42%", right: "5%", size: 45 },
  { top: "50%", left: "2%", size: 54 },
  { top: "58%", right: "4%", size: 47 },
  { top: "65%", left: "6%", size: 49 },
  { top: "72%", right: "6%", size: 43 },
  { top: "80%", left: "8%", size: 46 },
  { top: "88%", right: "8%", size: 41 },
  { top: "8%", left: "10%", size: 42 },
  { top: "16%", right: "12%", size: 48 },
  { top: "24%", left: "8%", size: 45 },
  { top: "32%", right: "10%", size: 44 },
  { top: "40%", left: "5%", size: 51 },
  { top: "48%", right: "7%", size: 43 },
  { top: "56%", left: "7%", size: 47 },
  { top: "64%", right: "9%", size: 45 },
  { top: "75%", left: "4%", size: 48 },
  { top: "82%", right: "5%", size: 42 },
  { top: "92%", left: "7%", size: 40 },
  { top: "14%", left: "15%", size: 39 },
  { top: "22%", right: "16%", size: 46 },
  { top: "30%", left: "12%", size: 44 },
  { top: "38%", right: "14%", size: 41 },
  { top: "46%", left: "10%", size: 49 },
  { top: "54%", right: "12%", size: 43 },
  { top: "62%", left: "11%", size: 46 },
  { top: "70%", right: "13%", size: 44 },
  { top: "78%", left: "13%", size: 41 },
  { top: "86%", right: "11%", size: 38 },
  { top: "18%", left: "20%", size: 40 },
  { top: "26%", right: "22%", size: 45 },
  { top: "34%", left: "18%", size: 43 },
  { top: "44%", right: "20%", size: 47 },
  { top: "52%", left: "16%", size: 44 },
  { top: "60%", right: "18%", size: 42 },
  { top: "68%", left: "19%", size: 45 },
  { top: "76%", right: "17%", size: 43 },
  { top: "84%", left: "15%", size: 40 },
].slice(0, 18); // Reduced from 94 to 18 icons

const ICON_POSITIONS_LAYER2 = [
  { top: "7%", left: "25%", size: 34, rotation: 12 },
  { top: "15%", left: "28%", size: 38, rotation: -18 },
  { top: "23%", right: "26%", size: 36, rotation: 22 },
  { top: "31%", right: "28%", size: 40, rotation: -15 },
  { top: "39%", left: "30%", size: 35, rotation: 25 },
  { top: "47%", left: "33%", size: 37, rotation: -20 },
  { top: "55%", right: "31%", size: 39, rotation: 18 },
  { top: "63%", left: "28%", size: 36, rotation: -22 },
  { top: "71%", right: "29%", size: 38, rotation: 20 },
  { top: "79%", left: "27%", size: 34, rotation: -25 },
  { top: "87%", right: "25%", size: 35, rotation: 15 },
  { top: "11%", left: "38%", size: 33, rotation: -18 },
  { top: "19%", right: "36%", size: 37, rotation: 24 },
  { top: "27%", left: "35%", size: 35, rotation: -20 },
  { top: "35%", right: "37%", size: 39, rotation: 19 },
  { top: "43%", left: "40%", size: 36, rotation: -23 },
  { top: "51%", right: "38%", size: 38, rotation: 21 },
  { top: "59%", left: "37%", size: 34, rotation: -17 },
  { top: "67%", right: "39%", size: 37, rotation: 23 },
  { top: "75%", left: "36%", size: 35, rotation: -19 },
  { top: "83%", right: "34%", size: 33, rotation: 16 },
  { top: "9%", left: "45%", size: 32, rotation: -21 },
  { top: "17%", right: "43%", size: 36, rotation: 26 },
  { top: "25%", left: "42%", size: 34, rotation: -16 },
  { top: "33%", right: "44%", size: 38, rotation: 20 },
  { top: "41%", left: "47%", size: 35, rotation: -24 },
  { top: "49%", right: "45%", size: 37, rotation: 17 },
  { top: "57%", left: "44%", size: 33, rotation: -19 },
  { top: "65%", right: "46%", size: 36, rotation: 22 },
  { top: "73%", left: "43%", size: 34, rotation: -18 },
  { top: "81%", right: "41%", size: 32, rotation: 15 },
  { top: "13%", left: "52%", size: 31, rotation: -20 },
  { top: "21%", right: "50%", size: 35, rotation: 24 },
  { top: "29%", left: "49%", size: 33, rotation: -17 },
  { top: "37%", right: "51%", size: 37, rotation: 19 },
  { top: "45%", left: "54%", size: 34, rotation: -22 },
  { top: "53%", right: "52%", size: 36, rotation: 18 },
  { top: "61%", left: "51%", size: 32, rotation: -21 },
  { top: "69%", right: "53%", size: 35, rotation: 23 },
  { top: "77%", left: "50%", size: 33, rotation: -16 },
  { top: "85%", right: "48%", size: 31, rotation: 14 },
].slice(0, 14); // Reduced from 38 to 14 icons

const ICON_POSITIONS_LAYER3 = [
  { top: "6%", left: "58%", size: 30, rotation: 10 },
  { top: "14%", right: "56%", size: 34, rotation: -14 },
  { top: "22%", left: "57%", size: 32, rotation: 16 },
  { top: "30%", right: "59%", size: 36, rotation: -12 },
  { top: "38%", left: "60%", size: 31, rotation: 21 },
  { top: "46%", right: "58%", size: 33, rotation: -19 },
  { top: "54%", left: "59%", size: 35, rotation: 13 },
  { top: "62%", right: "61%", size: 30, rotation: -17 },
  { top: "70%", left: "58%", size: 32, rotation: 19 },
  { top: "78%", right: "56%", size: 34, rotation: -15 },
  { top: "86%", left: "55%", size: 31, rotation: 11 },
  { top: "10%", left: "65%", size: 29, rotation: -13 },
  { top: "18%", right: "63%", size: 33, rotation: 17 },
  { top: "26%", left: "64%", size: 31, rotation: -11 },
  { top: "34%", right: "66%", size: 35, rotation: 20 },
  { top: "42%", left: "67%", size: 30, rotation: -18 },
  { top: "50%", right: "65%", size: 32, rotation: 14 },
  { top: "58%", left: "66%", size: 34, rotation: -16 },
  { top: "66%", right: "64%", size: 31, rotation: 22 },
  { top: "74%", left: "63%", size: 33, rotation: -14 },
  { top: "82%", right: "61%", size: 29, rotation: 12 },
  { top: "4%", left: "72%", size: 28, rotation: -15 },
  { top: "12%", right: "70%", size: 32, rotation: 18 },
  { top: "20%", left: "71%", size: 30, rotation: -12 },
  { top: "28%", right: "73%", size: 34, rotation: 21 },
  { top: "36%", left: "74%", size: 29, rotation: -20 },
  { top: "44%", right: "72%", size: 31, rotation: 15 },
  { top: "52%", left: "73%", size: 33, rotation: -13 },
  { top: "60%", right: "71%", size: 30, rotation: 19 },
  { top: "68%", left: "70%", size: 32, rotation: -17 },
  { top: "76%", right: "68%", size: 28, rotation: 11 },
  { top: "84%", left: "69%", size: 30, rotation: -14 },
  { top: "8%", left: "78%", size: 27, rotation: 16 },
  { top: "16%", right: "76%", size: 31, rotation: -19 },
  { top: "24%", left: "77%", size: 29, rotation: 13 },
  { top: "32%", right: "79%", size: 33, rotation: -21 },
  { top: "40%", left: "80%", size: 28, rotation: 17 },
  { top: "48%", right: "78%", size: 30, rotation: -15 },
  { top: "56%", left: "79%", size: 32, rotation: 20 },
  { top: "64%", right: "77%", size: 29, rotation: -18 },
  { top: "72%", left: "76%", size: 31, rotation: 14 },
  { top: "80%", right: "74%", size: 27, rotation: -16 },
  { top: "88%", left: "75%", size: 29, rotation: 12 },
].slice(0, 12); // Reduced from 44 to 12 icons

const PLACEHOLDER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Crect fill='%23f3f4f6' width='400' height='400'/%3E%3Ctext fill='%239ca3af' font-family='sans-serif' font-size='18' x='50%25' y='50%25' text-anchor='middle' dominant-baseline='middle'%3ENo Image%3C/text%3E%3C/svg%3E";

const TrendingProductCard = memo(
  ({
    product,
    index,
    isCenter,
    onCardClick,
  }: {
    product: Product;
    index: number;
    isCenter: boolean;
    onCardClick: () => void;
  }) => {
    const { addItem, toggleCart } = useCart();
    const router = useRouter();
    const [imageError, setImageError] = useState(false);

    const primaryImage =
      product.defaultVariant?.image || product.defaultVariant?.images?.[0];
    const displayImage =
      imageError || !primaryImage ? PLACEHOLDER_IMAGE : primaryImage;

    const effectiveStock = getEffectiveStock(product);
    const isOutOfStock = effectiveStock === 0;

    const variantCount = product.variants?.length ?? 0;
    const requiresSelection = variantCount !== 1;

    const discountPercent =
      product.discount?.discountPercent || product.discountValue || 0;
    const originalPrice =
      product.discount?.originalPrice || product.originalPrice;
    const hasDiscount =
      !!originalPrice &&
      originalPrice > product.price &&
      (product.discount?.isOnSale ?? product.isOnSale ?? discountPercent > 0);

    const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      if (requiresSelection) {
        // Navigate to detail page for variant selection
        router.push(`/products/${product.slug}`);
      } else {
        const variant = product.variants?.[0];
        if (!variant?.id) return;
        addItem(product, {
          variantId: variant.id,
          variantSku: variant.sku ?? null,
          // @ts-expect-error - selectedOptions type mismatch
          selectedOptions: variant.options,
        });
        toggleCart(true);
      }
    };

    const handleCardClick = (e: MouseEvent) => {
      // Only navigate to product detail if center card, otherwise just center it
      if (isCenter) {
        // Center card: navigate to product detail
        if (!(e.target as HTMLElement).closest("button")) {
          e.preventDefault();
          e.stopPropagation();
          router.push(`/products/${product.slug}`);
        }
      } else {
        // Side card: center it
        if (!(e.target as HTMLElement).closest("button")) {
          e.preventDefault();
          e.stopPropagation();
          onCardClick();
        }
      }
    };

    return (
      <div
        className="group flex flex-col shrink-0 w-[280px] cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Image Section - No Link wrapper */}
        <div className="relative aspect-square rounded-2xl overflow-hidden border border-gray-200 bg-white">
          <Image
            src={displayImage}
            alt={product.name}
            fill
            className="object-cover"
            sizes="280px"
            onError={() => setImageError(true)}
            unoptimized={displayImage.startsWith("data:")}
          />

          {/* Trending Badge */}
          {index < 3 && (
            <div className="absolute top-3 left-3 z-10">
              <Badge
                variant="destructive"
                className="font-bold text-xs px-3 py-1.5 shadow-lg bg-gradient-to-r from-orange-500 to-red-500 text-white border-0"
              >
                <Flame className="h-3 w-3 inline-block mr-1.5" />#{index + 1}{" "}
                TRENDING
              </Badge>
            </div>
          )}

          {/* Discount Badge */}
          {hasDiscount && discountPercent > 0 && (
            <div className="absolute top-3 right-3 z-10">
              <Badge
                variant="destructive"
                className="font-bold text-xs px-3 py-1.5 shadow-lg"
              >
                -{discountPercent}% OFF
              </Badge>
            </div>
          )}

          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
              <span className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">
                Out of Stock
              </span>
            </div>
          )}
        </div>

        {/* Product Info Below Image */}
        <div className="mt-3 space-y-2">
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {hasDiscount && originalPrice && (
              <span className="text-xs text-gray-500 line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>

          {/* Add to Cart Button - Icon Only */}
          {!isOutOfStock && (
            <div className="flex justify-end mt-2">
              <button
                onClick={handleAddToCart}
                className="rounded-full p-2.5 bg-primary-600 hover:bg-primary-700 text-white transition-colors shadow-md hover:shadow-lg"
                aria-label={
                  requiresSelection
                    ? `Select options for ${product.name}`
                    : `Add ${product.name} to cart`
                }
              >
                {requiresSelection ? (
                  <ArrowRight className="h-5 w-5" />
                ) : (
                  <ShoppingCart className="h-5 w-5" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

TrendingProductCard.displayName = "TrendingProductCard";

// Simplified BackgroundIcons - no animations, reduced count for performance
const BackgroundIcons = memo(
  ({ categories }: { categories: Category[] }) => {
    if (categories.length === 0) return null;

    // Reduced icon count for better performance
    const layer1Icons = ICON_POSITIONS_LAYER1.slice(0, 8);
    const layer2Icons = ICON_POSITIONS_LAYER2.slice(0, 6);
    const layer3Icons = ICON_POSITIONS_LAYER3.slice(0, 4);

    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {/* Layer 1 - Primary icons */}
        {layer1Icons.map((pos, i) => {
          const categoryIndex = i % categories.length;
          const category = categories[categoryIndex];
          const IconComponent = categoryIcons[category.slug] || Laptop;

          return (
            <div
              key={`layer1-${i}`}
              className="absolute opacity-[0.14]"
              style={{
                top: pos.top,
                left: pos.left,
                right: pos.right,
                width: `${pos.size}px`,
                height: `${pos.size}px`,
              }}
            >
              <IconComponent className="w-full h-full text-primary-600/50 stroke-[1.5]" />
            </div>
          );
        })}

        {/* Layer 2 - Additional scattered icons */}
        {layer2Icons.map((pos, i) => {
          const categoryIndex = i % categories.length;
          const category = categories[categoryIndex];
          const IconComponent = categoryIcons[category.slug] || Laptop;

          return (
            <div
              key={`layer2-${i}`}
              className="absolute opacity-[0.11]"
              style={{
                top: pos.top,
                left: pos.left,
                right: pos.right,
                width: `${pos.size}px`,
                height: `${pos.size}px`,
                transform: `rotate(${pos.rotation}deg)`,
              }}
            >
              <IconComponent className="w-full h-full text-primary-500/40 stroke-[1.5]" />
            </div>
          );
        })}

        {/* Layer 3 - Even more icons */}
        {layer3Icons.map((pos, i) => {
          const categoryIndex = i % categories.length;
          const category = categories[categoryIndex];
          const IconComponent = categoryIcons[category.slug] || Laptop;

          return (
            <div
              key={`layer3-${i}`}
              className="absolute opacity-[0.09]"
              style={{
                top: pos.top,
                left: pos.left,
                right: pos.right,
                width: `${pos.size}px`,
                height: `${pos.size}px`,
                transform: `rotate(${pos.rotation}deg)`,
              }}
            >
              <IconComponent className="w-full h-full text-primary-400/35 stroke-[1.5]" />
            </div>
          );
        })}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.categories.length === nextProps.categories.length &&
      prevProps.categories.every(
        (cat, i) => cat.id === nextProps.categories[i]?.id
      )
    );
  }
);

BackgroundIcons.displayName = "BackgroundIcons";

export function TrendingNow({
  trendingProducts,
  categories = [],
}: TrendingNowProps) {
  const [mounted, setMounted] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Safety check: ensure trendingProducts is an array
  const safeTrendingProducts = useMemo(
    () => (Array.isArray(trendingProducts) ? trendingProducts : []),
    [trendingProducts]
  );

  // Check if navigation should be disabled (<=1 products)
  const isNavigationDisabled = safeTrendingProducts.length <= 1;

  // Detect mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Navigation function for programmatic control
  const goToIndex = useCallback((index: number) => {
    setActiveIndex(index);
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true);
    });
  }, []);

  // Use default categories if none provided (memoized for stability)
  const displayCategories = useMemo(
    () => (categories.length > 0 ? categories : DEFAULT_CATEGORIES),
    [categories]
  );

  if (!mounted || safeTrendingProducts.length === 0) {
    return null;
  }

  return (
    <Section spacing="lg" className="relative overflow-hidden bg-transparent">
      {/* Category Icons Background Pattern - Static, no animations */}
      <BackgroundIcons categories={displayCategories} />

      <Container className="relative z-10">
        <div className="space-y-8">
          {/* Enhanced Header */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-center md:text-left space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 via-primary-100 to-orange-100 mb-2">
                <Flame className="h-4 w-4 text-orange-600 animate-bounce-slow" />
                <span className="text-sm font-semibold text-primary-700 font-[var(--font-poppins)]">
                  Hot Right Now
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight">
                <span className="font-[var(--font-playfair)] font-bold italic">
                  Trending
                </span>
                <span className="font-[var(--font-poppins)] font-bold text-primary-600 ml-2">
                  Now
                </span>
              </h2>
              <p className="text-gray-600 max-w-2xl text-lg font-[var(--font-inter)] font-light leading-relaxed">
                Discover what everyone&apos;s buying right now. These products
                are flying off the shelves!
              </p>
            </div>
            {/* Additional Navigation Arrows - For larger screens */}
            {!isNavigationDisabled && !isMobile && (
              <div className="flex gap-2">
                <button
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev === 0 ? safeTrendingProducts.length - 1 : prev - 1
                    )
                  }
                  className="p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                  aria-label="Previous product"
                >
                  <ChevronLeft className="h-5 w-5 text-primary-600" />
                </button>
                <button
                  onClick={() =>
                    setActiveIndex((prev) =>
                      prev === safeTrendingProducts.length - 1 ? 0 : prev + 1
                    )
                  }
                  className="p-3 rounded-full border-2 border-primary-300 bg-white hover:bg-primary-50 hover:border-primary-500 transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-110"
                  aria-label="Next product"
                >
                  <ChevronRight className="h-5 w-5 text-primary-600" />
                </button>
              </div>
            )}
          </div>

          {/* Slot Stage Carousel */}
          <SlotStageCarousel
            items={safeTrendingProducts}
            activeIndex={activeIndex}
            onActiveIndexChange={setActiveIndex}
            isMobile={isMobile}
            renderCard={(product, index, isCenter) => (
              <TrendingProductCard
                product={product}
                index={index}
                isCenter={isCenter}
                onCardClick={() => goToIndex(index)}
              />
            )}
          />
        </div>
      </Container>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }

        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </Section>
  );
}
