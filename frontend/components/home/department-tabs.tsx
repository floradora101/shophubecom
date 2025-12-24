// DepartmentTabs: Consistent grid layout across all departments
"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Laptop,
  Shirt,
  Home,
  BookOpen,
  Sparkles,
  ArrowRight,
  Zap,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import type { Product, Category } from "@/features/products/types";

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
  electronics: {
    icon: Laptop,
    gradient: "from-blue-500 to-purple-600",
    bgGradient: "from-blue-50 to-purple-50",
    description: "Cutting-edge technology and innovation",
    tagline: "Tech That Transforms",
  },
  clothing: {
    icon: Shirt,
    gradient: "from-pink-500 to-rose-600",
    bgGradient: "from-pink-50 to-rose-50",
    description: "Style that speaks your language",
    tagline: "Fashion Forward",
  },
  "home-garden": {
    icon: Home,
    gradient: "from-green-500 to-emerald-600",
    bgGradient: "from-green-50 to-emerald-50",
    description: "Transform your living space",
    tagline: "Home Sweet Home",
  },
  books: {
    icon: BookOpen,
    gradient: "from-amber-500 to-orange-600",
    bgGradient: "from-amber-50 to-orange-50",
    description: "Stories that inspire and educate",
    tagline: "Read. Learn. Grow.",
  },
};

export function DepartmentTabs({
  categories,
  productsByCategory,
}: DepartmentTabsProps) {
  // Filter to only show main categories (parent categories) that are configured in departmentConfig
  const mainCategories = useMemo(() => {
    const safeCategories = Array.isArray(categories) ? categories : [];
    return safeCategories.filter(
      (category) =>
        (!category.parentId || category.parentId === null) &&
        category.slug in departmentConfig
    );
  }, [categories]);

  const [activeTab, setActiveTab] = useState(mainCategories[0]?.slug || "");

  const activeConfig =
    departmentConfig[activeTab] || departmentConfig.electronics;

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

    // Helper to get discount percentage
    const getDiscount = (p: Product): number => {
      if (p.discount?.discountPercent) return p.discount.discountPercent;
      if (p.discountValue) return p.discountValue;
      if (p.discountPercent) return p.discountPercent;
      if (p.originalPrice && p.originalPrice > p.price) {
        return ((p.originalPrice - p.price) / p.originalPrice) * 100;
      }
      return 0;
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
    <Section spacing="md" className="relative overflow-hidden bg-transparent">
      <Container className="relative z-10">
        <div className="space-y-6">
          {/* Header - Typography set once at container level */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="text-center md:text-left space-y-4 flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-100 via-primary-100 to-primary-200 mb-2">
                <Sparkles className="h-4 w-4 text-primary-600" />
                <span className="text-sm font-semibold text-primary-700 font-[var(--font-poppins)]">
                  Explore Collections
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl text-gray-900 leading-tight">
                <span className="font-[var(--font-playfair)] font-bold italic">
                  Shop by
                </span>
                <span className="font-[var(--font-poppins)] font-bold text-primary-600 ml-2">
                  Department
                </span>
              </h2>
              <p className="text-gray-600 max-w-2xl text-lg font-[var(--font-inter)] font-light leading-relaxed">
                Discover curated collections tailored to your lifestyle
              </p>
            </div>
          </div>

          {/* Enhanced Tabs with Icons */}
          <div className="flex flex-wrap justify-center gap-2.5 pb-4">
            {mainCategories.map((category) => {
              const config =
                departmentConfig[category.slug] || departmentConfig.electronics;
              const Icon = config.icon;
              const isActive = activeTab === category.slug;

              return (
                <button
                  key={category.id}
                  onClick={() => setActiveTab(category.slug)}
                  className={`group relative px-5 py-2.5 rounded-xl font-medium transition-all duration-300 ease-in-out transform hover:scale-[1.02] ${
                    isActive
                      ? `bg-gradient-to-r ${config.gradient} text-white shadow-md scale-[1.02]`
                      : "bg-white text-gray-700 hover:text-gray-900 border border-gray-200 hover:border-gray-300 shadow-sm hover:shadow-sm"
                  }`}
                  aria-selected={isActive}
                  role="tab"
                >
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`h-4 w-4 transition-transform duration-300 ${
                        isActive ? "scale-105" : "group-hover:scale-105"
                      }`}
                    />
                    <span className="text-sm">{category.name}</span>
                    {isActive && <Zap className="h-3.5 w-3.5 animate-pulse" />}
                  </div>
                  {isActive && (
                    <div className="absolute -bottom-0.5 left-1/2 transform -translate-x-1/2 w-8 h-0.5 bg-white rounded-full" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Department Info Banner */}
          <div
            className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-r ${activeConfig.bgGradient} border border-white/20 transition-all duration-500 ease-in-out`}
          >
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl bg-gradient-to-br ${activeConfig.gradient} shadow-md`}
                >
                  <activeConfig.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-0.5">
                    {activeConfig.tagline}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {activeConfig.description}
                  </p>
                </div>
              </div>
              <Link
                href={`/products/category/${activeTab}`}
                className="group flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-lg text-sm font-medium text-gray-900 hover:bg-white hover:shadow-md transition-all duration-300 ease-in-out"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform duration-300" />
              </Link>
            </div>
            {/* Subtle decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2" />
          </div>

          {/* Content - Grid layout only, consistent across all tabs */}
          <div
            role="tabpanel"
            className="min-h-[350px] transition-all duration-300 ease-in-out"
            key={activeTab}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
              {selectedProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
              {/* Render skeleton placeholders to maintain grid shape */}
              {Array.from({ length: skeletonCount }).map((_, index) => (
                <ProductCardSkeleton key={`skeleton-${index}`} />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
