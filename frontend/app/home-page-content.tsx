import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroShell } from "@/components/home/hero/HeroShell";
import { ServiceShowcase } from "@/components/home/service-showcase";
import { ProductRevealSection } from "@/components/home/product-reveal-section";
import { DepartmentTabs } from "@/components/home/department-tabs";
import { CategorySpotlight } from "@/components/home/category-spotlight";
import { TrendingNow } from "@/components/home/trending-now";
import { LatestProductsCarousel } from "@/components/home/deals-carousel";
import { BrandStory } from "@/components/home/brand-story";
import type { HomePageData } from "@/lib/data/home";
import type { Product } from "@/features/products/types";

// All components are now imported normally since we removed dynamic loading
// Dynamic imports were only needed for code splitting with Suspense/loading states

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
