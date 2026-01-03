// Homepage data layer - uses mocks by default, can switch to API
import {
  mockProducts,
  mockProductToProduct,
  mockCategories,
  mockCategoryToCategory,
} from "@/lib/mock-data/mock-data";
import { HERO_SLIDES } from "@/dev/mocks/heroSlides.mock";
import type { Category, Product } from "@/features/products/types";
import type { HeroSlide } from "@/lib/types/heroSlides.types";

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
  heroSlides: HeroSlide[];
  latestProducts: Product[]; // For carousel
  // Precomputed mappings for performance
  productsByCategory: Record<string, Product[]>;
  productsBySlug: Record<string, Product>;
  stats: {
    totalProducts: number;
    happyCustomers: number;
    yearsExperience: number;
  };
}

// Check if we should use mock data (default: true for homepage)
const USE_MOCKS = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export async function getHomePageData(): Promise<HomePageData> {
  let result: Omit<HomePageData, "productsByCategory" | "productsBySlug">;

  if (USE_MOCKS) {
    // Return mock data with new category structure
    result = {
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
      heroSlides: HERO_SLIDES,
      latestProducts: mockProducts.slice(0, 8).map(mockProductToProduct),
      deals: [], // mockDeals.map(mockDealToProduct),
      stats: {
        totalProducts: 12500,
        happyCustomers: 50000,
        yearsExperience: 8,
      },
    };

    // Precompute mappings for client performance
    const productsByCategory: Record<string, Product[]> = {
      phones: result.phonesProducts,
      tablets: result.tabletsProducts,
      laptops: result.laptopsProducts,
      wearables: result.wearablesProducts,
      "smart-gadgets": result.smartGadgetsProducts,
      "gaming-console": result.gamingConsoleProducts,
      accessories: result.accessoriesProducts,
    };

    const productsBySlug: Record<string, Product> = [
      ...result.phonesProducts,
      ...result.tabletsProducts,
      ...result.laptopsProducts,
      ...result.wearablesProducts,
      ...result.smartGadgetsProducts,
      ...result.gamingConsoleProducts,
      ...result.accessoriesProducts,
      ...result.featuredProducts,
      ...result.trendingProducts,
    ].reduce((acc, product) => {
      acc[product.slug] = product;
      return acc;
    }, {} as Record<string, Product>);

    return {
      ...result,
      productsByCategory,
      productsBySlug,
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
  result = {
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
    heroSlides: HERO_SLIDES,
    latestProducts: mockProducts.slice(0, 8).map(mockProductToProduct),
    deals: [], // mockDeals.map(mockDealToProduct),
    stats: {
      totalProducts: 12500,
      happyCustomers: 50000,
      yearsExperience: 8,
    },
  };

  // Precompute mappings for client performance
  const data = result;
  const productsByCategory: Record<string, Product[]> = {
    phones: data.phonesProducts,
    tablets: data.tabletsProducts,
    laptops: data.laptopsProducts,
    wearables: data.wearablesProducts,
    "smart-gadgets": data.smartGadgetsProducts,
    "gaming-console": data.gamingConsoleProducts,
    accessories: data.accessoriesProducts,
  };

  const productsBySlug: Record<string, Product> = [
    ...data.phonesProducts,
    ...data.tabletsProducts,
    ...data.laptopsProducts,
    ...data.wearablesProducts,
    ...data.smartGadgetsProducts,
    ...data.gamingConsoleProducts,
    ...data.accessoriesProducts,
    ...data.featuredProducts,
    ...data.trendingProducts,
  ].reduce((acc, product) => {
    acc[product.slug] = product;
    return acc;
  }, {} as Record<string, Product>);

  return {
    ...result,
    productsByCategory,
    productsBySlug,
  };
}
