"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { productRoutes } from "@/lib/routes";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { Badge } from "@/components/ui/badge";
import { SectionHeader as TechSectionHeader } from "@/components/shared/SectionHeader";
import { ProductCard } from "@/components/shared/ProductCard";
import type { Product, Category } from "@/features/products/types";
import { getProductImageWithPlaceholder } from "@/lib/utils/products";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";
import { ArrowRight, Sparkles, Zap, TrendingUp, Award } from "lucide-react";

interface CategorySpotlightProps {
  spotlightCategory?: {
    slug: string;
    name: string;
    description: string;
    products: Product[];
    accentColor?: string;
  };
  categories?: Category[];
  productsByCategory?: Record<string, Product[]>;
}

// Skeleton component extracted to separate server component file
// See: app/_components/CategorySpotlightSkeleton.tsx

export function CategorySpotlight({
  spotlightCategory,
  categories = [],
  productsByCategory = {},
}: CategorySpotlightProps) {
  // 1. Data Processing
  const defaultSpotlight = useMemo(
    () => ({
      slug: "gaming-laptops",
      name: "Gaming Laptops",
      description:
        "Elite performance hardware for the next generation of digital excellence.",
      products: [],
      accentColor: "#dc2626", // Strict Brand Red
    }),
    []
  );

  const initialCategory = spotlightCategory || defaultSpotlight;
  const [activeSlug, setActiveSlug] = useState(initialCategory.slug);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Find subcategories of the main spotlight category
  const subCategories = useMemo(() => {
    if (!categories.length) return [];

    // Find the parent category first
    const parent =
      categories.find((c) => c.slug === initialCategory.slug) ||
      categories.find((c) => c.slug === "laptops"); // Fallback

    if (!parent) return [];

    // Return children of this parent
    return categories.filter((c) => c.parentId === parent.id).slice(0, 6);
  }, [categories, initialCategory.slug]);

  // Handle category switch with animation feel
  const handleCategorySwitch = (slug: string) => {
    if (slug === activeSlug) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveSlug(slug);
      setIsTransitioning(false);
    }, 300);
  };

  const currentCategory = useMemo(() => {
    if (activeSlug === initialCategory.slug) return initialCategory;
    const found = categories.find((c) => c.slug === activeSlug);
    return found
      ? {
          ...found,
          name: found.name,
          slug: found.slug,
          description: found.description || "",
          products: productsByCategory[found.slug] || [],
        }
      : initialCategory;
  }, [activeSlug, initialCategory, categories, productsByCategory]);

  const categoryProducts = currentCategory.products || [];
  const featuredProduct = categoryProducts[0];
  const gridProducts = categoryProducts.slice(1, 5);

  const stats = [
    { label: "Performance", value: "99th Percentile", icon: Zap },
    { label: "Durability", value: "Mil-Spec Rated", icon: Award },
    { label: "Design", value: "Aesthetic Core", icon: TrendingUp },
  ];

  if (
    !featuredProduct &&
    gridProducts.length === 0 &&
    subCategories.length === 0
  ) {
    return null;
  }

  return (
    <Section className="bg-white relative overflow-hidden py-8 sm:py-24">
      {/* 2026 Minimalism: Depth & Light (Red/Gray only) */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Subtle high-tech radial gradients */}
        <div className="absolute top-[-10%] right-[-5%] w-[1000px] h-[1000px] bg-red-50/20 rounded-full blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-gray-50/40 rounded-full blur-[140px]" />

        {/* Procedural Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] grayscale invert"
          style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #000 1px, transparent 0)`,
            backgroundSize: "48px 48px",
          }}
        />

        {/* Floating tech lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-100 to-transparent" />
        <div className="absolute bottom-1/3 left-0 w-full h-px bg-linear-to-r from-transparent via-gray-100 to-transparent" />
      </div>

      <Container className="relative z-10">
        <div className="space-y-6 sm:space-y-12">
          {/* THE HUB HEADER */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 sm:gap-8 border-b border-gray-100 pb-4 sm:pb-8">
            <div className="max-w-2xl space-y-2 sm:space-y-4">
              <Badge variant="primary">
                <span className="w-1.5 h-1.5 bg-white animate-pulse rounded-full mr-1.5" />
                Tech Spotlight 2026
              </Badge>

              <h2 className="text-xl xs:text-3xl sm:text-6xl font-black text-gray-900 tracking-[-0.04em] leading-[0.95]">
                <span className="block opacity-20 text-gray-400">Premium</span>
                <span className="block">{currentCategory.name}</span>
              </h2>

              <p className="text-xs sm:text-lg text-gray-500 font-medium leading-relaxed max-w-lg line-clamp-2 sm:line-clamp-none">
                {currentCategory.description ||
                  "The intersection of raw power and sophisticated industrial design."}
              </p>
            </div>

            {/* Sub-category Intelligent Selector - Horizontal scroll on mobile */}
            {subCategories.length > 0 && (
              <div className="flex flex-nowrap overflow-x-auto sm:flex-wrap gap-1.5 p-1 bg-gray-50/50 backdrop-blur-2xl border border-gray-100 rounded-[16px] sm:rounded-[32px] scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-1.5">
                <Button
                  onClick={() => handleCategorySwitch(initialCategory.slug)}
                  variant={activeSlug === initialCategory.slug ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    "shrink-0 text-[10px] sm:text-sm font-black transition-all duration-500 active:scale-95",
                    activeSlug === initialCategory.slug
                      ? "shadow-2xl shadow-red-200"
                      : "text-gray-400 hover:bg-red-600 hover:text-white"
                  )}
                >
                  All Tech
                </Button>
                {subCategories.map((nav) => (
                  <Button
                    key={nav.id}
                    onClick={() => handleCategorySwitch(nav.slug)}
                    variant={activeSlug === nav.slug ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "shrink-0 text-[10px] sm:text-sm font-black transition-all duration-500 active:scale-95",
                      activeSlug === nav.slug
                        ? "shadow-2xl shadow-red-200"
                        : "text-gray-400 hover:bg-red-600 hover:text-white"
                    )}
                  >
                    {nav.name}
                  </Button>
                ))}
              </div>
            )}
          </div>

          {/* BENTO HUB LAYOUT */}
          <div
            className={cn(
              "grid lg:grid-cols-12 gap-5 sm:gap-10 transition-all duration-500",
              isTransitioning
                ? "opacity-0 translate-y-4 scale-[0.98]"
                : "opacity-100 translate-y-0 scale-100"
            )}
          >
            {/* 01. THE MONOLITH (Featured Card) */}
            {featuredProduct && (
              <div className="lg:col-span-6 xl:col-span-5 h-full">
                <div className="group relative h-full flex flex-col bg-gray-900 rounded-lg overflow-hidden transition-all duration-700 hover:shadow-[0_40px_80px_-15px_rgba(220,38,38,0.15)] min-w-0">
                  {/* High-tech overlay effects */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(220,38,38,0.15),transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />

                  <div className="relative aspect-square sm:aspect-auto sm:h-[350px] md:h-[400px] flex items-center justify-center p-4 xs:p-8 sm:p-16">
                    {/* Animated aura */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent_60%)] group-hover:scale-150 transition-transform duration-1000" />

                    <Image
                      src={getProductImageWithPlaceholder(featuredProduct)}
                      alt={featuredProduct.name}
                      fill
                      className="object-contain transition-all duration-1000 ease-[cubic-bezier(0.23,1,0.32,1)] sm:group-hover:scale-110 sm:group-hover:-rotate-2 drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)]"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />

                    {/* Tech Data Points */}
                    <div className="absolute top-3 right-3 sm:top-12 sm:right-12 text-right">
                      <div className="text-[7px] font-black text-red-500 uppercase tracking-widest mb-0.5 sm:mb-1">
                        Status
                      </div>
                      <div className="text-[9px] sm:text-sm font-bold text-white">
                        In High Demand
                      </div>
                    </div>
                  </div>

                  <div className="p-4 xs:p-8 sm:p-12 xl:p-16 flex flex-col flex-1 relative z-10 min-w-0">
                    <div className="space-y-1.5 sm:space-y-4 mb-4 sm:mb-12 min-w-0">
                      <h3 className="text-lg xs:text-3xl xl:text-5xl font-black text-white leading-[0.9] tracking-tighter truncate">
                        {featuredProduct.name}
                      </h3>
                      <p className="text-gray-400 text-[10px] sm:text-lg leading-relaxed max-w-md italic line-clamp-2">
                        &quot;
                        {featuredProduct.description ||
                          currentCategory.description}
                        &quot;
                      </p>
                    </div>

                    {/* Stats HUD - Hidden on very small mobiles */}
                    <div className="hidden xs:grid grid-cols-3 gap-2 sm:gap-4 mb-4 sm:mb-12">
                      {stats.map((s, i) => (
                        <div
                          key={i}
                          className="space-y-0.5 sm:space-y-2 min-w-0"
                        >
                          <s.icon className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />
                          <div className="text-[7px] sm:text-[9px] font-black text-gray-500 uppercase tracking-widest truncate">
                            {s.label}
                          </div>
                          <div className="text-[9px] sm:text-xs font-bold text-white truncate">
                            {s.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-2 sm:gap-8 pt-3 sm:pt-10 border-t border-white/10 min-w-0">
                      <div className="space-y-0.5 sm:space-y-1 min-w-0">
                        <div className="text-[6px] sm:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] truncate">
                          Acquisition
                        </div>
                        <div className="text-base xs:text-2xl sm:text-4xl font-black text-white tracking-tighter truncate">
                          {formatPrice(featuredProduct.price)}
                        </div>
                      </div>
                      <Button
                        asChild
                        className="bg-white hover:bg-red-600 text-gray-900 hover:text-white rounded-lg px-3 sm:px-12 h-9 sm:h-20 text-xs sm:text-xl font-black transition-all duration-500 hover:scale-105 active:scale-95 shadow-2xl shrink-0"
                      >
                        <Link href={productRoutes.detail(featuredProduct.slug)}>
                          Explore
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 02. THE CLUSTER (Secondary Products) */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col gap-5 sm:gap-10">
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-4 sm:gap-8">
                {gridProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className={cn(
                      "group relative bg-white rounded-lg border border-gray-100 p-4 sm:p-8 transition-all duration-500 hover:border-red-600/20 hover:shadow-2xl hover:shadow-gray-100 min-w-0",
                      index % 2 === 1
                        ? "xs:translate-y-6 sm:translate-y-12"
                        : ""
                    )}
                  >
                    <div className="absolute top-4 right-4 sm:top-8 sm:right-8 w-1 h-1 sm:w-2 sm:h-2 rounded-full bg-gray-100 group-hover:bg-red-600 transition-colors duration-500" />
                    <ProductCard product={product} layout="vertical" />
                  </div>
                ))}
              </div>

              {/* 03. THE MASTER CTA */}
              <Link
                href={`/products?category=${currentCategory.slug}`}
                className="mt-auto group relative h-20 sm:h-40 rounded-lg bg-gray-50 border border-gray-100 overflow-hidden flex items-center px-4 sm:px-12 transition-all duration-700 hover:bg-white hover:border-red-600/30 hover:scale-[1.02] min-w-0"
              >
                <div className="absolute top-0 left-0 w-1 h-full bg-red-600 scale-y-0 group-hover:scale-y-100 transition-transform duration-700 origin-top" />

                <div className="relative z-10 flex-1 min-w-0">
                  <div className="text-[7px] sm:text-[10px] font-black text-red-600 uppercase tracking-[0.2em] sm:tracking-[0.3em] mb-1 sm:mb-2 truncate">
                    Full Collection
                  </div>
                  <h4 className="text-base xs:text-2xl sm:text-3xl font-black text-gray-900 tracking-tighter group-hover:translate-x-2 transition-transform duration-500 truncate">
                    Discover All {currentCategory.name} &rarr;
                  </h4>
                </div>

                <div className="hidden xs:block text-gray-300 font-black text-4xl sm:text-7xl absolute right-4 sm:right-12 opacity-10 group-hover:opacity-20 transition-opacity select-none truncate">
                  {currentCategory.name.split(" ")[0]}
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
