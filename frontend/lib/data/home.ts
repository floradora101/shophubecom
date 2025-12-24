// Homepage data layer - uses mocks by default, can switch to API
import {
  mockProducts,
  mockProductToProduct,
  mockCategories,
  mockCategoryToCategory,
  mockDeals,
} from "@/lib/mock-data/mock-data";
import type { Category, Product } from "@/features/products/types";

// Types for homepage data (reverted to match our conversation structure)
export interface HomePageData {
  electronicsProducts: Product[];
  clothingProducts: Product[];
  homeGardenProducts: Product[];
  booksProducts: Product[];
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
    // Return mock data in the old structure from our conversation
    return {
      electronicsProducts: mockProducts
        .filter((p) => p.category === "Electronics")
        .slice(0, 8)
        .map(mockProductToProduct),
      clothingProducts: mockProducts
        .filter((p) => p.category === "Clothing")
        .slice(0, 8)
        .map(mockProductToProduct),
      homeGardenProducts: mockProducts
        .filter((p) => p.category === "Home & Garden")
        .slice(0, 8)
        .map(mockProductToProduct),
      booksProducts: mockProducts
        .filter((p) => p.category === "Books")
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

  // For now, always return mocks in old structure
  return {
    electronicsProducts: mockProducts
      .filter((p) => p.category === "Electronics")
      .slice(0, 8)
      .map(mockProductToProduct),
    clothingProducts: mockProducts
      .filter((p) => p.category === "Clothing")
      .slice(0, 8)
      .map(mockProductToProduct),
    homeGardenProducts: mockProducts
      .filter((p) => p.category === "Home & Garden")
      .slice(0, 8)
      .map(mockProductToProduct),
    booksProducts: mockProducts
      .filter((p) => p.category === "Books")
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
