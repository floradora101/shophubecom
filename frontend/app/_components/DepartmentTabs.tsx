// DepartmentTabs: Consistent grid layout across all departments
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { productRoutes } from "@/lib/routes";
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
import { NavigationButton } from "@/components/ui/navigation-button";
import { ProductCard } from "@/components/shared/ProductCard";
import { ProductCardSkeleton } from "@/components/shared/ProductCardSkeleton";
import { SectionHeader, SectionTitle } from "@/components/shared/SectionHeader";
import type { Product, Category } from "@/features/products/types";
import type { Department } from "@/features/departments";
import { getDiscountInfo } from "@/lib/utils/products";
import { SparkleEffect } from "@/components/ui/SparkleEffect";
import { useHeroRunCounter } from "@/lib/hooks/use-hero-run-counter";

interface DepartmentTabsProps {
  categories: Category[];
  productsByCategory: Record<string, Product[]>;
  /** When provided, tabs are driven by active departments from admin (overrides category + departmentConfig filter). */
  departments?: Department[];
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

/** Default config for departments whose parent category slug is not in departmentConfig */
const defaultDepartmentConfig = {
  icon: Grid3X3,
  gradient: "from-primary-500 to-primary-600",
  bgGradient: "from-primary-50 to-primary-100",
  description: "Explore this collection",
  tagline: "Shop the collection",
};

// Skeleton component extracted to separate server component file
// See: app/_components/DepartmentTabsSkeleton.tsx

export function DepartmentTabs({
  categories,
  productsByCategory,
  departments = [],
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

  // Use all main (root) categories for "Shop by Category" so every main category
  // appears as a tab with latest products from it and its subcategories.
  const mainCategories = useMemo(() => {
    const safeCategories = Array.isArray(categories) ? categories : [];
    const roots = safeCategories
      .filter((c) => !c.parentId || c.parentId === null)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    return roots.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      parentId: c.parentId,
    }));
  }, [categories]);

  const [activeTab, setActiveTab] = useState(() => {
    return mainCategories.length > 0 ? mainCategories[0].slug : "";
  });

  // Track tab changes for animation re-triggering
  const { run, animationKey } = useHeroRunCounter(isVisible);
  const { run: tabRun, animationKey: tabAnimationKey } = useHeroRunCounter(
    !!activeTab
  );

  const activeConfig =
    departmentConfig[activeTab] || defaultDepartmentConfig;

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

  // Empty state: section is always visible so admins know where departments will show
  if (mainCategories.length === 0) {
    return (
      <Section
        ref={sectionRef}
        spacing="md"
        className="relative overflow-hidden bg-transparent py-16 md:py-24"
      >
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px] animate-pulse" />
        </div>
        <Container className="relative z-10">
          <SectionHeader
            badge={{ icon: Grid3X3, text: "Explore Collections" }}
            title={{ italic: "Shop by", bold: "Category" }}
            description="Discover curated collections tailored to your lifestyle"
          />
          <div className="rounded-lg border border-dashed border-warm-gray-300 bg-warm-gray-50/50 p-8 text-center">
            <p className="text-warm-gray-600 text-sm font-medium">
              No departments to show yet. Add and activate departments in{" "}
              <Link href="/admin/subcategories" className="text-primary-600 underline hover:no-underline">
                Admin → Subcategories
              </Link>{" "}
              to see them here.
            </p>
          </div>
        </Container>
      </Section>
    );
  }

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
          <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto sm:overflow-x-visible sm:justify-center gap-2 sm:gap-2.5 lg:gap-2 pb-6 px-4 sm:px-0 -mx-4 sm:mx-0 scrollbar-hide hero-item-enter hero-headline">
            {mainCategories.map((category, idx) => {
              const config =
                departmentConfig[category.slug] || defaultDepartmentConfig;
              const Icon = config.icon;
              const isActive = activeTab === category.slug;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.slug)}
                  className={`group relative shrink-0 px-4 sm:px-5 lg:px-4 py-2 sm:py-2.5 lg:py-2 rounded-lg font-black transition-all duration-500 ease-out transform hover:scale-[1.05] active:scale-95 ${
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
                  <div className="flex items-center gap-2 sm:gap-2.5 lg:gap-2">
                    <Icon
                      className={`h-4 w-4 sm:h-5 sm:w-5 lg:h-4 lg:w-4 transition-all duration-700 ${
                        isActive
                          ? "scale-110 rotate-12"
                          : "group-hover:scale-110 group-hover:-rotate-6"
                      }`}
                    />
                    <span className="text-[10px] sm:text-sm lg:text-xs tracking-widest uppercase font-black">
                      {category.name}
                    </span>
                    {isActive && (
                      <Sparkles className="h-3.5 w-3.5 lg:h-3 lg:w-3 animate-pulse text-white/90" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Department Info Banner - Staggered Entrance */}
          <div
            className={`relative overflow-hidden rounded-lg p-4 sm:p-6 lg:p-4 bg-linear-to-r ${activeConfig.bgGradient} border border-white/20 transition-all duration-700 ease-in-out shadow-lg hero-item-enter hero-description`}
            style={{ animationDelay: "300ms" }}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-5 lg:gap-4">
              <div className="flex items-center gap-3 sm:gap-4 lg:gap-3 w-full md:w-auto">
                <div
                  className={`p-2.5 sm:p-3 lg:p-2.5 rounded-lg bg-linear-to-br ${activeConfig.gradient} shadow-2xl shadow-primary-500/20`}
                >
                  <activeConfig.icon className="h-5 w-5 sm:h-7 sm:w-7 lg:h-6 lg:w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-base sm:text-xl lg:text-lg font-black text-gray-900 mb-0.5 sm:mb-1 tracking-tight">
                    {activeConfig.tagline}
                  </h3>
                  <p className="text-xs sm:text-sm lg:text-xs text-gray-600 font-medium opacity-80 line-clamp-1 sm:line-clamp-none">
                    {activeConfig.description}
                  </p>
                </div>
              </div>
              <Link
                href={productRoutes.category(activeTab)}
                className="group w-full md:w-auto flex items-center justify-center gap-2.5 sm:gap-3 lg:gap-2.5 px-4 py-2.5 sm:px-5 sm:py-2.5 lg:px-4 lg:py-2.5 bg-white/95 backdrop-blur-sm rounded-lg text-[10px] sm:text-sm lg:text-xs font-black uppercase tracking-widest text-gray-900 hover:bg-red-600 hover:text-white hover:shadow-2xl transition-all duration-500 hover:-translate-y-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5 lg:h-3 lg:w-3 group-hover:translate-x-1 transition-transform duration-500" />
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
