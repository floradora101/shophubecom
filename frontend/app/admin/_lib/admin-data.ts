import { Category, Product, ProductVariant } from "@/features/products/types";
import { HeroSlide } from "@/lib/types/heroSlides.types";
import { HeroSlideFormValues } from "@/lib/hero-slides/admin/form";
import {
  mockCategories,
  mockProducts,
  mockCategoryToCategory,
  mockProductToProduct,
} from "@/lib/mock-data/mock-data";
import { toFormValues, fromFormValues } from "@/lib/hero-slides/admin/form";

// localStorage keys
const STORAGE_KEYS = {
  categories: "admin_categories",
  products: "admin_products",
  heroSlides: "admin_hero_slides",
} as const;

// Utility functions for localStorage
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Failed to save to localStorage:`, error);
  }
}

// Initialize data from mocks if not already in localStorage
function initializeData() {
  const existingCategories = getFromStorage<Category[]>(
    STORAGE_KEYS.categories,
    []
  );
  if (existingCategories.length === 0) {
    const categories = mockCategories.map(mockCategoryToCategory);
    saveToStorage(STORAGE_KEYS.categories, categories);
  }

  const existingProducts = getFromStorage<Product[]>(STORAGE_KEYS.products, []);
  if (existingProducts.length === 0) {
    const products = mockProducts.map(mockProductToProduct);
    saveToStorage(STORAGE_KEYS.products, products);
  }

  const existingSlides = getFromStorage<HeroSlide[]>(
    STORAGE_KEYS.heroSlides,
    []
  );
  if (existingSlides.length === 0) {
    // Initialize with some sample hero slides
    const sampleSlides: HeroSlide[] = [
      {
        id: "sample-1",
        type: "PRODUCT_SPOTLIGHT",
        priority: 1,
        isActive: true,
        headline: "Discover Amazing Products",
        description: "Explore our curated collection of premium products",
        ctaPrimary: {
          label: "Shop Now",
          href: "/products",
        },
        media: {
          kind: "image",
          imageUrl:
            "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop",
          alt: "Product showcase",
        },
        theme: {
          accentToken: "red-black",
        },
      },
    ];
    saveToStorage(STORAGE_KEYS.heroSlides, sampleSlides);
  }
}

// Initialize data on module load
if (typeof window !== "undefined") {
  initializeData();
}

// Categories API
export function listCategories(): Category[] {
  return getFromStorage<Category[]>(STORAGE_KEYS.categories, []);
}

export function getCategory(id: string): Category | null {
  const categories = listCategories();
  return categories.find((cat) => cat.id === id) || null;
}

export function createCategory(
  data: Omit<Category, "id" | "createdAt" | "updatedAt">
): Category {
  const categories = listCategories();
  const now = new Date().toISOString();

  const newCategory: Category = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  const updatedCategories = [...categories, newCategory];
  saveToStorage(STORAGE_KEYS.categories, updatedCategories);

  return newCategory;
}

export function updateCategory(
  id: string,
  data: Partial<Omit<Category, "id" | "createdAt">>
): Category | null {
  const categories = listCategories();
  const index = categories.findIndex((cat) => cat.id === id);

  if (index === -1) return null;

  const updatedCategory: Category = {
    ...categories[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  categories[index] = updatedCategory;
  saveToStorage(STORAGE_KEYS.categories, categories);

  return updatedCategory;
}

export function deleteCategory(id: string): boolean {
  const categories = listCategories();
  const filteredCategories = categories.filter((cat) => cat.id !== id);

  if (filteredCategories.length === categories.length) return false;

  saveToStorage(STORAGE_KEYS.categories, filteredCategories);
  return true;
}

// Products API
export function listProducts(): Product[] {
  return getFromStorage<Product[]>(STORAGE_KEYS.products, []);
}

export function getProduct(id: string): Product | null {
  const products = listProducts();
  return products.find((product) => product.id === id) || null;
}

export function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">
): Product {
  const products = listProducts();
  const now = new Date().toISOString();

  const newProduct: Product = {
    ...data,
    id: crypto.randomUUID(),
    createdAt: now,
    updatedAt: now,
  };

  const updatedProducts = [...products, newProduct];
  saveToStorage(STORAGE_KEYS.products, updatedProducts);

  return newProduct;
}

export function updateProduct(
  id: string,
  data: Partial<Omit<Product, "id" | "createdAt">>
): Product | null {
  const products = listProducts();
  const index = products.findIndex((product) => product.id === id);

  if (index === -1) return null;

  const updatedProduct: Product = {
    ...products[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };

  products[index] = updatedProduct;
  saveToStorage(STORAGE_KEYS.products, products);

  return updatedProduct;
}

export function deleteProduct(id: string): boolean {
  const products = listProducts();
  const filteredProducts = products.filter((product) => product.id !== id);

  if (filteredProducts.length === products.length) return false;

  saveToStorage(STORAGE_KEYS.products, filteredProducts);
  return true;
}

// Hero Slides API
export function listHeroSlides(): HeroSlide[] {
  return getFromStorage<HeroSlide[]>(STORAGE_KEYS.heroSlides, []);
}

export function getHeroSlide(id: string): HeroSlide | null {
  const slides = listHeroSlides();
  return slides.find((slide) => slide.id === id) || null;
}

export function createHeroSlide(formValues: HeroSlideFormValues): HeroSlide {
  const slides = listHeroSlides();
  const newSlide = fromFormValues(formValues);

  const updatedSlides = [...slides, newSlide];
  saveToStorage(STORAGE_KEYS.heroSlides, updatedSlides);

  return newSlide;
}

export function updateHeroSlide(
  id: string,
  formValues: HeroSlideFormValues
): HeroSlide | null {
  const slides = listHeroSlides();
  const index = slides.findIndex((slide) => slide.id === id);

  if (index === -1) return null;

  const updatedSlide = fromFormValues(formValues, id);
  slides[index] = updatedSlide;
  saveToStorage(STORAGE_KEYS.heroSlides, slides);

  return updatedSlide;
}

export function deleteHeroSlide(id: string): boolean {
  const slides = listHeroSlides();
  const filteredSlides = slides.filter((slide) => slide.id !== id);

  if (filteredSlides.length === slides.length) return false;

  saveToStorage(STORAGE_KEYS.heroSlides, filteredSlides);
  return true;
}

// Utility functions for admin dashboard
export function getDashboardStats() {
  const products = listProducts();
  const categories = listCategories();
  const heroSlides = listHeroSlides();

  const activeProducts = products.filter((p) => p.isActive !== false);
  const onSaleProducts = products.filter((p) => p.isOnSale);
  const lowStockVariants = products.flatMap(
    (p) => p.variants?.filter((v) => v.stock < 10) || []
  ).length;

  return {
    totalProducts: products.length,
    activeProducts: activeProducts.length,
    categories: categories.length,
    onSaleProducts: onSaleProducts.length,
    lowStockVariants,
    heroSlides: heroSlides.length,
    orders: 0, // Placeholder
  };
}
