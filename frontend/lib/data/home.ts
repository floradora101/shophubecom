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
  gamingLaptopsProducts: Product[];
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
      gamingLaptopsProducts: mockProducts
        .filter((p) => p.categorySlug?.startsWith("gaming-laptops"))
        .slice(0, 8)
        .map(mockProductToProduct),
      featuredProducts: mockProducts.slice(0, 4).map(mockProductToProduct),
      categories: mockCategories.map(mockCategoryToCategory),
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
    const productsByCategory: Record<string, Product[]> = {};

    // Map all products to their respective categories
    mockProducts.forEach((p) => {
      const product = mockProductToProduct(p);
      const categorySlug = p.categorySlug || "uncategorized";
      if (!productsByCategory[categorySlug]) {
        productsByCategory[categorySlug] = [];
      }
      productsByCategory[categorySlug].push(product);
    });

    // Ensure main categories also have their sliced products if they were precomputed
    productsByCategory.phones = result.phonesProducts;
    productsByCategory.tablets = result.tabletsProducts;
    productsByCategory.laptops = result.laptopsProducts;
    productsByCategory.wearables = result.wearablesProducts;
    productsByCategory["smart-gadgets"] = result.smartGadgetsProducts;
    productsByCategory["gaming-console"] = result.gamingConsoleProducts;
    productsByCategory.accessories = result.accessoriesProducts;
    productsByCategory["gaming-laptops"] = result.gamingLaptopsProducts;

    const productsBySlug: Record<string, Product> = mockProducts.reduce((acc, p) => {
      const product = mockProductToProduct(p);
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
    gamingLaptopsProducts: mockProducts
      .filter((p) => p.categorySlug?.startsWith("gaming-laptops"))
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
    categories: mockCategories.map(mockCategoryToCategory),
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
  const productsByCategory: Record<string, Product[]> = {};

  // Map all products to their respective categories
  mockProducts.forEach((p) => {
    const product = mockProductToProduct(p);
    const categorySlug = p.categorySlug || "uncategorized";
    if (!productsByCategory[categorySlug]) {
      productsByCategory[categorySlug] = [];
    }
    productsByCategory[categorySlug].push(product);
  });

  // Ensure main categories also have their sliced products if they were precomputed
  productsByCategory.phones = data.phonesProducts;
  productsByCategory.tablets = data.tabletsProducts;
  productsByCategory.laptops = data.laptopsProducts;
  productsByCategory.wearables = data.wearablesProducts;
  productsByCategory["smart-gadgets"] = data.smartGadgetsProducts;
  productsByCategory["gaming-console"] = data.gamingConsoleProducts;
  productsByCategory.accessories = data.accessoriesProducts;
  productsByCategory["gaming-laptops"] = data.gamingLaptopsProducts;

  const productsBySlug: Record<string, Product> = {};
  mockProducts.forEach((p) => {
    const product = mockProductToProduct(p);
    productsBySlug[product.slug] = product;
  });

  return {
    ...result,
    productsByCategory,
    productsBySlug,
  };
}
