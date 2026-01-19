import dynamic from "next/dynamic";
// eslint-disable-next-line no-restricted-imports
import { Header } from "@/components/layout/Header";
// eslint-disable-next-line no-restricted-imports
import { Footer } from "@/components/layout/Footer";
// eslint-disable-next-line no-restricted-imports
import { HeroShell } from "@/app/_components/hero/HeroShell";
import { LazySection } from "@/components/ui/lazy-section";
import type { HomePageData } from "@/lib/data/home";

// Import skeleton components for dynamic loading
import { DepartmentTabsSkeleton } from "@/app/_components/DepartmentTabsSkeleton";
import { CategorySpotlightSkeleton } from "@/app/_components/CategorySpotlightSkeleton";
import { ServiceShowcaseSkeleton } from "@/app/_components/ServiceShowcaseSkeleton";
import { ProductRevealSectionSkeleton } from "@/app/_components/ProductRevealSectionSkeleton";
import { TrendingNowSkeleton } from "@/app/_components/TrendingNowSkeleton";
import { SubcategoryShowcaseSkeleton } from "@/app/_components/SubcategoryShowcaseSkeleton";
import { LatestProductsCarouselSkeleton } from "@/app/_components/LatestProductsCarouselSkeleton";
import { BrandStorySkeleton } from "@/app/_components/BrandStory";

// Dynamic imports for below-the-fold sections with skeleton fallbacks
// Components are client components (marked with "use client"), so they won't be SSR'd
const DepartmentTabs = dynamic(
  () =>
    import("@/app/_components/DepartmentTabs").then((mod) => ({
      default: mod.DepartmentTabs,
    })),
  {
    loading: () => <DepartmentTabsSkeleton />,
  }
);

const CategorySpotlight = dynamic(
  () =>
    import("@/app/_components/CategorySpotlight").then((mod) => ({
      default: mod.CategorySpotlight,
    })),
  {
    loading: () => <CategorySpotlightSkeleton />,
  }
);

const ServiceShowcase = dynamic(
  () =>
    import("@/app/_components/ServiceShowcase").then((mod) => ({
      default: mod.ServiceShowcase,
    })),
  {
    loading: () => <ServiceShowcaseSkeleton />,
  }
);

const ProductRevealSection = dynamic(
  () =>
    import("@/app/_components/ProductRevealSection").then((mod) => ({
      default: mod.ProductRevealSection,
    })),
  {
    loading: () => <ProductRevealSectionSkeleton />,
  }
);

const TrendingNow = dynamic(
  () =>
    import("@/app/_components/TrendingNow").then((mod) => ({
      default: mod.TrendingNow,
    })),
  {
    loading: () => <TrendingNowSkeleton />,
  }
);

const SubcategoryShowcase = dynamic(
  () =>
    import("@/app/_components/SubcategoryShowcase").then((mod) => ({
      default: mod.SubcategoryShowcase,
    })),
  {
    loading: () => <SubcategoryShowcaseSkeleton />,
  }
);

const LatestProductsCarousel = dynamic(
  () =>
    import("@/app/_components/DealsCarousel").then((mod) => ({
      default: mod.LatestProductsCarousel,
    })),
  {
    loading: () => <LatestProductsCarouselSkeleton />,
  }
);

const BrandStory = dynamic(
  () =>
    import("@/app/_components/BrandStory").then((mod) => ({
      default: mod.BrandStory,
    })),
  {
    loading: () => <BrandStorySkeleton />,
  }
);

interface HomePageContentProps {
  data: HomePageData;
}

export function HomePageContent({ data }: HomePageContentProps) {
  // Use precomputed mappings from server
  const { productsByCategory, productsBySlug } = data;

  return (
    <div className="flex min-h-screen flex-col relative">
      <Header />
      <main id="main-content" className="flex-1 relative z-0" role="main">
        {/* Hero */}
        <HeroShell
          slides={data.heroSlides}
          productsBySlug={productsBySlug}
          categories={data.categories}
          productsByCategory={productsByCategory}
        />

        {/* Department Tabs - Lazy loaded when in viewport */}
        <LazySection fallback={<DepartmentTabsSkeleton />}>
          <DepartmentTabs
            categories={data.categories}
            productsByCategory={productsByCategory}
          />
        </LazySection>

        {/* Category Spotlight - Lazy loaded when in viewport */}
        <LazySection fallback={<CategorySpotlightSkeleton />}>
          <CategorySpotlight
            categories={data.categories}
            productsByCategory={productsByCategory}
          />
        </LazySection>

        {/* Service Showcase - Lazy loaded when in viewport */}
        <LazySection fallback={<ServiceShowcaseSkeleton />}>
          <ServiceShowcase />
        </LazySection>

        {/* Product Reveal - Lazy loaded when in viewport */}
        <LazySection fallback={<ProductRevealSectionSkeleton />}>
          <ProductRevealSection
            products={data.trendingProducts}
            categories={data.categories}
          />
        </LazySection>

        {/* Trending Now - Lazy loaded when in viewport */}
        <LazySection fallback={<TrendingNowSkeleton />}>
          <TrendingNow
            trendingProducts={data.trendingProducts}
            categories={data.categories || []}
          />
        </LazySection>

        {/* Subcategory Showcase - Specialized deep-dive into a specific category tree */}
        <LazySection fallback={<SubcategoryShowcaseSkeleton />}>
          <SubcategoryShowcase
            categories={data.categories}
            productsByCategory={productsByCategory}
            parentCategorySlug="laptops"
          />
        </LazySection>

        {/* Latest Products - Lazy loaded when in viewport */}
        <LazySection fallback={<LatestProductsCarouselSkeleton />}>
          <LatestProductsCarousel products={data.latestProducts} />
        </LazySection>

        {/* Brand Story - Lazy loaded when in viewport */}
        <LazySection fallback={<BrandStorySkeleton />}>
          <BrandStory />
        </LazySection>
      </main>
      <Footer />
    </div>
  );
}
