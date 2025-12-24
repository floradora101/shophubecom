// Client component for homepage content - redesigned with premium editorial sections
"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSplit } from "@/components/home/hero-split";
import { ProductRevealSection } from "@/components/home/product-reveal-section";
import { DepartmentTabs } from "@/components/home/department-tabs";
import { TrendingNow } from "@/components/home/trending-now";
import { DealsCarousel } from "@/components/home/deals-carousel";
import { BrandStory } from "@/components/home/brand-story";

import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getHomePageData, type HomePageData } from "@/lib/data/home";

export function HomePageContent() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const homeData = await getHomePageData();
        setData(homeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col relative">
        {/* Unified smooth gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-cream-50 to-primary-100/50 opacity-60 -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.1),transparent_50%)] -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.08),transparent_50%)] -z-10" />
        <Header />
        <main className="flex-1 flex items-center justify-center py-24 relative z-0">
          <LoadingSpinner />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col relative">
        {/* Unified smooth gradient background */}
        <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-cream-50 to-primary-100/50 opacity-60 -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.1),transparent_50%)] -z-10" />
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.08),transparent_50%)] -z-10" />
        <Header />
        <main className="flex-1 flex items-center justify-center py-24 relative z-0">
          <div className="text-center">
            <p className="text-warm-gray-600">
              {error || "Failed to load homepage content"}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Prepare products by category for DepartmentTabs
  const productsByCategory: Record<string, typeof data.electronicsProducts> = {
    electronics: data.electronicsProducts,
    clothing: data.clothingProducts,
    "home-garden": data.homeGardenProducts,
    books: data.booksProducts,
  };

  return (
    <div className="flex min-h-screen flex-col relative">
      {/* Unified smooth gradient background for entire homepage */}
      <div className="fixed inset-0 bg-gradient-to-br from-primary-50 via-cream-50 to-primary-100/50 opacity-60 -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(220,38,38,0.1),transparent_50%)] -z-10" />
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(220,38,38,0.08),transparent_50%)] -z-10" />
      <Header />
      <main className="flex-1 relative z-0">
        {/* Hero Split Section */}
        {data.featuredProducts[0] && (
          <HeroSplit
            featuredProduct={data.featuredProducts[0]}
            featuredProducts={data.featuredProducts}
          />
        )}

        {/* Product Reveal Section */}
        {data.trendingProducts && data.trendingProducts.length > 0 && (
          <ProductRevealSection
            products={data.trendingProducts}
            categories={data.categories}
          />
        )}

        {/* Department Tabs Section */}
        {data.categories.length > 0 && (
          <DepartmentTabs
            categories={data.categories}
            productsByCategory={productsByCategory}
          />
        )}

        {/* Trending Now Section */}
        {data.trendingProducts && data.trendingProducts.length > 0 && (
          <TrendingNow
            trendingProducts={data.trendingProducts}
            categories={data.categories || []}
          />
        )}

        {/* Deals Carousel Section */}
        <DealsCarousel />

        {/* Brand Story Section */}
        <BrandStory />
      </main>
      <Footer />
    </div>
  );
}
