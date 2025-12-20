// Client component for homepage content.
"use client";

import {
  HeroCarousel,
  OffersCarousel,
  CategoryTabs,
  ProductCarousel,
  useFeaturedProductsQuery,
  useLatestProductsQuery,
  useProductsQuery,
} from "@/features/products";
import { useCategoriesQuery } from "@/features/categories";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useMemo } from "react";

export function HomePageContent() {
  const { data: featuredProducts = [], isLoading: isLoadingFeatured } =
    useFeaturedProductsQuery();
  const { data: latestProducts = [], isLoading: isLoadingLatest } =
    useLatestProductsQuery();

  // Fetch categories to find Mobile Phones and Tablets category IDs
  const { data: categories = [], isLoading: isLoadingCategories } =
    useCategoriesQuery();

  // Find Phones category - based on seed data: "Phones" (slug: "phones")
  // Note: "Phones" is a child of "Electronics", not a root category
  const phoneCategory = useMemo(() => {
    // Try exact matches first (based on seed data: name="Phones", slug="phones")
    let category = categories.find(
      (cat) =>
        cat.name.toLowerCase() === "phones" ||
        cat.slug.toLowerCase() === "phones" ||
        cat.name.toLowerCase() === "mobile phones" ||
        cat.slug.toLowerCase() === "mobile-phones"
    );

    // If not found, try partial matches (any category with "phone" in name/slug)
    // Don't check parentId - "Phones" itself has a parent (Electronics)
    if (!category) {
      category = categories.find(
        (cat) =>
          (cat.name.toLowerCase().includes("phone") ||
            cat.slug.toLowerCase().includes("phone") ||
            cat.name.toLowerCase().includes("mobile")) &&
          // Make sure it's not a brand category (brands are children of Phones)
          // Check if it has children - parent categories have children
          categories.some((c) => c.parentId === cat.id)
      );
    }

    return category;
  }, [categories]);

  const tabletCategory = useMemo(() => {
    // Try exact matches first
    let category = categories.find(
      (cat) =>
        cat.name.toLowerCase() === "tablets" ||
        cat.slug.toLowerCase() === "tablets"
    );

    // If not found, try partial matches (parent categories only)
    if (!category) {
      category = categories.find(
        (cat) => cat.name.toLowerCase().includes("tablet") && !cat.parentId // Only parent categories
      );
    }

    return category;
  }, [categories]);

  // Get all child category IDs (brands) for phones and tablets
  const phoneCategoryIds = useMemo(() => {
    if (!phoneCategory) return [];
    // Include parent + all children
    const children = categories.filter(
      (cat) => cat.parentId === phoneCategory.id
    );
    return [phoneCategory.id, ...children.map((c) => c.id)];
  }, [categories, phoneCategory]);

  const tabletCategoryIds = useMemo(() => {
    if (!tabletCategory) return [];
    // Include parent + all children
    const children = categories.filter(
      (cat) => cat.parentId === tabletCategory.id
    );
    return [tabletCategory.id, ...children.map((c) => c.id)];
  }, [categories, tabletCategory]);

  // Fetch ALL products (no category filter) so we can filter by all child categories client-side
  // Products are likely in child categories (Apple, Samsung, etc.), not the parent "Phones" category
  const { data: allProductsData, isLoading: isLoadingAllProducts } =
    useProductsQuery({
      limit: 500, // Get enough products to include all brands
    });

  // Filter products to include only those from phone categories (parent + all children)
  const mobilePhoneProducts = useMemo(() => {
    if (phoneCategoryIds.length === 0 || !allProductsData?.data) return [];
    return allProductsData.data.filter((p) =>
      phoneCategoryIds.includes(p.categoryId || "")
    );
  }, [allProductsData?.data, phoneCategoryIds]);

  // Filter products to include only those from tablet categories (parent + all children)
  const tabletProducts = useMemo(() => {
    if (tabletCategoryIds.length === 0 || !allProductsData?.data) return [];
    return allProductsData.data.filter((p) =>
      tabletCategoryIds.includes(p.categoryId || "")
    );
  }, [allProductsData?.data, tabletCategoryIds]);

  // For offers, we'll use featured products with discounts as a fallback
  // In the future, this could come from a dedicated offers/promotions endpoint
  // If no products have discounts, show featured products anyway
  const productsWithDiscounts = featuredProducts.filter(
    (p) => p.isOnSale || p.discount
  );
  const offerProducts =
    productsWithDiscounts.length > 0
      ? productsWithDiscounts.slice(0, 12).map((p) => ({
          ...p,
          originalPrice: p.discount?.originalPrice || p.price,
          discountPercent: p.discount?.discountPercent || 0,
        }))
      : featuredProducts.slice(0, 12).map((p) => ({
          ...p,
          originalPrice: p.price,
          discountPercent: 0,
        }));

  // Phone brand tabs - filter by category name
  // Add "All" as first tab to show all phone products
  const phoneTabs = [
    { id: "all", label: "All" },
    { id: "apple", label: "Apple" },
    { id: "samsung", label: "Samsung" },
    { id: "xiaomi", label: "Xiaomi" },
    { id: "honor", label: "Honor" },
    { id: "tecno", label: "Tecno" },
    { id: "infinix", label: "Infinix" },
  ];

  // Tablet brand tabs - filter by category name
  // Add "All" as first tab to show all tablet products
  const tabletTabs = [
    { id: "all", label: "All" },
    { id: "apple", label: "Apple" },
    { id: "samsung", label: "Samsung" },
    { id: "lenovo", label: "Lenovo" },
    { id: "huawei", label: "Huawei" },
    { id: "xiaomi", label: "Xiaomi" },
  ];

  // Show initial loading state only when all critical data is loading
  const isInitialLoading =
    isLoadingFeatured && isLoadingLatest && isLoadingCategories;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Header />
      <main className="flex-1">
        {/* Initial Loading State */}
        {isInitialLoading ? (
          <div className="py-12 md:py-16">
            <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* Hero Carousel */}
            {isLoadingFeatured ? (
              <div className="h-[400px] bg-gray-100 animate-pulse" />
            ) : (
              featuredProducts.length > 0 && (
                <HeroCarousel products={featuredProducts.slice(0, 5)} />
              )
            )}

            {/* Latest Products Carousel */}
            {isLoadingLatest ? (
              <div className="py-12 bg-white">
                <div className="container mx-auto px-4">
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-gray-100 rounded-xl animate-pulse aspect-3/4"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              latestProducts.length > 0 && (
                <ProductCarousel
                  products={latestProducts.slice(0, 12)}
                  title="Latest Products"
                  className="bg-white"
                />
              )
            )}

            {/* Offers Carousel (Admin-managed) */}
            {!isLoadingFeatured && offerProducts.length > 0 && (
              <OffersCarousel products={offerProducts} className="bg-white" />
            )}

            {/* Featured Products Carousel */}
            {!isLoadingFeatured && featuredProducts.length > 0 && (
              <ProductCarousel
                products={featuredProducts.slice(0, 12)}
                title="Featured Products"
                className="bg-gray-50"
              />
            )}

            {/* Mobile Phones Section */}
            {isLoadingCategories || isLoadingAllProducts ? (
              <div className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                  <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="bg-gray-100 rounded-xl animate-pulse aspect-3/4"
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              phoneCategoryIds.length > 0 &&
              mobilePhoneProducts.length > 0 && (
                <CategoryTabs
                  title="Mobile Phones"
                  tabs={phoneTabs}
                  products={mobilePhoneProducts}
                  className="bg-gray-50"
                />
              )
            )}

            {/* Tablets Section */}
            {!isLoadingCategories &&
              !isLoadingAllProducts &&
              tabletCategoryIds.length > 0 &&
              tabletProducts.length > 0 && (
                <CategoryTabs
                  title="Tablets"
                  tabs={tabletTabs}
                  products={tabletProducts}
                  className="bg-gray-50"
                />
              )}

            {/* Empty State */}
            {!isLoadingFeatured &&
              !isLoadingLatest &&
              featuredProducts.length === 0 &&
              latestProducts.length === 0 && (
                <section className="py-12 md:py-16">
                  <div className="container mx-auto px-4 text-center">
                    <p className="text-gray-600">
                      No products available at the moment. Please check back
                      later.
                    </p>
                  </div>
                </section>
              )}
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}
