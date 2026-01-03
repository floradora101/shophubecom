// Homepage loading skeleton - shown during server-side data fetching
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroShellSkeleton } from "@/components/home/hero/HeroShell";
import { ServiceShowcaseSkeleton } from "@/components/home/service-showcase";
import { DepartmentTabsSkeleton } from "@/components/home/department-tabs";
import { ProductRevealSectionSkeleton } from "@/components/home/product-reveal-section";
import { TrendingNowSkeleton } from "@/components/home/trending-now";
import { LatestProductsCarouselSkeleton } from "@/components/home/deals-carousel";
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
