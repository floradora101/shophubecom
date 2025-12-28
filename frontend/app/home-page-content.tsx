// Client component for homepage content - redesigned with premium editorial sections
"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSplit, HeroSplitSkeleton } from "@/components/home/hero-split";
import { HERO_SLIDES } from "@/dev/mocks/heroSlides.mock";
import {
  ServiceShowcase,
  ServiceShowcaseSkeleton,
} from "@/components/home/service-showcase";
import {
  ProductRevealSection,
  ProductRevealSectionSkeleton,
} from "@/components/home/product-reveal-section";
import {
  DepartmentTabs,
  DepartmentTabsSkeleton,
} from "@/components/home/department-tabs";
import {
  TrendingNow,
  TrendingNowSkeleton,
} from "@/components/home/trending-now";
import {
  LatestProductsCarousel,
  LatestProductsCarouselSkeleton,
} from "@/components/home/deals-carousel";
import { BrandStory, BrandStorySkeleton } from "@/components/home/brand-story";

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

        // Simulate loading delay to show skeletons (like products page)
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2 second delay

        setData(homeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  // Show skeleton sections during loading, actual content when loaded, error only when there's an actual error

  if (error && !isLoading && !data) {
    return (
      <div className="flex min-h-screen flex-col relative">
        <Header />
        <main className="flex-1 flex items-center justify-center py-24 relative z-0">
          <div className="text-center">
            <p className="text-warm-gray-600">{error}</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Prepare products by category for DepartmentTabs - only when data is available
  const productsByCategory: Record<string, any[]> = data
    ? {
        phones: data.phonesProducts,
        tablets: data.tabletsProducts,
        laptops: data.laptopsProducts,
        wearables: data.wearablesProducts,
        "smart-gadgets": data.smartGadgetsProducts,
        "gaming-console": data.gamingConsoleProducts,
        accessories: data.accessoriesProducts,
      }
    : {};

  return (
    <div className="flex min-h-screen flex-col relative">
      <Header />
      <main id="main-content" className="flex-1 relative z-0" role="main">
        {/* Hero Split Section */}
        {isLoading ? <HeroSplitSkeleton /> : <HeroSplit slides={HERO_SLIDES} />}

        {/* Service Showcase Section */}
        {isLoading ? <ServiceShowcaseSkeleton /> : <ServiceShowcase />}

        {/* Department Tabs Section */}
        {isLoading ? (
          <DepartmentTabsSkeleton />
        ) : data?.categories && data.categories.length > 0 ? (
          <DepartmentTabs
            categories={data.categories}
            productsByCategory={productsByCategory}
          />
        ) : (
          <DepartmentTabsSkeleton />
        )}

        {/* Product Reveal Section */}
        {isLoading ? (
          <ProductRevealSectionSkeleton />
        ) : data?.trendingProducts && data.trendingProducts.length > 0 ? (
          <ProductRevealSection
            products={data.trendingProducts}
            categories={data.categories}
          />
        ) : (
          <ProductRevealSectionSkeleton />
        )}

        {/* Trending Now Section */}
        {isLoading ? (
          <TrendingNowSkeleton />
        ) : data?.trendingProducts && data.trendingProducts.length > 0 ? (
          <TrendingNow
            trendingProducts={data.trendingProducts}
            categories={data.categories || []}
          />
        ) : (
          <TrendingNowSkeleton />
        )}

        {/* Latest Products Carousel Section */}
        {isLoading ? (
          <LatestProductsCarouselSkeleton />
        ) : (
          <LatestProductsCarousel />
        )}

        {/* Brand Story Section */}
        {isLoading ? <BrandStorySkeleton /> : <BrandStory />}
      </main>
      <Footer />
    </div>
  );
}
