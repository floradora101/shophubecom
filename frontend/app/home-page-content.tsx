import dynamic from "next/dynamic";
// eslint-disable-next-line no-restricted-imports
import { Header } from "@/components/layout/Header";
// eslint-disable-next-line no-restricted-imports
import { Footer } from "@/components/layout/Footer";
// eslint-disable-next-line no-restricted-imports
import { HeroShell } from "@/components/home/hero/HeroShell";
import { SkeletonBlock } from "@/components/ui/skeleton";
import type { HomePageData } from "@/lib/data/home";
import type { Product } from "@/features/products/types";

// Dynamic imports for below-the-fold sections with skeleton fallbacks
const DepartmentTabs = dynamic(
  () =>
    import("@/components/home/department-tabs").then((mod) => ({
      default: mod.DepartmentTabs,
    })),
  {
    loading: () => <SkeletonBlock className="h-64 w-full" />,
  }
);

const ServiceShowcase = dynamic(
  () =>
    import("@/components/home/service-showcase").then((mod) => ({
      default: mod.ServiceShowcase,
    })),
  {
    loading: () => <SkeletonBlock className="h-96 w-full" />,
  }
);

const ProductRevealSection = dynamic(
  () =>
    import("@/components/home/product-reveal-section").then((mod) => ({
      default: mod.ProductRevealSection,
    })),
  {
    loading: () => <SkeletonBlock className="h-[600px] w-full" />,
  }
);

const TrendingNow = dynamic(
  () =>
    import("@/components/home/trending-now").then((mod) => ({
      default: mod.TrendingNow,
    })),
  {
    loading: () => <SkeletonBlock className="h-80 w-full" />,
  }
);

const CategorySpotlight = dynamic(
  () =>
    import("@/components/home/category-spotlight").then((mod) => ({
      default: mod.CategorySpotlight,
    })),
  {
    loading: () => <SkeletonBlock className="h-[500px] w-full" />,
  }
);

const LatestProductsCarousel = dynamic(
  () =>
    import("@/components/home/deals-carousel").then((mod) => ({
      default: mod.LatestProductsCarousel,
    })),
  {
    loading: () => <SkeletonBlock className="h-72 w-full" />,
  }
);

const BrandStory = dynamic(
  () =>
    import("@/components/home/brand-story").then((mod) => ({
      default: mod.BrandStory,
    })),
  {
    loading: () => <SkeletonBlock className="h-80 w-full" />,
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

        {/* Department Tabs */}
        <DepartmentTabs
          categories={data.categories}
          productsByCategory={productsByCategory}
        />

        {/* Service Showcase */}
        <ServiceShowcase />

        {/* Product Reveal */}
        <ProductRevealSection
          products={data.trendingProducts}
          categories={data.categories}
        />

        {/* Trending Now */}
        <TrendingNow
          trendingProducts={data.trendingProducts}
          categories={data.categories || []}
        />

        {/* Category Spotlight */}
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

        {/* Latest Products */}
        <LatestProductsCarousel products={data.latestProducts} />

        {/* Brand Story */}
        <BrandStory />
      </main>
      <Footer />
    </div>
  );
}
