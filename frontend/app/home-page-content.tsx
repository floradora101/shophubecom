import dynamic from "next/dynamic";
// eslint-disable-next-line no-restricted-imports
import { Header } from "@/components/layout/Header";
// eslint-disable-next-line no-restricted-imports
import { Footer } from "@/components/layout/Footer";
// eslint-disable-next-line no-restricted-imports
import { HeroShell } from "@/components/home/hero/HeroShell";
import { LazySection } from "@/components/ui/lazy-section";
import type { HomePageData } from "@/lib/data/home";

// Import skeleton components for dynamic loading
import { DepartmentTabsSkeleton } from "@/components/home/department-tabs";
import { ServiceShowcaseSkeleton } from "@/components/home/service-showcase";
import { ProductRevealSectionSkeleton } from "@/components/home/product-reveal-section";
import { TrendingNowSkeleton } from "@/components/home/trending-now";
import { SubcategoryShowcaseSkeleton } from "@/components/home/subcategory-showcase";
import { LatestProductsCarouselSkeleton } from "@/components/home/deals-carousel";
import { BrandStorySkeleton } from "@/components/home/brand-story";

// Dynamic imports for below-the-fold sections with skeleton fallbacks
const DepartmentTabs = dynamic(
  () =>
    import("@/components/home/department-tabs").then((mod) => ({
      default: mod.DepartmentTabs,
    })),
  {
    loading: () => <DepartmentTabsSkeleton />,
  }
);

const ServiceShowcase = dynamic(
  () =>
    import("@/components/home/service-showcase").then((mod) => ({
      default: mod.ServiceShowcase,
    })),
  {
    loading: () => <ServiceShowcaseSkeleton />,
  }
);

const ProductRevealSection = dynamic(
  () =>
    import("@/components/home/product-reveal-section").then((mod) => ({
      default: mod.ProductRevealSection,
    })),
  {
    loading: () => <ProductRevealSectionSkeleton />,
  }
);

const TrendingNow = dynamic(
  () =>
    import("@/components/home/trending-now").then((mod) => ({
      default: mod.TrendingNow,
    })),
  {
    loading: () => <TrendingNowSkeleton />,
  }
);

const SubcategoryShowcase = dynamic(
  () =>
    import("@/components/home/subcategory-showcase").then((mod) => ({
      default: mod.SubcategoryShowcase,
    })),
  {
    loading: () => <SubcategoryShowcaseSkeleton />,
  }
);

const LatestProductsCarousel = dynamic(
  () =>
    import("@/components/home/deals-carousel").then((mod) => ({
      default: mod.LatestProductsCarousel,
    })),
  {
    loading: () => <LatestProductsCarouselSkeleton />,
  }
);

const BrandStory = dynamic(
  () =>
    import("@/components/home/brand-story").then((mod) => ({
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
        <HeroShell slides={data.heroSlides} productsBySlug={productsBySlug} />

        {/* Department Tabs - Lazy loaded when in viewport */}
        <LazySection fallback={<DepartmentTabsSkeleton />}>
          <DepartmentTabs
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
