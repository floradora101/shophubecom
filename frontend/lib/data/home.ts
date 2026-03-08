// Homepage data layer - uses API by default, can switch to mocks.
// Mock data loaded via dynamic import() so it is tree-shaken from production.
import { productsApi } from "@/features/products/api";
import { categoriesApi } from "@/features/categories/api";
import { heroSlidesApi } from "@/features/hero-slides/api";
import { departmentsApi } from "@/features/departments/api";
import type { Category, Product } from "@/features/products/types";
import type { HeroSlide } from "@/lib/types/heroSlides.types";
import type { Department } from "@/features/departments";

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
  /** Active department spotlights (from admin Subcategories). Used by DepartmentTabs on homepage. */
  departments: Department[];
  // Precomputed mappings for performance
  productsByCategory: Record<string, Product[]>;
  productsBySlug: Record<string, Product>;
  stats: {
    totalProducts: number;
    happyCustomers: number;
    yearsExperience: number;
  };
}

import { USE_MOCKS } from "@/lib/flags";
import { SITE_STATS } from "@/lib/constants/site";

function createEmptyHomePageData(totalProducts: number = 0): HomePageData {
  return {
    phonesProducts: [],
    tabletsProducts: [],
    laptopsProducts: [],
    wearablesProducts: [],
    smartGadgetsProducts: [],
    gamingConsoleProducts: [],
    accessoriesProducts: [],
    gamingLaptopsProducts: [],
    featuredProducts: [],
    categories: [],
    trendingProducts: [],
    deals: [],
    heroSlides: [],
    latestProducts: [],
    departments: [],
    productsByCategory: {},
    productsBySlug: {},
    stats: {
      totalProducts,
      happyCustomers: SITE_STATS.happyCustomers,
      yearsExperience: SITE_STATS.yearsExperience,
    },
  };
}

/** Build homepage data from mock data. Uses dynamic import for tree-shaking. */
async function buildHomePageDataFromMocks(): Promise<HomePageData> {
  const [
    { mockProducts, mockProductToProduct, mockCategories, mockCategoryToCategory },
    { HERO_SLIDES },
  ] = await Promise.all([
    import("@/lib/mock-data/mock-data").catch((err) => {
      throw new Error(`Failed to load mock data: ${err instanceof Error ? err.message : "Unknown error"}`);
    }),
    import("@/dev/mocks/heroSlides.mock").catch((err) => {
      throw new Error(`Failed to load hero slides mock: ${err instanceof Error ? err.message : "Unknown error"}`);
    }),
  ]);

  const result: Omit<HomePageData, "productsByCategory" | "productsBySlug"> = {
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
      departments: [],
      deals: [], // mockDeals.map(mockDealToProduct),
      stats: {
        totalProducts: 12500,
        happyCustomers: SITE_STATS.happyCustomers,
        yearsExperience: SITE_STATS.yearsExperience,
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

export async function getHomePageData(): Promise<HomePageData> {
  if (USE_MOCKS) {
    return buildHomePageDataFromMocks();
  }

  try {
      // Fetch all required data from API in parallel
      // Use Promise.allSettled to handle individual failures gracefully
      const [
        categoriesResult,
        featuredProductsResult,
        latestProductsResult,
        allProductsResult,
        activeHeroSlidesResult,
        activeDepartmentsResult,
      ] = await Promise.allSettled([
        categoriesApi.getCategoriesTree(),
        productsApi.getFeaturedProducts(),
        productsApi.getLatestProducts(),
        productsApi.getProducts({ limit: 300, page: 1 }), // Products for homepage category sections
        heroSlidesApi.getActiveSlides(), // Fetch active hero slides from database
        departmentsApi.getActiveDepartments(), // Active department spotlights for DepartmentTabs
      ]);

      // Extract data with fallbacks
      const categories =
        categoriesResult.status === 'fulfilled'
          ? categoriesResult.value || []
          : [];
      const featuredProducts =
        featuredProductsResult.status === 'fulfilled'
          ? featuredProductsResult.value || []
          : [];
      const latestProducts =
        latestProductsResult.status === 'fulfilled'
          ? latestProductsResult.value || []
          : [];
      const allProducts =
        allProductsResult.status === 'fulfilled'
          ? allProductsResult.value?.data || []
          : [];
      const allProductsTotal =
        allProductsResult.status === 'fulfilled'
          ? allProductsResult.value?.total || 0
          : 0;

      const heroSlides =
        activeHeroSlidesResult.status === "fulfilled"
          ? activeHeroSlidesResult.value || []
          : [];

      if (activeHeroSlidesResult.status === "rejected") {
        console.warn(
          "[HomePage] Failed to fetch hero slides from API; returning an empty real-mode state:",
          activeHeroSlidesResult.reason
        );
      }

      const departments =
        activeDepartmentsResult.status === 'fulfilled'
          ? activeDepartmentsResult.value ?? []
          : [];

      if (activeDepartmentsResult.status === 'rejected') {
        console.warn(
          '[HomePage] Failed to fetch active departments from API:',
          activeDepartmentsResult.reason
        );
      }

      // Flatten category tree for lookups (getCategoriesTree returns nested roots with children)
      const flattenCategories = (cats: Category[]): Category[] => {
        const result: Category[] = [];
        for (const c of cats) {
          result.push(c);
          if (c.children?.length) {
            result.push(...flattenCategories(c.children));
          }
        }
        return result;
      };
      const flatCategories = flattenCategories(categories);

      // Helper function to get products by category slug (includes subcategories), sorted by latest first
      const getProductsByCategorySlug = (categorySlug: string, limit: number = 8): Product[] => {
        const category = flatCategories.find((c) => c.slug === categorySlug);
        if (!category) return [];

        const getDescendantIds = (cat: Category): string[] => {
          const ids = [cat.id];
          const children = cat.children?.length
            ? cat.children
            : flatCategories.filter((c) => c.parentId === cat.id);
          children.forEach((child) => {
            ids.push(...getDescendantIds(child));
          });
          return ids;
        };

        const categoryIds = getDescendantIds(category);
        return allProducts
          .filter((p) => p.categoryId && categoryIds.includes(p.categoryId))
          .sort((a, b) => {
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return bTime - aTime;
          })
          .slice(0, limit);
      };

      const result: Omit<HomePageData, "productsByCategory" | "productsBySlug"> = {
        phonesProducts: getProductsByCategorySlug("phones", 8),
        tabletsProducts: getProductsByCategorySlug("tablets", 8),
        laptopsProducts: getProductsByCategorySlug("laptops", 8),
        wearablesProducts: getProductsByCategorySlug("wearables", 8),
        smartGadgetsProducts: getProductsByCategorySlug("smart-gadgets", 8),
        gamingConsoleProducts: getProductsByCategorySlug("gaming-console", 8),
        accessoriesProducts: getProductsByCategorySlug("accessories", 8),
        gamingLaptopsProducts: getProductsByCategorySlug("gaming-laptops", 8),
        featuredProducts: featuredProducts.slice(0, 4),
        categories: categories,
        trendingProducts: allProducts.slice(4, 12),
        heroSlides: heroSlides, // Use slides from database
        latestProducts: latestProducts.slice(0, 8),
        departments,
        deals: [],
        stats: {
          totalProducts: allProductsTotal,
          happyCustomers: SITE_STATS.happyCustomers,
          yearsExperience: SITE_STATS.yearsExperience,
        },
      };

      // Precompute mappings for client performance (use flat list so subcategory products map correctly)
      const productsByCategory: Record<string, Product[]> = {};
      allProducts.forEach((product) => {
        const categorySlug = flatCategories.find((c) => c.id === product.categoryId)?.slug || "uncategorized";
        if (!productsByCategory[categorySlug]) {
          productsByCategory[categorySlug] = [];
        }
        productsByCategory[categorySlug].push(product);
      });

      // Ensure every main (root) category has latest products from itself and subcategories (for Shop by Category)
      const rootCategories = flatCategories.filter((c) => !c.parentId || c.parentId === null);
      for (const root of rootCategories) {
        productsByCategory[root.slug] = getProductsByCategorySlug(root.slug, 8);
      }

      const productsBySlug: Record<string, Product> = {};
      allProducts.forEach((product) => {
        productsBySlug[product.slug] = product;
      });

      return {
        ...result,
        productsByCategory,
        productsBySlug,
      };
  } catch (error) {
    console.error(
      "[HomePage] Failed to fetch homepage data from API; returning an empty real-mode state:",
      error
    );
    if (error instanceof Error) {
      console.error("[HomePage] Error details:", error.message);
    }
    return createEmptyHomePageData();
  }
}
