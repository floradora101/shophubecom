"use client";

// Client component for homepage content - redesigned with premium editorial sections

import { useEffect, useMemo, useState, Suspense } from "react";
import dynamic from "next/dynamic";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSplit, HeroSplitSkeleton } from "@/components/home/hero-split";
import { HERO_SLIDES } from "@/dev/mocks/heroSlides.mock";
import {
  ServiceShowcase,
  ServiceShowcaseSkeleton,
} from "@/components/home/service-showcase";

// Dynamically import heavier components that appear lower on the page
const ProductRevealSection = dynamic(
  () =>
    import("@/components/home/product-reveal-section").then((mod) => ({
      default: mod.ProductRevealSection,
    })),
  { loading: () => <ProductRevealSectionSkeleton /> }
);

const ProductRevealSectionSkeleton = dynamic(
  () =>
    import("@/components/home/product-reveal-section").then((mod) => ({
      default: mod.ProductRevealSectionSkeleton,
    })),
  { ssr: false }
);

const DepartmentTabs = dynamic(
  () =>
    import("@/components/home/department-tabs").then((mod) => ({
      default: mod.DepartmentTabs,
    })),
  { loading: () => <DepartmentTabsSkeleton /> }
);

const DepartmentTabsSkeleton = dynamic(
  () =>
    import("@/components/home/department-tabs").then((mod) => ({
      default: mod.DepartmentTabsSkeleton,
    })),
  { ssr: false }
);

const TrendingNow = dynamic(
  () =>
    import("@/components/home/trending-now").then((mod) => ({
      default: mod.TrendingNow,
    })),
  { loading: () => <TrendingNowSkeleton /> }
);

const TrendingNowSkeleton = dynamic(
  () =>
    import("@/components/home/trending-now").then((mod) => ({
      default: mod.TrendingNowSkeleton,
    })),
  { ssr: false }
);

const LatestProductsCarousel = dynamic(
  () =>
    import("@/components/home/deals-carousel").then((mod) => ({
      default: mod.LatestProductsCarousel,
    })),
  { loading: () => <LatestProductsCarouselSkeleton /> }
);

const LatestProductsCarouselSkeleton = dynamic(
  () =>
    import("@/components/home/deals-carousel").then((mod) => ({
      default: mod.LatestProductsCarouselSkeleton,
    })),
  { ssr: false }
);

const BrandStory = dynamic(
  () =>
    import("@/components/home/brand-story").then((mod) => ({
      default: mod.BrandStory,
    })),
  { loading: () => <BrandStorySkeleton /> }
);

const BrandStorySkeleton = dynamic(
  () =>
    import("@/components/home/brand-story").then((mod) => ({
      default: mod.BrandStorySkeleton,
    })),
  { ssr: false }
);

import { getHomePageData, type HomePageData } from "@/lib/data/home";
import type { Product } from "@/features/products/types";

export function HomePageContent() {
  const [data, setData] = useState<HomePageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const homeData = await getHomePageData();

        // Simulate loading delay to show skeletons
        await new Promise((resolve) => setTimeout(resolve, 2000));

        setData(homeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

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

  const productsByCategory = useMemo(() => {
    if (!data) return {};

    return {
      phones: data.phonesProducts,
      tablets: data.tabletsProducts,
      laptops: data.laptopsProducts,
      wearables: data.wearablesProducts,
      "smart-gadgets": data.smartGadgetsProducts,
      "gaming-console": data.gamingConsoleProducts,
      accessories: data.accessoriesProducts,
    } as Record<string, Product[]>;
  }, [data]);

  const productsBySlug = useMemo(() => {
    if (!data) return {};

    const all = [
      ...data.phonesProducts,
      ...data.tabletsProducts,
      ...data.laptopsProducts,
      ...data.wearablesProducts,
      ...data.smartGadgetsProducts,
      ...data.gamingConsoleProducts,
      ...data.accessoriesProducts,
      ...data.featuredProducts,
      ...data.trendingProducts,
    ];

    return all.reduce((acc, product) => {
      acc[product.slug] = product;
      return acc;
    }, {} as Record<string, Product>);
  }, [data]);

  return (
    <div className="flex min-h-screen flex-col relative">
      <Header />
      <main id="main-content" className="flex-1 relative z-0" role="main">
        {/* Hero Split */}
        {isLoading ? (
          <HeroSplitSkeleton />
        ) : (
          <HeroSplit slides={HERO_SLIDES} productsBySlug={productsBySlug} />
        )}

        {/* Service Showcase */}
        {isLoading ? <ServiceShowcaseSkeleton /> : <ServiceShowcase />}

        {/* Department Tabs */}
        <Suspense fallback={<DepartmentTabsSkeleton />}>
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
        </Suspense>

        {/* Product Reveal */}
        <Suspense fallback={<ProductRevealSectionSkeleton />}>
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
        </Suspense>

        {/* Trending Now */}
        <Suspense fallback={<TrendingNowSkeleton />}>
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
        </Suspense>

        {/* Latest Products */}
        <Suspense fallback={<LatestProductsCarouselSkeleton />}>
          {isLoading ? (
            <LatestProductsCarouselSkeleton />
          ) : (
            <LatestProductsCarousel />
          )}
        </Suspense>

        {/* Brand Story */}
        <Suspense fallback={<BrandStorySkeleton />}>
          {isLoading ? <BrandStorySkeleton /> : <BrandStory />}
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
