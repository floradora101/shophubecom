// DepartmentTabs: Consistent grid layout across all departments
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Zap,
  Gamepad2,
  Package,
  Grid3X3,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { NavigationButton } from "@/components/ui/navigation-button";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductCardSkeleton } from "@/features/products/components/ProductCardSkeleton";
import { SectionHeader, SectionTitle } from "./shared/section-header";
import type { Product, Category } from "@/features/products/types";
import { getDiscountInfo } from "@/lib/utils/products";
import { SparkleEffect } from "./hero/shared/SparkleEffect";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";

interface DepartmentTabsProps {
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
}

// Constant: Same number of cards for every tab
const COUNT = 8;

// Department configurations with icons, colors, and descriptions
const departmentConfig: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    gradient: string;
    bgGradient: string;
    description: string;
    tagline: string;
  }
> = {
  phones: {
    icon: Smartphone,
    gradient: "from-primary-500 to-primary-600",
    bgGradient: "from-primary-50 to-primary-100",
    description: "Latest smartphones and mobile technology",
    tagline: "Stay Connected",
  },
  tablets: {
    icon: Tablet,
    gradient: "from-primary-600 to-primary-700",
    bgGradient: "from-primary-50 to-primary-100",
    description: "Powerful tablets for work and entertainment",
    tagline: "Portable Power",
  },
  laptops: {
    icon: Laptop,
    gradient: "from-primary-500 to-primary-600",
    bgGradient: "from-primary-50 to-primary-100",
    description: "High-performance laptops for every need",
    tagline: "Unleash Productivity",
  },
  wearables: {
    icon: Watch,
    gradient: "from-primary-600 to-primary-700",
    bgGradient: "from-primary-50 to-primary-100",
    description: "Wearable technology and accessories",
    tagline: "Tech on Your Wrist",
  },
  "smart-gadgets": {
    icon: Zap,
    gradient: "from-primary-500 to-primary-600",
    bgGradient: "from-primary-50 to-primary-100",
    description: "Smart home devices and gadgets",
    tagline: "Smart Living",
  },
  "gaming-console": {
    icon: Gamepad2,
    gradient: "from-primary-600 to-primary-700",
    bgGradient: "from-primary-50 to-primary-100",
    description: "Gaming consoles and accessories",
    tagline: "Game On",
  },
  accessories: {
    icon: Package,
    gradient: "from-primary-500 to-primary-600",
    bgGradient: "from-primary-50 to-primary-100",
    description: "Device cases, bags, and protection",
    tagline: "Complete Your Setup",
  },
};

/**
 * Skeleton loader for DepartmentTabs component
 * Shows tab navigation skeleton and product grid skeleton
 */
export function DepartmentTabsSkeleton() {
  return (
    <Section spacing="md" className="relative overflow-hidden bg-transparent">
      <Container className="relative z-10">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-center md:text-left space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600/10 mb-2">
                <SkeletonBlock className="h-4 w-4 rounded" />
                <SkeletonBlock className="h-4 w-32 rounded" />
              </div>
              <SkeletonBlock className="h-10 w-80 rounded" />
              <SkeletonBlock className="h-5 w-96 rounded" />
            </div>
          </div>

          {/* Enhanced Tabs with Icons */}
          <div className="flex flex-nowrap sm:flex-wrap justify-start sm:justify-center gap-2.5 pb-4 overflow-x-auto sm:overflow-x-visible scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
            {Array.from({ length: 7 }, (_, i) => (
              <div
                key={i}
                className="shrink-0 flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg border border-gray-200"
              >
                <SkeletonBlock className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded" />
                <SkeletonBlock className="h-3.5 sm:h-4 w-16 sm:w-20 rounded" />
              </div>
            ))}
          </div>

          {/* Department Info Banner Skeleton */}
          <div className="relative overflow-hidden rounded-lg p-5 sm:p-6 bg-linear-to-r from-gray-50 to-gray-100 border border-white/20">
            <div className="flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <SkeletonBlock className="p-2.5 rounded-lg w-10 h-10 shrink-0" />
                <div className="flex-1">
                  <SkeletonBlock className="h-5 w-32 mb-1" />
                  <SkeletonBlock className="h-4 w-full sm:w-48" />
                </div>
              </div>
              <SkeletonBlock className="w-full sm:w-20 h-10 sm:h-8 rounded-lg mt-2 sm:mt-0" />
            </div>
            {/* Subtle decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Content - Grid layout only, consistent across all tabs */}
          <div className="min-h-[350px] transition-all duration-300 ease-in-out">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 animate-fade-in">
              {Array.from({ length: 8 }, (_, index) => (
                <ProductCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function DepartmentTabs({
  categories,
  productsByCategory,
}: DepartmentTabsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Intersection Observer to trigger entrance animations
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

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // Filter to only show main categories (parent categories) that are configured in departmentConfig
  const mainCategories = useMemo(() => {
    const safeCategories = Array.isArray(categories) ? categories : [];
    return safeCategories.filter(
      (category) =>
        (!category.parentId || category.parentId === null) &&
        category.slug in departmentConfig
    );
  }, [categories]);

  const [activeTab, setActiveTab] = useState(() => {
    return mainCategories.length > 0 ? mainCategories[0].slug : "";
  });

  // Track tab changes for animation re-triggering
  const { run, animationKey } = useHeroRunCounter(isVisible);
  const { run: tabRun, animationKey: tabAnimationKey } = useHeroRunCounter(
    !!activeTab
  );

  const activeConfig = departmentConfig[activeTab] || departmentConfig.phones;

  // Build fallback pool from all products across categories (excluding current category)
  const fallbackPool = useMemo(() => {
    const allProducts: Product[] = [];
    const seenIds = new Set<string>();

    Object.entries(productsByCategory).forEach(([slug, products]) => {
      if (slug !== activeTab) {
        products.forEach((product) => {
          if (!seenIds.has(product.id)) {
            seenIds.add(product.id);
            allProducts.push(product);
          }
        });
      }
    });

    return allProducts;
  }, [productsByCategory, activeTab]);

  // Select products: prioritize featured, then discounted, then newest
  const selectedProducts = useMemo(() => {
    if (!activeTab || !productsByCategory[activeTab]) {
      return [];
    }

    const categoryProducts = productsByCategory[activeTab] || [];
    const selectedIds = new Set<string>();
    const selected: Product[] = [];

    // Helper to get discount percentage using utility function
    const getDiscount = (p: Product): number => {
      const { discountPercent } = getDiscountInfo(p);
      return discountPercent;
    };

    // Sort: featured first, then by discount (desc), then by createdAt (desc)
    const sorted = [...categoryProducts].sort((a, b) => {
      // Featured products first
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;

      // Then by discount
      const discountA = getDiscount(a);
      const discountB = getDiscount(b);
      if (discountB !== discountA) return discountB - discountA;

      // Then by newest
      if (a.createdAt && b.createdAt) {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      }
      return 0;
    });

    // Take up to COUNT products from category
    for (const product of sorted) {
      if (selected.length >= COUNT) break;
      selected.push(product);
      selectedIds.add(product.id);
    }

    // Fill from fallback pool if needed
    if (selected.length < COUNT && fallbackPool.length > 0) {
      const fallbackSorted = [...fallbackPool]
        .filter((p) => !selectedIds.has(p.id))
        .sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          const discountA = getDiscount(a);
          const discountB = getDiscount(b);
          if (discountB !== discountA) return discountB - discountA;
          if (a.createdAt && b.createdAt) {
            return (
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );
          }
          return 0;
        });

      const needed = COUNT - selected.length;
      selected.push(...fallbackSorted.slice(0, needed));
    }

    return selected.slice(0, COUNT);
  }, [productsByCategory, activeTab, fallbackPool]);

  // Calculate how many skeletons we need
  const skeletonCount = Math.max(0, COUNT - selectedProducts.length);

  return (
    <Section
      ref={sectionRef}
      spacing="md"
      className="relative overflow-hidden bg-transparent py-16 md:py-24"
    >
      {/* Background Enhancements to match Hero Slides */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-primary-600/5 rounded-full blur-[100px] animate-pulse delay-700" />
        <SparkleEffect count={15} className="opacity-40" isActive={isVisible} />
      </div>

      <Container className="relative z-10">
        <div className="space-y-8" data-run={run} key={animationKey}>
          <SectionHeader
            badge={{
              icon: Grid3X3,
              text: "Explore Collections",
            }}
            title={{
              italic: "Shop by",
              bold: "Category",
            }}
            description="Discover curated collections tailored to your lifestyle"
          />

          {/* Enhanced Tabs with Staggered Entrance - Horizontal scroll on mobile */}
          <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto sm:overflow-x-visible sm:justify-center gap-2.5 sm:gap-3 pb-6 px-4 sm:px-0 -mx-4 sm:mx-0 scrollbar-hide hero-item-enter hero-headline">
            {mainCategories.map((category, idx) => {
              const config =
                departmentConfig[category.slug] || departmentConfig.phones;
              const Icon = config.icon;
              const isActive = activeTab === category.slug;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.slug)}
                  className={`group relative shrink-0 px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg font-black transition-all duration-500 ease-out transform hover:scale-[1.05] active:scale-95 ${
                    isActive
                      ? "bg-linear-to-r from-red-600 via-red-700 to-red-800 text-white shadow-2xl shadow-red-500/30 border border-white/20"
                      : "bg-white/90 backdrop-blur-md text-gray-600 hover:bg-red-600 hover:text-white border border-gray-100 hover:border-red-600 shadow-sm hover:shadow-xl"
                  }`}
                  style={{
                    animationDelay: `${idx * 50}ms`,
                  }}
                  aria-selected={isActive}
                  role="tab"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3">
                    <Icon
                      className={`h-4 w-4 sm:h-5 sm:w-5 transition-all duration-700 ${
                        isActive
                          ? "scale-110 rotate-12"
                          : "group-hover:scale-110 group-hover:-rotate-6"
                      }`}
                    />
                    <span className="text-[10px] sm:text-sm tracking-widest uppercase font-black">
                      {category.name}
                    </span>
                    {isActive && (
                      <Sparkles className="h-3.5 w-3.5 animate-pulse text-white/90" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Department Info Banner - Staggered Entrance */}
          <div
            className={`relative overflow-hidden rounded-lg p-5 sm:p-8 bg-linear-to-r ${activeConfig.bgGradient} border border-white/20 transition-all duration-700 ease-in-out shadow-lg hero-item-enter hero-description`}
            style={{ animationDelay: "300ms" }}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
              <div className="flex items-center gap-4 sm:gap-5 w-full md:w-auto">
                <div
                  className={`p-3 sm:p-4 rounded-lg bg-linear-to-br ${activeConfig.gradient} shadow-2xl shadow-primary-500/20`}
                >
                  <activeConfig.icon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-2xl font-black text-gray-900 mb-0.5 sm:mb-1 tracking-tight">
                    {activeConfig.tagline}
                  </h3>
                  <p className="text-xs sm:text-base text-gray-600 font-medium opacity-80 line-clamp-1 sm:line-clamp-none">
                    {activeConfig.description}
                  </p>
                </div>
              </div>
              <Link
                href={`/products/category/${activeTab}`}
                className="group w-full md:w-auto flex items-center justify-center gap-3 px-5 py-3 sm:px-6 sm:py-3 bg-white/95 backdrop-blur-sm rounded-lg text-[10px] sm:text-sm font-black uppercase tracking-widest text-gray-900 hover:bg-red-600 hover:text-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform duration-500" />
              </Link>
            </div>
            {/* Subtle decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Content - Horizontal Scroll Slider with Tab-based Stagger */}
          <div
            role="tabpanel"
            className="min-h-[350px] sm:min-h-[400px] transition-all duration-500 ease-in-out relative group/carousel"
            key={tabAnimationKey}
            data-run={tabRun}
          >
            <div className="hidden md:block">
              <NavigationButton
                variant="primary"
                direction="left"
                onClick={() => scroll("left")}
                aria-label="Scroll left"
                className="absolute left-0 top-[40%] -translate-y-1/2 z-20 transition-all duration-300 hover:scale-110 shadow-xl bg-red-600 text-white border-red-500 hover:bg-red-700"
              />
              <NavigationButton
                variant="primary"
                direction="right"
                onClick={() => scroll("right")}
                aria-label="Scroll right"
                className="absolute right-0 top-[40%] -translate-y-1/2 z-20 transition-all duration-300 hover:scale-110 shadow-xl bg-red-600 text-white border-red-500 hover:bg-red-700"
              />
            </div>

            <div
              ref={scrollRef}
              className="flex gap-4 sm:gap-6 overflow-x-auto pb-8 scrollbar-hide scroll-smooth -mx-4 px-4 sm:mx-0 sm:px-0"
            >
              {selectedProducts.map((product, index) => (
                <div
                  key={`${activeTab}-${product.id}`}
                  className="shrink-0 w-[240px] sm:w-[280px] hero-item-enter"
                  style={{
                    animationDelay: `${(index % 8) * 100}ms`,
                  }}
                >
                  <ProductCard product={product} layout="vertical" />
                </div>
              ))}
              {/* Render skeleton placeholders to maintain layout */}
              {Array.from({ length: skeletonCount }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="shrink-0 w-[240px] sm:w-[280px] opacity-40"
                >
                  <ProductCardSkeleton />
                </div>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
