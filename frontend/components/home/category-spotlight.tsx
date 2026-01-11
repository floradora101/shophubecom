"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { SectionHeader as TechSectionHeader } from "./shared/section-header";
import { ProductCard } from "@/features/products/components/ProductCard";
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
}

/**
 * Skeleton loader for Category Spotlight component
 * Updated for the new 2026 Bento layout
 */
export function CategorySpotlightSkeleton() {
  return (
    <Section className="bg-white relative overflow-hidden py-24">
      <Container>
        <div className="space-y-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6">
            <div className="space-y-4">
              <SkeletonBlock className="h-8 w-48 rounded-full" />
              <SkeletonBlock className="h-12 w-96 rounded-xl" />
            </div>
            <div className="flex gap-2">
              {[1, 2, 3].map((i) => (
                <SkeletonBlock key={i} className="h-10 w-28 rounded-full" />
              ))}
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8">
            <SkeletonBlock className="lg:col-span-5 h-[600px] rounded-[32px]" />
            <div className="lg:col-span-7 grid grid-cols-2 gap-6">
              {[1, 2, 4].map((i) => (
                <SkeletonBlock key={i} className="h-[280px] rounded-[32px]" />
              ))}
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function CategorySpotlight({
  spotlightCategory,
  categories = [],
}: CategorySpotlightProps) {
  // 1. Determine active category and its siblings/children for dynamic navigation
  const defaultSpotlight = useMemo(
    () => ({
      slug: "gaming-laptops",
      name: "Gaming Laptops",
      description: "High-performance laptops built for gaming excellence",
      products: [],
      accentColor: "#dc2626", // Strict Red
    }),
    []
  );

  const initialCategory = spotlightCategory || defaultSpotlight;
  const [activeSlug, setActiveSlug] = useState(initialCategory.slug);

  // Find subcategories if the spotlighted one is a parent, or find siblings if it's a child
  const dynamicNav = useMemo(() => {
    if (!categories.length) return [];

    const current = categories.find((c) => c.slug === activeSlug);
    if (!current) return [];

    // If it's a parent, show children. If it's a child, show siblings.
    if (!current.parentId) {
      return categories.filter((c) => c.parentId === current.id).slice(0, 5);
    } else {
      return categories
        .filter((c) => c.parentId === current.parentId)
        .slice(0, 5);
    }
  }, [categories, activeSlug]);

  const category = useMemo(() => {
    if (activeSlug === initialCategory.slug) return initialCategory;
    const found = categories.find((c) => c.slug === activeSlug);
    return found
      ? {
          ...found,
          products: [],
          accentColor: "#dc2626",
          description: found.description || "",
        }
      : initialCategory;
  }, [activeSlug, initialCategory, categories]);

  const categoryProducts = category.products || [];
  const featuredProduct = categoryProducts[0];
  const gridProducts = categoryProducts.slice(1, 7);

  const highlights = [
    { icon: Zap, label: "Performance", value: "Next-Gen" },
    { icon: TrendingUp, label: "Demand", value: "High" },
    { icon: Award, label: "Quality", value: "Premium" },
  ];

  if (!featuredProduct && gridProducts.length === 0 && !dynamicNav.length) {
    return null;
  }

  return (
    <Section className="bg-white relative overflow-hidden py-24 sm:py-32">
      {/* 2026 High-Tech Background Elements (Strict Red/Gray) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-50/30 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gray-50/50 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[40px_40px]" />
      </div>

      <Container className="relative z-10">
        <div className="space-y-16">
          {/* Dynamic Navigation & Header Cluster */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10">
            <div className="flex-1">
              <TechSectionHeader
                badge={{
                  icon: Sparkles,
                  text: "Exclusive Discovery",
                  gradient: "from-red-50 via-red-100 to-red-50",
                }}
                title={{
                  italic: "Spotlight",
                  bold: category.name,
                }}
                description={
                  category.description ||
                  "Experience the pinnacle of modern technology with our curated selections."
                }
              />
            </div>

            {/* Dynamic Sub-Category Glass Pills */}
            {dynamicNav.length > 0 && (
              <div className="flex flex-wrap gap-2 p-2 bg-gray-50/80 backdrop-blur-xl border border-gray-100 rounded-[28px] shadow-sm">
                {dynamicNav.map((nav) => (
                  <button
                    key={nav.id}
                    onClick={() => setActiveSlug(nav.slug)}
                    className={cn(
                      "px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 active:scale-95",
                      activeSlug === nav.slug
                        ? "bg-red-600 text-white shadow-lg shadow-red-200"
                        : "text-gray-500 hover:text-gray-900 hover:bg-white"
                    )}
                  >
                    {nav.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Bento Grid 2026 Layout */}
          <div className="grid lg:grid-cols-12 gap-8">
            {/* LARGE FEATURED CARD (5 Cols) */}
            {featuredProduct && (
              <div className="lg:col-span-5 h-full">
                <div className="group relative h-full flex flex-col bg-white rounded-[40px] border border-gray-100 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-700 overflow-hidden">
                  {/* Decorative Red Accent */}
                  <div className="absolute top-0 left-0 w-full h-1 bg-linear-to-r from-red-600 to-red-400" />

                  <div className="relative aspect-square bg-gray-50/50 overflow-hidden flex items-center justify-center p-12">
                    <Image
                      src={getProductImageWithPlaceholder(featuredProduct)}
                      alt={featuredProduct.name}
                      fill
                      className="object-contain p-12 group-hover:scale-110 transition-transform duration-1000 ease-out"
                      sizes="(max-width: 1024px) 100vw, 40vw"
                    />
                    <div className="absolute top-8 left-8">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-gray-100 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-900">
                          Primary Feature
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-10 flex flex-col flex-1">
                    <div className="space-y-4 mb-10">
                      <h3 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter">
                        {featuredProduct.name}
                      </h3>
                      <p className="text-gray-500 text-lg leading-relaxed line-clamp-2">
                        {featuredProduct.description || category.description}
                      </p>
                    </div>

                    {/* Integrated Specs Strip */}
                    <div className="grid grid-cols-3 gap-1 bg-gray-50 p-1 rounded-3xl border border-gray-100 mb-10">
                      {highlights.map((h, i) => (
                        <div
                          key={i}
                          className="bg-white py-4 px-2 rounded-2xl text-center shadow-xs"
                        >
                          <h.icon className="h-4 w-4 text-red-600 mx-auto mb-2" />
                          <div className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">
                            {h.label}
                          </div>
                          <div className="text-xs font-black text-gray-900">
                            {h.value}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-auto flex items-center justify-between gap-6">
                      <div className="space-y-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                          Starting From
                        </span>
                        <div className="text-4xl font-black text-gray-900 tracking-tighter">
                          {formatPrice(featuredProduct.price)}
                        </div>
                      </div>
                      <Button
                        asChild
                        className="bg-red-600 hover:bg-red-700 text-white rounded-[24px] px-10 h-16 text-lg font-black shadow-xl shadow-red-200 transition-all hover:-translate-y-1 active:scale-95"
                      >
                        <Link href={`/products/${featuredProduct.slug}`}>
                          Acquire Now
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PRODUCT CLUSTER (7 Cols) */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {gridProducts.slice(0, 4).map((product, index) => (
                  <div
                    key={product.id}
                    className={cn(
                      "bg-white rounded-[32px] border border-gray-100 p-6 hover:shadow-xl hover:border-red-100 transition-all duration-500 group",
                      index === 0 && "sm:bg-gray-50/30"
                    )}
                  >
                    <ProductCard product={product} layout="vertical" />
                  </div>
                ))}
              </div>

              {/* Browse All "Slide" - Trendy CTA */}
              <Link
                href={`/products?category=${category.slug}`}
                className="group relative h-48 rounded-[32px] bg-gray-900 overflow-hidden flex items-center p-10 transition-all duration-500 hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="absolute inset-0 bg-linear-to-br from-red-600/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:scale-110 transition-transform duration-1000" />

                <div className="relative z-10 flex-1">
                  <h4 className="text-2xl font-black text-white mb-2 tracking-tight">
                    Explore the Entire Catalog
                  </h4>
                  <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-[10px]">
                    {category.name} Collection &bull; 2026 Edition
                  </p>
                </div>

                <div className="relative z-10 h-14 w-14 rounded-full bg-red-600 flex items-center justify-center text-white shadow-xl shadow-red-900/20 group-hover:translate-x-2 transition-all duration-500">
                  <ArrowRight className="h-6 w-6" />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}
