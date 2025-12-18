// Storefront home page.
import type { Metadata } from "next";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { OffersCarousel } from "@/components/home/OffersCarousel";
import { CategoryTabs } from "@/components/home/CategoryTabs";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import {
  getFeaturedProducts,
  getLatestProducts,
  getOfferProducts,
} from "@/lib/data/mockCatalog";
import type { Product } from "@/lib/types/product.types";

export const metadata: Metadata = {
  title: "ShopHub - Your Trusted Online Shopping Destination",
  description:
    "Discover amazing products at unbeatable prices. Quality you can trust, delivered to your door.",
};

// Phone brand tabs
const phoneTabs = [
  { id: "apple", label: "Apple" },
  { id: "samsung", label: "Samsung" },
  { id: "xiaomi", label: "Xiaomi" },
  { id: "honor", label: "Honor" },
  { id: "tecno", label: "Tecno" },
  { id: "infinix", label: "Infinix" },
];

// Tablet brand tabs
const tabletTabs = [
  { id: "apple", label: "Apple" },
  { id: "samsung", label: "Samsung" },
  { id: "lenovo", label: "Lenovo" },
  { id: "huawei", label: "Huawei" },
  { id: "xiaomi", label: "Xiaomi" },
];

export default function HomePage() {
  const featuredProducts: Product[] = getFeaturedProducts();
  const latestProducts: Product[] = getLatestProducts();
  const offerProducts = getOfferProducts();

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Hero Carousel */}
        {featuredProducts.length > 0 && (
          <HeroCarousel products={featuredProducts.slice(0, 5)} />
        )}

        {/* Offers Carousel (Admin-managed) */}
        {offerProducts.length > 0 && (
          <OffersCarousel products={offerProducts} className="bg-white" />
        )}
        {/* Mobile Phones Section */}
        {featuredProducts.length > 0 && (
          <CategoryTabs
            title="Mobile Phones"
            tabs={phoneTabs}
            products={featuredProducts}
            className="bg-gray-50"
          />
        )}

        {/* Tablets Section */}
        {latestProducts.length > 0 && (
          <CategoryTabs
            title="Tablets"
            tabs={tabletTabs}
            products={latestProducts}
            className="bg-gray-50"
          />
        )}

        {/* Empty State */}
        {featuredProducts.length === 0 && latestProducts.length === 0 && (
          <section className="py-12 md:py-16">
            <div className="container mx-auto px-4 text-center">
              <p className="text-gray-600">
                No products available at the moment. Please check back later.
              </p>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
