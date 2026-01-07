"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { SkeletonBlock } from "@/components/ui/skeleton";
import { SectionTitle } from "./shared/section-header";
import { ProductCard } from "@/features/products/components/ProductCard";
import { ProductCardSkeleton } from "./ProductCardSkeleton";
import type { Product, Category } from "@/features/products/types";
import { getProductImageWithPlaceholder } from "@/lib/utils/products";
import { formatPrice } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Gamepad2, Cpu, Monitor } from "lucide-react";

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
 */
export function CategorySpotlightSkeleton() {
  return (
    <Section className="bg-gray-700 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
      </div>

      <Container className="relative z-10">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20">
              <SkeletonBlock className="w-6 h-6 rounded" />
              <SkeletonBlock className="h-5 w-32 rounded" />
            </div>
            <SkeletonBlock className="h-12 w-96 mx-auto rounded" />
            <SkeletonBlock className="h-6 w-80 mx-auto rounded" />
          </div>

          {/* Spotlight Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-linear-to-r from-gray-800 to-gray-700 border border-gray-600">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left side - Category info */}
              <div className="p-6 lg:p-8 flex flex-col justify-center">
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <SkeletonBlock className="w-12 h-12 rounded-xl" />
                    <div>
                      <SkeletonBlock className="h-8 w-48 mb-2" />
                      <SkeletonBlock className="h-4 w-64" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    {Array.from({ length: 3 }, (_, i) => (
                      <div key={i} className="text-center">
                        <SkeletonBlock className="w-8 h-8 mx-auto mb-2 rounded" />
                        <SkeletonBlock className="h-4 w-16 mx-auto" />
                      </div>
                    ))}
                  </div>
                  <SkeletonBlock className="w-32 h-10 rounded-xl" />
                </div>
              </div>

              {/* Right side - Featured product */}
              <div className="relative bg-slate-700/50 p-4 flex items-center justify-center">
                <div className="text-center space-y-3 max-w-sm">
                  <SkeletonBlock className="w-80 h-80 rounded-xl mx-auto" />
                  <SkeletonBlock className="h-6 w-48 mx-auto" />
                  <SkeletonBlock className="h-4 w-32 mx-auto" />
                </div>
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4"
              >
                <ProductCardSkeleton />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}

export function CategorySpotlight({
  spotlightCategory,
}: CategorySpotlightProps) {
  // Default to Gaming Laptops if no category specified
  const defaultSpotlight = useMemo(
    () => ({
      slug: "gaming-laptops",
      name: "Gaming Laptops",
      description: "High-performance laptops built for gaming excellence",
      products: [], // Will be populated from productsByCategory
      accentColor: "#8b5cf6",
    }),
    []
  );

  const category = spotlightCategory || defaultSpotlight;

  // Get products for this category (in real implementation, this would come from props)
  const categoryProducts = category.products || [];

  // Split products: first one is featured, rest are grid items
  const featuredProduct = categoryProducts[0];
  const gridProducts = categoryProducts.slice(1, 5); // 4 products for grid

  // Category highlights (customize based on category)
  const getCategoryHighlights = (categorySlug: string) => {
    const highlights = {
      "gaming-laptops": [
        { icon: Gamepad2, label: "Gaming Ready", value: "RTX 40 Series" },
        { icon: Cpu, label: "Performance", value: "Intel i9" },
        { icon: Monitor, label: "Display", value: "165Hz" },
      ],
      "smart-watches": [
        { icon: Sparkles, label: "Battery", value: "7+ Days" },
        { icon: Monitor, label: "Display", value: "AMOLED" },
        { icon: Cpu, label: "Health", value: "24/7 Monitoring" },
      ],
    };
    return (
      highlights[categorySlug as keyof typeof highlights] ||
      highlights["gaming-laptops"]
    );
  };

  const highlights = getCategoryHighlights(category.slug);

  if (!featuredProduct && gridProducts.length === 0) {
    return null; // Don't render if no products
  }

  return (
    <Section className="bg-gray-800 relative overflow-hidden">
      {/* Animated Tech Background */}
      <div className="absolute inset-0 opacity-20">
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_25%,rgba(59,130,246,0.1),transparent_50%),radial-gradient(circle_at_75%_75%,rgba(139,92,246,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.05)_1px,transparent_1px)] bg-[size:50px_50px]" />

        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-primary-400 rounded-full opacity-60 animate-pulse" />
        <div className="absolute top-40 right-32 w-1 h-1 bg-primary-300 rounded-full opacity-40 animate-ping" />
        <div className="absolute bottom-32 left-1/3 w-1.5 h-1.5 bg-primary-500 rounded-full opacity-50 animate-pulse" />
        <div className="absolute top-1/2 right-20 w-1 h-1 bg-primary-400 rounded-full opacity-30 animate-ping" />

        {/* Glowing Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary-500/20 rounded-full blur-2xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-primary-400/15 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute top-3/4 left-1/2 w-16 h-16 bg-primary-300/25 rounded-full blur-lg animate-pulse delay-500" />
      </div>

      <Container className="relative z-10">
        <div className="space-y-8">
          {/* Enhanced Tech Header */}
          <div className="text-center space-y-6 relative">
            {/* Animated Badge */}
            <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r from-primary-500/20 via-emerald-500/15 to-violet-500/20 backdrop-blur-md border border-primary-400/30 shadow-xl shadow-primary-500/20">
              <div className="relative">
                <Sparkles className="h-6 w-6 text-primary-400 animate-pulse" />
                <div className="absolute inset-0 bg-primary-400/50 rounded-full blur-sm animate-ping" />
              </div>
              <span className="text-white font-bold tracking-wider">
                TECH SPOTLIGHT
              </span>
              <div className="flex gap-1">
                <div className="w-1 h-1 bg-primary-400 rounded-full animate-pulse" />
                <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse delay-100" />
                <div className="w-1 h-1 bg-violet-400 rounded-full animate-pulse delay-200" />
              </div>
            </div>

            {/* Cyberpunk Title */}
            <div className="relative">
              <SectionTitle
                italic="Premium"
                bold="Tech"
                className="text-white"
              />
              {/* Animated Circuit Border */}
              <div className="absolute -inset-8 border border-primary-400/20 rounded-2xl animate-pulse" />
              <div className="absolute -inset-4 border border-emerald-400/15 rounded-xl animate-pulse delay-500" />
            </div>

            {/* Enhanced Description */}
            <div className="max-w-4xl mx-auto">
              <p className="text-gray-300 text-lg leading-relaxed mb-6">
                Discover our handpicked selection of premium{" "}
                <span className="text-primary-400 font-semibold bg-primary-400/10 px-2 py-1 rounded-md border border-primary-400/20">
                  {category.name.toLowerCase()}
                </span>{" "}
                designed for the ultimate experience
              </p>

              {/* Trust Indicators Row */}
              <div className="flex flex-wrap justify-center gap-6 text-sm">
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-600/30 backdrop-blur-sm">
                  <Sparkles className="h-4 w-4 text-primary-400" />
                  <span className="text-gray-300">Premium Quality</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-600/30 backdrop-blur-sm">
                  <Gamepad2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-gray-300">Expert Curated</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-600/30 backdrop-blur-sm">
                  <Monitor className="h-4 w-4 text-violet-400" />
                  <span className="text-gray-300">Latest Tech</span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full border border-gray-600/30 backdrop-blur-sm">
                  <Cpu className="h-4 w-4 text-orange-400" />
                  <span className="text-gray-300">High Performance</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cyberpunk Spotlight Banner */}
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-gray-800 via-gray-800/95 to-gray-900 border border-primary-400/30 shadow-2xl shadow-primary-500/20 group hover:shadow-primary-500/30 transition-all duration-500">
            {/* Animated Border Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 via-transparent to-primary-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="absolute inset-0 border border-primary-400/20 rounded-2xl" />

            {/* Tech Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-4 right-4 w-20 h-20 border border-primary-400/20 rounded-lg rotate-12" />
              <div className="absolute bottom-6 left-6 w-16 h-16 border border-primary-400/20 rounded-full" />
              <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
            </div>

            <div className="grid lg:grid-cols-2 gap-0 relative z-10">
              {/* Left side - Cyberpunk Category Info */}
              <div className="p-6 lg:p-8 flex flex-col justify-center relative">
                {/* Background Circuit Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-16 h-16 border-l-2 border-t-2 border-primary-400/20" />
                  <div className="absolute bottom-4 right-4 w-12 h-12 border-r-2 border-b-2 border-primary-400/20" />
                </div>

                <div className="space-y-6 relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="relative p-4 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/10 border border-primary-400/40 shadow-lg shadow-primary-500/20 group-hover:shadow-primary-500/40 transition-all duration-300">
                      <Gamepad2 className="h-10 w-10 text-primary-400 group-hover:text-primary-300 transition-colors" />
                      <div className="absolute inset-0 bg-primary-400/20 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        {category.name}
                      </h3>
                      <p className="text-slate-300 text-lg leading-relaxed">
                        {category.description}
                      </p>
                    </div>
                  </div>

                  {/* Tech Specs Highlights */}
                  <div className="grid grid-cols-3 gap-4">
                    {highlights.map((highlight, index) => (
                      <div
                        key={index}
                        className="text-center group cursor-pointer"
                      >
                        <div className="relative mb-3">
                          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/15 to-primary-600/10 border border-primary-400/30 shadow-lg shadow-primary-500/10 group-hover:shadow-primary-500/30 transition-all duration-300">
                            <highlight.icon className="h-7 w-7 text-primary-400 group-hover:text-primary-300 group-hover:scale-110 transition-all duration-300" />
                          </div>
                          {/* Glow effect */}
                          <div className="absolute inset-0 bg-primary-400/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                        </div>
                        <div className="text-white font-bold text-sm mb-1 group-hover:text-primary-300 transition-colors">
                          {highlight.value}
                        </div>
                        <div className="text-slate-400 text-xs font-medium uppercase tracking-wide">
                          {highlight.label}
                        </div>
                        {/* Animated underline */}
                        <div className="h-0.5 bg-gradient-to-r from-primary-400/0 via-primary-400/50 to-primary-400/0 mt-2 group-hover:via-primary-400 transition-all duration-300" />
                      </div>
                    ))}
                  </div>

                  <Button
                    asChild
                    className="group relative bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-500 hover:to-primary-600 text-white px-8 py-4 rounded-xl font-bold shadow-xl shadow-primary-500/25 hover:shadow-primary-500/40 transition-all duration-300 overflow-hidden"
                  >
                    <Link
                      href={`/products?category=${category.slug}`}
                      className="relative z-10 flex items-center gap-2"
                    >
                      <span>Explore All {category.name}</span>
                      <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
                      {/* Button glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-primary-400/20 to-primary-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Right side - Cyberpunk Featured Product */}
              {featuredProduct && (
                <div className="relative bg-gradient-to-br from-slate-800/60 to-slate-900/40 p-6 flex items-center justify-center backdrop-blur-sm">
                  {/* Tech corners */}
                  <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-primary-400/40" />
                  <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-primary-400/40" />
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-primary-400/40" />
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-primary-400/40" />

                  <div className="text-center space-y-4 max-w-sm relative z-10">
                    <div className="relative group">
                      {/* Multi-layer glow effects */}
                      <div className="absolute inset-0 bg-primary-500/30 rounded-xl blur-2xl group-hover:bg-primary-400/40 transition-all duration-500 animate-pulse" />
                      <div className="absolute inset-0 bg-primary-400/20 rounded-xl blur-xl group-hover:bg-primary-300/30 transition-all duration-500" />

                      <Image
                        src={getProductImageWithPlaceholder(featuredProduct)}
                        alt={featuredProduct.name}
                        width={320}
                        height={320}
                        className="relative w-80 h-80 object-contain rounded-xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md border border-primary-400/30 group-hover:border-primary-300/50 group-hover:scale-105 transition-all duration-500 shadow-2xl shadow-primary-500/10"
                        unoptimized={getProductImageWithPlaceholder(
                          featuredProduct
                        ).startsWith("data:")}
                      />

                      {/* Scanning line effect */}
                      <div className="absolute inset-0 rounded-xl overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-pulse opacity-60" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="text-xl font-bold text-white line-clamp-2 group-hover:text-primary-200 transition-colors">
                        {featuredProduct.name}
                      </h4>
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-3xl font-bold bg-gradient-to-r from-primary-400 to-primary-300 bg-clip-text text-transparent">
                          {formatPrice(featuredProduct.price)}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border border-green-400/40 shadow-lg shadow-green-500/20 animate-pulse"
                        >
                          <div className="flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                            Featured
                          </div>
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Cyberpunk Product Grid */}
          {gridProducts.length > 0 && (
            <div className="space-y-6 relative">
              {/* Grid Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.02)_1px,transparent_1px)] bg-[size:30px_30px]" />
              </div>

              <div className="text-center relative z-10">
                <h3 className="text-3xl font-bold text-white mb-3 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
                  More {category.name}
                </h3>
                <p className="text-slate-300 text-lg">
                  Explore our complete collection of premium{" "}
                  <span className="text-primary-400 font-semibold">
                    {category.name.toLowerCase()}
                  </span>
                </p>
                <div className="flex items-center justify-center gap-2 mt-4">
                  <div className="h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent flex-1 max-w-20" />
                  <div className="w-2 h-2 bg-primary-400 rounded-full animate-pulse" />
                  <div className="h-px bg-gradient-to-r from-transparent via-primary-400/50 to-transparent flex-1 max-w-20" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
                {gridProducts.map((product, index) => (
                  <div
                    key={product.id}
                    className="group relative bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-md rounded-xl border border-white/10 hover:border-primary-400/40 transition-all duration-500 hover:shadow-2xl hover:shadow-primary-500/20 transform hover:scale-[1.02] hover:-translate-y-1 overflow-hidden text-white **:text-white [&_.text-warm-gray-600]:text-slate-300 [&_.text-warm-gray-900]:text-white [&_.bg-warm-gray-100]:bg-slate-700 [&_.border-warm-gray-200]:border-slate-600"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    {/* Card glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    {/* Tech corners */}
                    <div className="absolute top-2 left-2 w-3 h-3 border-l border-t border-primary-400/30 group-hover:border-primary-300/50 transition-colors" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-r border-t border-primary-400/30 group-hover:border-primary-300/50 transition-colors" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-l border-b border-primary-400/30 group-hover:border-primary-300/50 transition-colors" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-r border-b border-primary-400/30 group-hover:border-primary-300/50 transition-colors" />

                    <ProductCard product={product} />

                    {/* Hover scan line */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-primary-400 to-transparent animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Container>
    </Section>
  );
}
