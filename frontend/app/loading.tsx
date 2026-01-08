// Homepage loading skeleton - shown during server-side data fetching
// eslint-disable-next-line no-restricted-imports
import { Header } from "@/components/layout/Header";
// eslint-disable-next-line no-restricted-imports
import { Footer } from "@/components/layout/Footer";
// eslint-disable-next-line no-restricted-imports
import { HeroShellSkeleton } from "@/components/home/hero/HeroShell";
// eslint-disable-next-line no-restricted-imports
import { ServiceShowcaseSkeleton } from "@/components/home/service-showcase";
// eslint-disable-next-line no-restricted-imports
import { DepartmentTabsSkeleton } from "@/components/home/department-tabs";
// eslint-disable-next-line no-restricted-imports
import { ProductRevealSectionSkeleton } from "@/components/home/product-reveal-section";
// eslint-disable-next-line no-restricted-imports
import { TrendingNowSkeleton } from "@/components/home/trending-now";
// eslint-disable-next-line no-restricted-imports
import { LatestProductsCarouselSkeleton } from "@/components/home/deals-carousel";
// eslint-disable-next-line no-restricted-imports
import { BrandStorySkeleton } from "@/components/home/brand-story";

export default function HomePageLoading() {
  return (
    <div className="flex min-h-screen flex-col relative">
      <Header />
      <main id="main-content" className="flex-1 relative z-0">
        {/* Hero Split */}
        <HeroShellSkeleton />

        {/* Service Showcase */}
        <ServiceShowcaseSkeleton />

        {/* Department Tabs */}
        <DepartmentTabsSkeleton />

        {/* Product Reveal */}
        <ProductRevealSectionSkeleton />

        {/* Trending Now */}
        <TrendingNowSkeleton />

        {/* Latest Products */}
        <LatestProductsCarouselSkeleton />

        {/* Brand Story */}
        <BrandStorySkeleton />
      </main>
      <Footer />
    </div>
  );
}
