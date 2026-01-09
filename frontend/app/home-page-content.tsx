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
import { CategorySpotlightSkeleton } from "@/components/home/category-spotlight";
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

const CategorySpotlight = dynamic(
  () =>
    import("@/components/home/category-spotlight").then((mod) => ({
      default: mod.CategorySpotlight,
    })),
  {
    loading: () => <CategorySpotlightSkeleton />,
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
        <LazySection>
          <DepartmentTabs
            categories={data.categories}
            productsByCategory={productsByCategory}
          />
        </LazySection>

        {/* Service Showcase - Lazy loaded when in viewport */}
        <LazySection>
          <ServiceShowcase />
        </LazySection>

        {/* Product Reveal - Lazy loaded when in viewport */}
        <LazySection>
          <ProductRevealSection
            products={data.trendingProducts}
            categories={data.categories}
          />
        </LazySection>

        {/* Trending Now - Lazy loaded when in viewport */}
        <LazySection>
          <TrendingNow
            trendingProducts={data.trendingProducts}
            categories={data.categories || []}
          />
        </LazySection>

        {/* Category Spotlight - Lazy loaded when in viewport */}
        <LazySection>
          <CategorySpotlight
            spotlightCategory={{
              slug: "gaming-laptops",
              name: "Gaming Laptops",
              description: "High-performance laptops built for gaming excellence",
              products: productsByCategory["gaming-laptops"] || [],
              accentColor: "#8b5cf6",
            }}
            categories={data.categories}
          />
        </LazySection>

        {/* Latest Products - Lazy loaded when in viewport */}
        <LazySection>
          <LatestProductsCarousel products={data.latestProducts} />
        </LazySection>

        {/* Brand Story - Lazy loaded when in viewport */}
        <LazySection>
          <BrandStory />
        </LazySection>
      </main>
      <Footer />
    </div>
  );
}
