// Homepage loading skeleton - shown during server-side data fetching
// eslint-disable-next-line no-restricted-imports
import { Header } from "@/components/layout/Header";
// eslint-disable-next-line no-restricted-imports
import { Footer } from "@/components/layout/Footer";
// eslint-disable-next-line no-restricted-imports
import { HeroShellSkeleton } from "@/app/_components/hero/HeroShell";
// eslint-disable-next-line no-restricted-imports
import { ServiceShowcaseSkeleton } from "@/app/_components/ServiceShowcaseSkeleton";
// eslint-disable-next-line no-restricted-imports
import { DepartmentTabsSkeleton } from "@/app/_components/DepartmentTabsSkeleton";
// eslint-disable-next-line no-restricted-imports
import { ProductRevealSectionSkeleton } from "@/app/_components/ProductRevealSectionSkeleton";
// eslint-disable-next-line no-restricted-imports
import { TrendingNowSkeleton } from "@/app/_components/TrendingNowSkeleton";
// eslint-disable-next-line no-restricted-imports
import { LatestProductsCarouselSkeleton } from "@/app/_components/LatestProductsCarouselSkeleton";
// eslint-disable-next-line no-restricted-imports
import { BrandStorySkeleton } from "@/app/_components/BrandStory";

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
