// Homepage data layer - uses mocks by default, can switch to API
import {
  mockProducts,
  mockProductToProduct,
  mockCategories,
  mockCategoryToCategory,
  mockDeals,
} from "@/lib/mock-data/mock-data";
import type { Category, Product } from "@/features/products/types";

// Types for homepage data (updated to match new category structure)
export interface HomePageData {
  phonesProducts: Product[];
  tabletsProducts: Product[];
  laptopsProducts: Product[];
  wearablesProducts: Product[];
  smartGadgetsProducts: Product[];
  gamingConsoleProducts: Product[];
  accessoriesProducts: Product[];
  featuredProducts: Product[];
  categories: Category[];
  trendingProducts: Product[];
  deals: Product[];
  stats: {
    totalProducts: number;
    happyCustomers: number;
    yearsExperience: number;
  };
}

// Check if we should use mock data (default: true for homepage)
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export async function getHomePageData(): Promise<HomePageData> {
  if (USE_MOCKS) {
    // Return mock data with new category structure
    return {
      phonesProducts: mockProducts
        .filter(
          (p) =>
            p.categorySlug === "phones" ||
            p.categorySlug?.startsWith("iphone") ||
            p.categorySlug?.startsWith("samsung-phones") ||
            p.categorySlug?.startsWith("nokia")
        )
        .slice(0, 8)
        .map(mockProductToProduct),
      tabletsProducts: mockProducts
        .filter(
          (p) =>
            p.categorySlug === "tablets" ||
            p.categorySlug?.startsWith("apple-tablets") ||
            p.categorySlug?.startsWith("samsung-tablets")
        )
        .slice(0, 8)
        .map(mockProductToProduct),
      laptopsProducts: mockProducts
        .filter(
          (p) =>
            p.categorySlug === "laptops" ||
            p.categorySlug?.startsWith("macbook") ||
            p.categorySlug?.startsWith("gaming-laptops") ||
            p.categorySlug?.startsWith("business-laptops")
        )
        .slice(0, 8)
        .map(mockProductToProduct),
      wearablesProducts: mockProducts
        .filter(
          (p) =>
            p.categorySlug === "wearables" ||
            p.categorySlug?.startsWith("smart-watches") ||
            p.categorySlug?.startsWith("earphones") ||
            p.categorySlug?.startsWith("headsets")
        )
        .slice(0, 8)
        .map(mockProductToProduct),
      smartGadgetsProducts: mockProducts
        .filter(
          (p) =>
            p.categorySlug === "smart-gadgets" ||
            p.categorySlug?.startsWith("smart-cameras") ||
            p.categorySlug?.startsWith("smart-stands") ||
            p.categorySlug?.startsWith("other-gadgets")
        )
        .slice(0, 8)
        .map(mockProductToProduct),
      gamingConsoleProducts: mockProducts
        .filter(
          (p) =>
            p.categorySlug === "gaming-console" ||
            p.categorySlug?.startsWith("gaming-consoles") ||
            p.categorySlug?.startsWith("gaming-controllers") ||
            p.categorySlug?.startsWith("gaming-games")
        )
        .slice(0, 8)
        .map(mockProductToProduct),
      accessoriesProducts: mockProducts
        .filter(
          (p) =>
            p.categorySlug === "accessories" ||
            p.categorySlug?.startsWith("phone-cases") ||
            p.categorySlug?.startsWith("bags-cases") ||
            p.categorySlug?.startsWith("screen-protectors")
        )
        .slice(0, 8)
        .map(mockProductToProduct),
      featuredProducts: mockProducts.slice(0, 4).map(mockProductToProduct),
      categories: mockCategories
        .filter((cat) => !cat.parentId || cat.parentId === null)
        .map(mockCategoryToCategory),
      trendingProducts: mockProducts.slice(4, 12).map(mockProductToProduct),
      deals: [], // mockDeals.map(mockDealToProduct),
      stats: {
        totalProducts: 12500,
        happyCustomers: 50000,
        yearsExperience: 8,
      },
    };
  }

  // TODO: Replace with actual API calls when backend is ready
  // This code is commented out but kept for future implementation
  /*
  try {
    const [categoriesRes, productsRes, dealsRes] = await Promise.all([
      fetch('/api/categories'),
      fetch('/api/products/featured'),
      fetch('/api/deals')
    ]);

    const categories = await categoriesRes.json();
    const products = await productsRes.json();
    const deals = await dealsRes.json();

    return {
      categories,
      featuredProducts: products.featured,
      latestProducts: products.latest,
      deals,
      // ... other data
    };
  } catch (error) {
    console.error('Failed to fetch homepage data:', error);
    // Fallback to mocks if API fails
    return getHomePageData();
  }
  */

  // Return mock data with new category structure
  return {
    phonesProducts: mockProducts
      .filter(
        (p) =>
          p.categorySlug === "phones" ||
          p.categorySlug?.startsWith("iphone") ||
          p.categorySlug?.startsWith("samsung-phones") ||
          p.categorySlug?.startsWith("nokia")
      )
      .slice(0, 8)
      .map(mockProductToProduct),
    tabletsProducts: mockProducts
      .filter(
        (p) =>
          p.categorySlug === "tablets" ||
          p.categorySlug?.startsWith("apple-tablets") ||
          p.categorySlug?.startsWith("samsung-tablets")
      )
      .slice(0, 8)
      .map(mockProductToProduct),
    laptopsProducts: mockProducts
      .filter(
        (p) =>
          p.categorySlug === "laptops" ||
          p.categorySlug?.startsWith("macbook") ||
          p.categorySlug?.startsWith("gaming-laptops") ||
          p.categorySlug?.startsWith("business-laptops")
      )
      .slice(0, 8)
      .map(mockProductToProduct),
    wearablesProducts: mockProducts
      .filter(
        (p) =>
          p.categorySlug === "wearables" ||
          p.categorySlug?.startsWith("smart-watches") ||
          p.categorySlug?.startsWith("earphones") ||
          p.categorySlug?.startsWith("headsets")
      )
      .slice(0, 12)
      .map(mockProductToProduct),
    smartGadgetsProducts: mockProducts
      .filter(
        (p) =>
          p.categorySlug === "smart-gadgets" ||
          p.categorySlug?.startsWith("smart-cameras") ||
          p.categorySlug?.startsWith("smart-stands") ||
          p.categorySlug?.startsWith("other-gadgets")
      )
      .slice(0, 8)
      .map(mockProductToProduct),
    gamingConsoleProducts: mockProducts
      .filter(
        (p) =>
          p.categorySlug === "gaming-console" ||
          p.categorySlug?.startsWith("gaming-consoles") ||
          p.categorySlug?.startsWith("gaming-controllers") ||
          p.categorySlug?.startsWith("gaming-games")
      )
      .slice(0, 8)
      .map(mockProductToProduct),
    accessoriesProducts: mockProducts
      .filter(
        (p) =>
          p.categorySlug === "accessories" ||
          p.categorySlug?.startsWith("phone-cases") ||
          p.categorySlug?.startsWith("bags-cases") ||
          p.categorySlug?.startsWith("screen-protectors")
      )
      .slice(0, 8)
      .map(mockProductToProduct),
    featuredProducts: mockProducts.slice(0, 4).map(mockProductToProduct),
    categories: mockCategories
      .filter((cat) => !cat.parentId || cat.parentId === null)
      .map(mockCategoryToCategory),
    trendingProducts: mockProducts.slice(4, 12).map(mockProductToProduct),
    deals: [], // mockDeals.map(mockDealToProduct),
    stats: {
      totalProducts: 12500,
      happyCustomers: 50000,
      yearsExperience: 8,
    },
  };
}
