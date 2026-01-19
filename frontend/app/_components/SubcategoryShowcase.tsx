"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SectionHeader } from "@/components/shared/SectionHeader";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";
import type { Product, Category } from "@/features/products/types";
import {
  Sparkles,
  ChevronRight,
  LayoutGrid,
  Layers,
  ShoppingCart,
  Heart,
  Star,
  Zap,
  ShieldCheck,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils/cn";
import { SparkleEffect } from "@/components/ui/SparkleEffect";
import { useCart } from "@/features/cart/hooks";
import { useFavorites } from "@/features/favorites";
import { formatPrice } from "@/lib/utils/price";
import { getProductImageWithPlaceholder, getDiscountInfo } from "@/lib/utils/products";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { extractErrorMessage } from "@/lib/utils/error-handler";

interface SubcategoryShowcaseProps {
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
  parentCategorySlug: string;
}

/**
 * FeaturedProductDisplay: Bespoke, high-end display for the main product in a subcategory.
 */
function FeaturedProductDisplay({ product }: { product: Product }) {
  const { addItem, toggleCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const router = useRouter();

  const discountInfo = getDiscountInfo(product);
  const { hasDiscount, discountPercent, originalPrice } = discountInfo;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const variant = product.variants?.[0];
    if (!variant?.id) {
      router.push(`/products/${product.slug}`);
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
      const errorMessage = extractErrorMessage(
        error,
        "Failed to add to cart"
      );
      toast.error(errorMessage);
      console.error("Add to cart error:", error);
    }
  };

  return (
    <div className="relative group/featured h-full flex flex-col">
      <Card className="relative flex-1 overflow-hidden bg-white shadow-[0_30px_70px_rgba(0,0,0,0.06)] group-hover/featured:shadow-[0_50px_100px_rgba(0,0,0,0.1)] transition-all duration-700 flex flex-col">
        {/* Top Badges & Actions */}
        <div className="absolute top-8 left-8 right-8 z-20 flex justify-between items-start pointer-events-none">
          <div className="flex flex-col gap-2">
            <div className="bg-black/95 backdrop-blur-xl text-white text-[10px] font-black uppercase tracking-[0.3em] px-5 py-2.5 rounded-lg border border-white/10 flex items-center gap-2.5 shadow-2xl pointer-events-auto">
              <div className="h-1.5 w-1.5 rounded-full bg-red-600 animate-pulse" />
              Signature Series
            </div>
            {hasDiscount && (
              <div className="bg-red-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-lg shadow-xl shadow-red-500/20 self-start pointer-events-auto">
                {discountPercent}% OFF
              </div>
            )}
          </div>

          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(product.id);
            }}
            className={cn(
              "p-4 rounded-lg backdrop-blur-md transition-all duration-500 hover:scale-110 active:scale-90 pointer-events-auto",
              isFavorite(product.id)
                ? "bg-red-50 text-red-600"
                : "bg-white/80 border border-gray-100 text-gray-400 hover:bg-red-600 hover:text-white"
            )}
          >
            <Heart className={cn("h-6 w-6", isFavorite(product.id) && "fill-current")} />
          </button>
        </div>

        {/* Product Image Section */}
        <Link
          href={`/products/${product.slug}`}
          className="relative flex-1 min-h-[350px] group/img-link"
        >
          <div className="absolute inset-0 p-12 flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-red-500/5 rounded-full blur-[80px] group-hover/featured:bg-red-500/10 transition-colors duration-700" />

            <Image
              src={getProductImageWithPlaceholder(product)}
              alt={product.name}
              fill
              className="object-contain p-12 transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover/featured:scale-110 group-hover/featured:-rotate-2"
              priority
            />
          </div>
        </Link>

        {/* Info Content Block */}
        <div className="p-6 xs:p-8 sm:p-10 pt-0 space-y-6 sm:space-y-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2 text-red-600">
              <Star className="h-3.5 w-3.5 sm:h-4 sm:w-4 fill-current" />
              <span className="text-[10px] font-black tracking-widest uppercase">Best in Class</span>
            </div>

            <Link href={`/products/${product.slug}`}>
              <h3 className="text-xl xs:text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-tight hover:text-red-600 transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Premium Specs Display */}
            <div className="flex flex-wrap gap-2 pt-1 sm:pt-2">
              <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <Zap className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />
                Performance
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-gray-50 border border-gray-100 rounded-lg text-[9px] sm:text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                <ShieldCheck className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-red-500" />
                Quality
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4 sm:gap-6 pt-4 border-t border-gray-50">
            <div className="flex flex-col">
              {hasDiscount && (
                <span className="text-xs sm:text-sm text-gray-400 line-through font-bold mb-0.5 sm:mb-1 opacity-60">
                  {formatPrice(originalPrice!)}
                </span>
              )}
              <span className="text-2xl xs:text-3xl font-black text-gray-900 tracking-tighter">
                {formatPrice(product.price)}
              </span>
            </div>

            <Button
              onClick={handleAddToCart}
              className="flex items-center gap-2.5 sm:gap-3 px-5 py-3 sm:px-8 sm:py-5 bg-red-600 text-white rounded-lg font-black uppercase tracking-[0.15em] text-[10px] sm:text-xs shadow-2xl shadow-red-600/30 hover:bg-red-700 hover:shadow-red-600/50 hover:-translate-y-1 transition-all duration-500 group/btn"
            >
              <span className="whitespace-nowrap">Quick Shop</span>
              <ShoppingCart className="h-3.5 w-3.5 sm:h-4 sm:w-4 group-hover/btn:rotate-12 transition-transform" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Decorative Shadow Elements */}
      <div className="absolute -bottom-6 inset-x-12 h-12 bg-gray-900/5 blur-3xl -z-10 rounded-full" />
    </div>
  );
}

/**
 * SubcategoryShowcase: A premium, modern section for 2026.
 * Focused on showcasing subcategories of a main category with a featured layout.
 */
export function SubcategoryShowcase({
  categories,
  productsByCategory,
  parentCategorySlug,
}: SubcategoryShowcaseProps) {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer for entrance animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Find the parent category
  const parentCategory = useMemo(() => {
    return categories.find((c) => c.slug === parentCategorySlug);
  }, [categories, parentCategorySlug]);

  // Find subcategories of this parent that contain more than 1 product
  const subCategories = useMemo(() => {
    if (!parentCategory) return [];
    return categories
      .filter((c) => c.parentId === parentCategory.id)
      .filter((c) => (productsByCategory[c.slug]?.length || 0) > 1)
      .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  }, [categories, parentCategory, productsByCategory]);

  const [activeSubSlug, setActiveSubSlug] = useState(() => {
    return subCategories.length > 0 ? subCategories[0].slug : "";
  });

  // Ensure active subcategory is valid if subCategories list changes
  useEffect(() => {
    if (subCategories.length > 0) {
      const isValid = subCategories.some((s) => s.slug === activeSubSlug);
      if (!isValid) {
        setActiveSubSlug(subCategories[0].slug);
      }
    }
  }, [subCategories, activeSubSlug]);

  const activeSubCategory = useMemo(() => {
    return subCategories.find((s) => s.slug === activeSubSlug);
  }, [subCategories, activeSubSlug]);

  const products = useMemo(() => {
    return productsByCategory[activeSubSlug] || [];
  }, [productsByCategory, activeSubSlug]);

  if (!parentCategory || subCategories.length === 0) return null;

  return (
    <Section
      ref={sectionRef}
      spacing="lg"
      className="relative overflow-hidden bg-transparent py-16"
    >
      {/* Premium Background elements */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 -right-24 w-[500px] h-[500px] bg-red-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-[400px] h-[400px] bg-primary-600/5 rounded-full blur-[100px] animate-pulse delay-1000" />
        <SparkleEffect count={12} className="opacity-30" isActive={isVisible} />
      </div>

      <Container>
        <div className="space-y-12">
          {/* Header Section */}
          <SectionHeader
            badge={{
              icon: LayoutGrid,
              text: "Department Spotlight",
            }}
            title={{
              italic: "Discover",
              bold: `The ${parentCategory.name} Series`,
            }}
            description={`A curated deep-dive into our premium ${parentCategory.name.toLowerCase()} collections. Switch between series below to explore specialized performance and design.`}
            actions={
              <Link
                href={`/products/category/${parentCategorySlug}`}
                className="group w-full md:w-auto flex items-center justify-center gap-2.5 sm:gap-3 lg:gap-2.5 px-4 py-2.5 sm:px-5 sm:py-2.5 lg:px-4 lg:py-2.5 bg-white/95 backdrop-blur-sm rounded-lg text-[10px] sm:text-sm lg:text-xs font-black uppercase tracking-widest text-gray-900 hover:bg-red-600 hover:text-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                <span>Full Experience</span>
                <ArrowRight className="h-3.5 w-3.5 lg:h-3 lg:w-3 group-hover:translate-x-1 transition-transform duration-500" />
              </Link>
            }
          />

          {/* Subcategory Navigation - 2026 Modern Pill style */}
          <div className="relative">
            <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {subCategories.map((sub, idx) => {
                const isActive = activeSubSlug === sub.slug;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubSlug(sub.slug)}
                    className={cn(
                      "group relative shrink-0 px-8 py-4 rounded-lg font-black transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform active:scale-95 overflow-hidden cursor-pointer",
                      isActive
                        ? "bg-gray-900 text-white shadow-2xl shadow-gray-900/20"
                        : "bg-white text-gray-400 hover:bg-red-600 hover:text-white border border-gray-100 hover:border-red-600 shadow-sm"
                    )}
                    style={{
                      animationDelay: `${idx * 100}ms`,
                    }}
                  >
                    <div className="flex items-center gap-3 relative z-10">
                      <span className="text-[10px] sm:text-[11px] tracking-[0.25em] uppercase">
                        {sub.name}
                      </span>
                      {isActive && <div className="h-1.5 w-1.5 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.8)]" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Featured Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
            {/* Primary Featured Display */}
            <div className="lg:col-span-5 xl:col-span-5">
              {products.length > 0 ? (
                <FeaturedProductDisplay product={products[0]} />
              ) : (
                <div className="aspect-[4/5] bg-gray-50/50 rounded-lg border-2 border-dashed border-gray-200 flex flex-col items-center justify-center p-8 text-center gap-4 h-full">
                  <div className="p-3 rounded-full bg-gray-100">
                    <Layers className="h-6 w-6 text-gray-300" />
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">Collection Empty</h4>
                    <p className="text-xs text-gray-500">Check back soon for new arrivals in this category.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Supporting Products Grid */}
            <div className="lg:col-span-7 xl:col-span-7">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {products.length > 1 ? (
                  products.slice(1, 5).map((product, idx) => (
                    <div
                      key={product.id}
                      className="group/item animate-in fade-in slide-in-from-bottom-8 duration-1000 max-w-[180px] sm:max-w-[200px]"
                      style={{ animationDelay: `${idx * 200}ms` }}
                    >
                      <ProductCard
                        product={product}
                        layout="vertical"
                        compact
                        className="transition-all duration-700 hover:-translate-y-2"
                      />
                    </div>
                  ))
                ) : (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="opacity-40">
                      <ProductCardSkeleton />
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

// Skeleton component extracted to separate server component file
// See: app/_components/SubcategoryShowcaseSkeleton.tsx
