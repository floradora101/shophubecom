// Mock data for admin dashboard entities.
import type {
  AdminStats,
  SalesData,
  TopProduct,
  LowStockProduct,
  AdminOrder,
  AdminProduct,
  FullOrderDetail,
} from "@/lib/types/admin.types";
import type {
  CarouselType,
  CarouselSlide,
  CustomBanner,
} from "@/lib/types/carousel.types";
import type {
  Category,
  ProductVariant,
  Promotion,
  Coupon,
} from "@/lib/types/product.types";
import {
  getProducts,
  getCategories as getCategoriesFromCatalog,
  getPromotions,
} from "./mockCatalog";

// We'll import and use promotions from mockCatalog
// For now, we'll create a local reference that can be updated
const getPromotionsFromCatalog = (): Promotion[] => {
  return getPromotions();
};

// Local storage for promotions (for admin updates)
const adminPromotions: Promotion[] = getPromotionsFromCatalog();

// Local storage for coupons (Prisma-aligned structure)
const adminCoupons: Coupon[] = [
  {
    id: "coupon-welcome-10",
    code: "WELCOME10",
    description: "10% off first order over $50",
    type: "PERCENTAGE",
    value: 10,
    minOrderTotal: 50,
    startsAt: "2024-12-01T00:00:00.000Z",
    expiresAt: "2025-12-31T23:59:59.000Z",
    usageLimit: 1000,
    perUserLimit: 1,
    isActive: true,
    createdAt: "2024-12-01T00:00:00.000Z",
    updatedAt: "2024-12-01T00:00:00.000Z",
  },
  {
    id: "coupon-holiday-25",
    code: "HOLIDAY25",
    description: "25% off holiday sale",
    type: "PERCENTAGE",
    value: 25,
    minOrderTotal: 100,
    startsAt: "2024-12-10T00:00:00.000Z",
    expiresAt: "2025-01-05T23:59:59.000Z",
    usageLimit: 500,
    perUserLimit: 2,
    isActive: true,
    createdAt: "2024-12-01T00:00:00.000Z",
    updatedAt: "2024-12-05T00:00:00.000Z",
  },
  {
    id: "coupon-clearance-50",
    code: "CLEARANCE50",
    description: "Extra $50 off clearance items",
    type: "FIXED_AMOUNT",
    value: 50,
    minOrderTotal: 200,
    startsAt: "2024-12-15T00:00:00.000Z",
    expiresAt: "2025-03-01T00:00:00.000Z",
    usageLimit: null,
    perUserLimit: null,
    isActive: true,
    createdAt: "2024-12-10T00:00:00.000Z",
    updatedAt: "2024-12-10T00:00:00.000Z",
  },
];

// Simulate API delay
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const getVariantStockSum = (variants?: ProductVariant[]) =>
  (variants || []).reduce((sum, variant) => sum + (variant.stock ?? 0), 0);
const toSlug = (value?: string, fallback = ""): string => {
  const source = value?.trim();
  if (!source) return fallback;
  return source
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

// Mock Admin Stats
export const mockAdminStats: AdminStats = {
  totalSales: 125450.75,
  totalOrders: 1248,
  totalCustomers: 342,
  lowStockItems: 12,
  pendingOrders: 23,
  processingOrders: 15,
  shippedOrders: 8,
  deliveredOrders: 1202,
};

// Mock Sales Data (last 30 days)
export const mockSalesData: SalesData[] = Array.from({ length: 30 }, (_, i) => {
  const date = new Date();
  date.setDate(date.getDate() - (29 - i));
  return {
    date: date.toISOString().split("T")[0],
    sales: Math.floor(Math.random() * 5000) + 2000,
    orders: Math.floor(Math.random() * 50) + 20,
  };
});

// Mock Top Products
export const mockTopProducts: TopProduct[] = [
  {
    id: "prod-1",
    name: "iPhone 15 Pro",
    sales: 145,
    revenue: 43455.0,
    image: "https://via.placeholder.com/150",
  },
  {
    id: "prod-2",
    name: "Samsung Galaxy S24",
    sales: 98,
    revenue: 18571.0,
    image: "https://via.placeholder.com/150",
  },
  {
    id: "prod-3",
    name: "MacBook Pro 14",
    sales: 67,
    revenue: 30150.0,
    image: "https://via.placeholder.com/150",
  },
  {
    id: "prod-4",
    name: "AirPods Pro",
    sales: 234,
    revenue: 21058.66,
    image: "https://via.placeholder.com/150",
  },
  {
    id: "prod-5",
    name: "iPad Air",
    sales: 89,
    revenue: 16108.11,
    image: "https://via.placeholder.com/150",
  },
];

// Mock Low Stock Products
export const mockLowStockProducts: LowStockProduct[] = [
  {
    id: "prod-6",
    name: "USB-C Cable",
    stock: 3,
    category: "Accessories",
    image: "https://via.placeholder.com/150",
  },
  {
    id: "prod-7",
    name: "Wireless Mouse",
    stock: 5,
    category: "Accessories",
    image: "https://via.placeholder.com/150",
  },
  {
    id: "prod-8",
    name: "Laptop Stand",
    stock: 2,
    category: "Accessories",
    image: "https://via.placeholder.com/150",
  },
  {
    id: "prod-9",
    name: "Keyboard Cover",
    stock: 4,
    category: "Accessories",
    image: "https://via.placeholder.com/150",
  },
];

// Mock Admin Orders (summary for list)
export const mockAdminOrders: AdminOrder[] = [
  {
    id: "order-1",
    orderNumber: "ORD-2024-001",
    customer: {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
    },
    status: "PENDING",
    totalAmount: 299.99,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    itemCount: 2,
  },
  {
    id: "order-2",
    orderNumber: "ORD-2024-002",
    customer: {
      id: "user-2",
      name: "Jane Smith",
      email: "jane@example.com",
    },
    status: "PROCESSING",
    totalAmount: 189.5,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    itemCount: 1,
  },
  {
    id: "order-3",
    orderNumber: "ORD-2024-003",
    customer: {
      id: "user-3",
      name: "Bob Johnson",
      email: "bob@example.com",
    },
    status: "SHIPPED",
    totalAmount: 450.0,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    itemCount: 1,
  },
  {
    id: "order-4",
    orderNumber: "ORD-2024-004",
    customer: {
      id: "user-4",
      name: "Alice Williams",
      email: "alice@example.com",
    },
    status: "DELIVERED",
    totalAmount: 125.25,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 3,
  },
  {
    id: "order-5",
    orderNumber: "ORD-2024-005",
    customer: {
      id: "user-5",
      name: "Charlie Brown",
      email: "charlie@example.com",
    },
    status: "PENDING",
    totalAmount: 89.99,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 1,
  },
  {
    id: "order-6",
    orderNumber: "ORD-2024-006",
    customer: {
      id: "user-6",
      name: "Diana Prince",
      email: "diana@example.com",
    },
    status: "CANCELLED",
    totalAmount: 199.99,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    itemCount: 2,
  },
];

// Full order details (for detail view)

const mockFullOrders: FullOrderDetail[] = [
  {
    id: "order-1",
    orderNumber: "ORD-2024-001",
    customer: {
      id: "user-1",
      name: "John Doe",
      email: "john@example.com",
    },
    status: "PENDING",
    totalAmount: 299.99,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    address: {
      id: "addr-1",
      name: "Home",
      street: "123 Main Street",
      city: "Beirut",
      state: "Beirut",
      zipCode: "1100",
      phone: "+961 3 123 456",
    },
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "iPhone 15 Pro",
        productSlug: "iphone-15-pro",
        productImage: "https://via.placeholder.com/150",
        quantity: 1,
        price: 249.99,
      },
      {
        id: "item-2",
        productId: "prod-2",
        productName: "USB-C Cable",
        productSlug: "usb-c-cable",
        productImage: "https://via.placeholder.com/150",
        quantity: 2,
        price: 25.0,
      },
    ],
    statusHistory: [
      {
        status: "PENDING",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        note: "Order placed",
      },
    ],
  },
  {
    id: "order-2",
    orderNumber: "ORD-2024-002",
    customer: {
      id: "user-2",
      name: "Jane Smith",
      email: "jane@example.com",
    },
    status: "PROCESSING",
    totalAmount: 189.5,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    address: {
      id: "addr-2",
      name: "Work",
      street: "456 Business Ave",
      city: "Beirut",
      state: "Beirut",
      zipCode: "1100",
      phone: "+961 1 234 567",
    },
    items: [
      {
        id: "item-3",
        productId: "prod-3",
        productName: "Samsung Galaxy S24",
        productSlug: "samsung-galaxy-s24",
        productImage: "https://via.placeholder.com/150",
        quantity: 1,
        price: 189.5,
      },
    ],
    statusHistory: [
      {
        status: "PENDING",
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        note: "Order placed",
      },
      {
        status: "PROCESSING",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        note: "Payment confirmed, preparing for shipment",
      },
    ],
  },
];

// Mock Carousel Types
export const mockCarouselTypes: CarouselType[] = [
  {
    id: "carousel-1",
    name: "Hero Carousel",
    slug: "hero",
    description: "Main banner carousel on homepage",
    backgroundColor: "#f3f4f6", // Default light gray
    textColor: "#171717", // Default dark gray
  },
  {
    id: "carousel-2",
    name: "Product Carousel",
    slug: "product",
    description: "Featured products carousel",
  },
  {
    id: "carousel-3",
    name: "Offers Carousel",
    slug: "offers",
    description: "Special offers and promotions carousel",
  },
];

// Mock Carousel Slides
export const mockCarouselSlides: CarouselSlide[] = [
  {
    id: "slide-1",
    carouselTypeId: "carousel-1",
    title: "New iPhone 15 Pro",
    description: "The most advanced iPhone yet",
    image: "https://via.placeholder.com/1200x600",
    ctaText: "Shop Now",
    ctaLink: "/products/iphone-15-pro",
    productId: "prod-1",
    productSlug: "iphone-15-pro",
    order: 1,
    isActive: true,
  },
  {
    id: "slide-2",
    carouselTypeId: "carousel-1",
    title: "Samsung Galaxy S24",
    description: "Experience the future",
    image: "https://via.placeholder.com/1200x600",
    ctaText: "Discover",
    ctaLink: "/products/samsung-galaxy-s24",
    productId: "prod-2",
    productSlug: "samsung-galaxy-s24",
    order: 2,
    isActive: true,
  },
];

// Mock Custom Banners
export const mockCustomBanners: CustomBanner[] = [
  {
    id: "banner-1",
    title: "Summer Sale",
    description: "Up to 50% off on selected items",
    image: "https://via.placeholder.com/800x200",
    link: "/products?category=sale",
    position: "top",
    isActive: true,
    startDate: new Date().toISOString(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// API Simulation Functions
export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    await delay(500);
    return mockAdminStats;
  },

  getSalesData: async (days: number = 30): Promise<SalesData[]> => {
    await delay(300);
    return mockSalesData.slice(-days);
  },

  getTopProducts: async (limit: number = 10): Promise<TopProduct[]> => {
    await delay(300);
    return mockTopProducts.slice(0, limit);
  },

  getLowStockProducts: async (): Promise<LowStockProduct[]> => {
    await delay(300);
    return mockLowStockProducts;
  },

  getOrders: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: AdminOrder[];
    total: number;
    page: number;
    limit: number;
  }> => {
    await delay(400);
    let filtered = [...mockAdminOrders];
    if (params?.status) {
      filtered = filtered.filter((o) => o.status === params.status);
    }
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    return {
      data: filtered.slice(start, start + limit),
      total: filtered.length,
      page,
      limit,
    };
  },

  getCarouselTypes: async (): Promise<CarouselType[]> => {
    await delay(200);
    return mockCarouselTypes;
  },

  updateCarouselType: async (
    typeId: string,
    data: Partial<CarouselType>
  ): Promise<CarouselType> => {
    await delay(500);
    const type = mockCarouselTypes.find((t) => t.id === typeId);
    if (!type) {
      throw new Error("Carousel type not found");
    }
    const updatedType: CarouselType = {
      ...type,
      ...data,
    };
    // Update in array
    const index = mockCarouselTypes.findIndex((t) => t.id === typeId);
    if (index !== -1) {
      mockCarouselTypes[index] = updatedType;
    }
    return updatedType;
  },

  getCarouselSlides: async (
    carouselTypeId: string
  ): Promise<CarouselSlide[]> => {
    await delay(300);
    return mockCarouselSlides.filter(
      (s) => s.carouselTypeId === carouselTypeId
    );
  },

  createCarouselSlide: async (
    carouselTypeId: string,
    data: Partial<CarouselSlide>
  ): Promise<CarouselSlide> => {
    await delay(500);
    const newSlide: CarouselSlide = {
      id: `slide-${Date.now()}`,
      carouselTypeId,
      title: data.title || "",
      description: data.description,
      image: data.image || "",
      ctaText: data.ctaText,
      ctaLink: data.ctaLink,
      productId: data.productId,
      productSlug: data.productSlug,
      order: data.order || 0,
      isActive: data.isActive !== undefined ? data.isActive : true,
      badgeText: data.badgeText,
      mainTitle: data.mainTitle,
      leftBackgroundColor: data.leftBackgroundColor,
      rightBackgroundColor: data.rightBackgroundColor,
      decorativeIcon: data.decorativeIcon,
      bundledItems: data.bundledItems,
      brandName: data.brandName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockCarouselSlides.push(newSlide);
    return newSlide;
  },

  updateCarouselSlide: async (
    slideId: string,
    data: Partial<CarouselSlide>
  ): Promise<CarouselSlide> => {
    await delay(500);
    const slide = mockCarouselSlides.find((s) => s.id === slideId);
    if (!slide) {
      throw new Error("Slide not found");
    }
    const updated = {
      ...slide,
      ...data,
      updatedAt: new Date().toISOString(),
    };
    const index = mockCarouselSlides.findIndex((s) => s.id === slideId);
    if (index !== -1) {
      mockCarouselSlides[index] = updated;
    }
    return updated;
  },

  deleteCarouselSlide: async (
    _slideId: string
  ): Promise<{ success: boolean }> => {
    await delay(300);
    return { success: true };
  },

  reorderCarouselSlides: async (
    _carouselTypeId: string,
    _slideIds: string[]
  ): Promise<{ success: boolean }> => {
    await delay(500);
    // In real app, this would update the order of slides
    return { success: true };
  },

  getCustomBanners: async (): Promise<CustomBanner[]> => {
    await delay(300);
    return mockCustomBanners;
  },

  createCustomBanner: async (
    data: Partial<CustomBanner>
  ): Promise<CustomBanner> => {
    await delay(500);
    const newBanner: CustomBanner = {
      id: `banner-${Date.now()}`,
      title: data.title || "",
      description: data.description,
      image: data.image || "",
      link: data.link,
      position: data.position || "top",
      isActive: data.isActive !== undefined ? data.isActive : true,
      startDate: data.startDate,
      endDate: data.endDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newBanner;
  },

  updateCustomBanner: async (
    bannerId: string,
    data: Partial<CustomBanner>
  ): Promise<CustomBanner> => {
    await delay(500);
    const banner = mockCustomBanners.find((b) => b.id === bannerId);
    if (!banner) {
      throw new Error("Banner not found");
    }
    return {
      ...banner,
      ...data,
      updatedAt: new Date().toISOString(),
    };
  },

  deleteCustomBanner: async (
    _bannerId: string
  ): Promise<{ success: boolean }> => {
    await delay(300);
    return { success: true };
  },

  getProducts: async (params?: {
    search?: string;
    categoryId?: string;
    page?: number;
    limit?: number;
    sortBy?: "name" | "price" | "stock" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<{
    data: AdminProduct[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    await delay(400);
    let products: AdminProduct[] = getProducts().map((p) => {
      const convertedVariants: ProductVariant[] = (p.variants || []).map(
        (v, idx) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const legacy = v as any;
          const options =
            legacy.options ||
            (() => {
              const derived: Record<string, string> = {};
              if (legacy.color) derived.color = legacy.color;
              if (legacy.storage) derived.storage = legacy.storage;
              return Object.keys(derived).length ? derived : undefined;
            })();
          return {
            id: legacy.id,
            sku: legacy.sku || legacy.id || `${p.slug}-var-${idx + 1}`,
            price:
              typeof legacy.price === "number" && legacy.price > 0
                ? legacy.price
                : p.price,
            stock: legacy.stock ?? 0,
            image: legacy.image,
            images: legacy.images,
            options,
          };
        }
      );
      const variantStockSum = getVariantStockSum(convertedVariants);

      const images =
        Array.isArray((p as any).images) && (p as any).images.length > 0
          ? (p as any).images.map((img: any, idx: number) =>
              typeof img === "string"
                ? { url: img, alt: p.name, position: idx }
                : img
            )
          : [];

      return {
        ...p,
        currency: (p as AdminProduct).currency || "USD",
        images,
        variants: convertedVariants,
        stock: convertedVariants.length ? variantStockSum : p.stock,
      };
    });

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          (p.description || "").toLowerCase().includes(searchLower)
      );
    }

    if (params?.categoryId) {
      products = products.filter((p) => p.categoryId === params.categoryId);
    }

    const sortBy = params?.sortBy || "createdAt";
    const sortOrder = params?.sortOrder || "desc";
    products.sort((a, b) => {
      let aVal: string | number = a[sortBy] as string | number;
      let bVal: string | number = b[sortBy] as string | number;
      if (sortBy === "price" || sortBy === "stock") {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else if (sortBy === "createdAt") {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }
      if (sortOrder === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const total = products.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedProducts = products.slice(start, start + limit);

    return {
      data: paginatedProducts,
      total,
      page,
      limit,
      totalPages,
    };
  },

  getProduct: async (id: string): Promise<AdminProduct | null> => {
    await delay(300);
    const product = getProducts().find((p) => p.id === id);
    if (!product) return null;
    // Convert old variant format to new format
    const convertedVariants: ProductVariant[] = (product.variants || []).map(
      (v, idx) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const legacy = v as any;
        const options =
          legacy.options ||
          (() => {
            const derived: Record<string, string> = {};
            if (legacy.color) derived.color = legacy.color;
            if (legacy.storage) derived.storage = legacy.storage;
            return Object.keys(derived).length ? derived : undefined;
          })();
        const stock = legacy.stock ?? 0;
        return {
          id: legacy.id,
          sku: legacy.sku || legacy.id || `${product.slug}-var-${idx + 1}`,
          price:
            typeof legacy.price === "number" && legacy.price > 0
              ? legacy.price
              : product.price,
          stock,
          image: legacy.image,
          images: legacy.images,
          options,
        };
      }
    );
    const variantStockSum = getVariantStockSum(convertedVariants);
    return {
      ...product,
      currency: (product as AdminProduct).currency || "USD",
      promotionIds: product.promotionIds || [],
      variants: convertedVariants,
      stock: convertedVariants.length ? variantStockSum : product.stock,
    };
  },

  deleteProduct: async (id: string): Promise<{ success: boolean }> => {
    await delay(500);
    // In real app, this would delete from backend
    void id; // Parameter required for API contract
    return { success: true };
  },

  createProduct: async (data: Partial<AdminProduct>): Promise<AdminProduct> => {
    await delay(800);
    const stock = data.stock ?? 0;

    const id = `prod-${Date.now()}`;
    const newProduct: AdminProduct = {
      id,
      name: data.name || "",
      slug: toSlug(data.name, data.slug || id),
      description: data.description || "",
      price: data.price || 0,
      currency: data.currency || "USD",
      stock,
      categoryId: data.categoryId || "",
      category: data.category,
      variants: data.variants || [],
      promotionIds: data.promotionIds || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const variantStockSum = getVariantStockSum(newProduct.variants);
    newProduct.stock =
      (newProduct.variants?.length ?? 0) > 0 ? variantStockSum : stock;
    return newProduct;
  },

  updateProduct: async (
    productId: string,
    data: Partial<AdminProduct>
  ): Promise<AdminProduct> => {
    await delay(800);
    // In real app, this would update in backend
    const product = getProducts().find((p) => p.id === productId) as
      | AdminProduct
      | undefined;
    if (!product) {
      throw new Error("Product not found");
    }
    const stock = data.stock ?? product.stock;

    const updatedProduct: AdminProduct = {
      ...product,
      ...data,
      id: productId,
      updatedAt: new Date().toISOString(),
      stock,
      slug: toSlug(data.name ?? product.name, product.slug),
      currency: data.currency || product.currency || "USD",
      variants: data.variants || product.variants || [],
      promotionIds: data.promotionIds ?? product.promotionIds ?? [],
    };
    const variantStockSum = getVariantStockSum(updatedProduct.variants);
    updatedProduct.stock =
      (updatedProduct.variants?.length ?? 0) > 0 ? variantStockSum : stock;
    return updatedProduct;
  },

  // Category Management
  getCategories: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Category[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    await delay(300);
    let categories = getCategoriesFromCatalog();

    // Apply search
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      categories = categories.filter(
        (c) =>
          c.name.toLowerCase().includes(searchLower) ||
          c.slug.toLowerCase().includes(searchLower) ||
          c.description?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const total = categories.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedCategories = categories.slice(start, start + limit);

    return {
      data: paginatedCategories,
      total,
      page,
      limit,
      totalPages,
    };
  },

  getCategory: async (id: string): Promise<Category | null> => {
    await delay(200);
    const categories = getCategoriesFromCatalog();
    return categories.find((c) => c.id === id) || null;
  },

  createCategory: async (data: Partial<Category>): Promise<Category> => {
    await delay(500);
    // In real app, this would create in backend
    const newCategory: Category = {
      id: `cat-${Date.now()}`,
      name: data.name || "",
      slug: data.slug || "",
      description: data.description || null,
      parentId: data.parentId || null,
      parent: data.parent || null,
      promotionIds: data.promotionIds || [],
      children: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return newCategory;
  },

  updateCategory: async (
    categoryId: string,
    data: Partial<Category>
  ): Promise<Category> => {
    await delay(500);
    // In real app, this would update in backend
    const categories = getCategoriesFromCatalog();
    const category = categories.find((c) => c.id === categoryId);
    if (!category) {
      throw new Error("Category not found");
    }
    const updatedCategory: Category = {
      ...category,
      ...data,
      id: categoryId,
      parentId: data.parentId ?? category.parentId ?? null,
      parent: data.parent ?? category.parent ?? null,
      promotionIds: data.promotionIds ?? category.promotionIds ?? [],
      updatedAt: new Date().toISOString(),
    };
    return updatedCategory;
  },

  deleteCategory: async (categoryId: string): Promise<{ success: boolean }> => {
    await delay(500);
    // In real app, this would check for products using this category
    // and prevent deletion if products exist
    const products = getProducts();
    const hasProducts = products.some((p) => p.categoryId === categoryId);
    if (hasProducts) {
      throw new Error(
        "Cannot delete category. There are products using this category."
      );
    }
    return { success: true };
  },

  getCategoryProductCount: async (categoryId: string): Promise<number> => {
    await delay(200);
    const products = getProducts();
    return products.filter((p) => p.categoryId === categoryId).length;
  },

  // Order Management
  getOrder: async (id: string): Promise<FullOrderDetail | null> => {
    await delay(300);
    const order = mockFullOrders.find((o) => o.id === id);
    if (!order) {
      // Try to find in summary list and create full detail
      const summary = mockAdminOrders.find((o) => o.id === id);
      if (summary) {
        return {
          ...summary,
          address: {
            id: "addr-default",
            name: "Default",
            street: "123 Street",
            city: "City",
            state: "State",
            zipCode: "12345",
            phone: "+1234567890",
          },
          items: [],
          statusHistory: [
            {
              status: summary.status,
              timestamp: summary.createdAt,
            },
          ],
        };
      }
      return null;
    }
    return order;
  },

  updateOrderStatus: async (
    orderId: string,
    status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED",
    note?: string
  ): Promise<FullOrderDetail> => {
    await delay(500);
    const order = mockFullOrders.find((o) => o.id === orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    const updatedOrder: FullOrderDetail = {
      ...order,
      status,
      updatedAt: new Date().toISOString(),
      statusHistory: [
        ...(order.statusHistory || []),
        {
          status,
          timestamp: new Date().toISOString(),
          note,
        },
      ],
    };
    return updatedOrder;
  },

  // Coupon Management (Prisma-aligned)
  getCoupons: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Coupon[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    await delay(300);
    let coupons = [...adminCoupons];

    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      coupons = coupons.filter(
        (c) =>
          c.code.toLowerCase().includes(searchLower) ||
          (c.description || "").toLowerCase().includes(searchLower)
      );
    }

    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const total = coupons.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedCoupons = coupons.slice(start, start + limit);

    return {
      data: paginatedCoupons,
      total,
      page,
      limit,
      totalPages,
    };
  },

  getCoupon: async (id: string): Promise<Coupon | null> => {
    await delay(200);
    return adminCoupons.find((c) => c.id === id) || null;
  },

  createCoupon: async (data: Partial<Coupon>): Promise<Coupon> => {
    await delay(500);
    const now = new Date().toISOString();
    const newCoupon: Coupon = {
      id: `coupon-${Date.now()}`,
      code: data.code || "",
      description: data.description ?? null,
      type: data.type || "PERCENTAGE",
      value: data.value ?? 0,
      minOrderTotal: data.minOrderTotal ?? null,
      startsAt: data.startsAt ? new Date(data.startsAt).toISOString() : null,
      expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
      usageLimit: data.usageLimit ?? null,
      perUserLimit: data.perUserLimit ?? null,
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: now,
      updatedAt: now,
    };
    adminCoupons.push(newCoupon);
    return newCoupon;
  },

  updateCoupon: async (
    couponId: string,
    data: Partial<Coupon>
  ): Promise<Coupon> => {
    await delay(500);
    const coupon = adminCoupons.find((c) => c.id === couponId);
    if (!coupon) {
      throw new Error("Coupon not found");
    }
    const updated: Coupon = {
      ...coupon,
      ...data,
      code: data.code ?? coupon.code,
      description: data.description ?? coupon.description,
      type: data.type ?? coupon.type,
      value: data.value ?? coupon.value,
      minOrderTotal: data.minOrderTotal ?? coupon.minOrderTotal ?? null,
      startsAt:
        data.startsAt !== undefined
          ? data.startsAt
            ? new Date(data.startsAt).toISOString()
            : null
          : coupon.startsAt ?? null,
      expiresAt:
        data.expiresAt !== undefined
          ? data.expiresAt
            ? new Date(data.expiresAt).toISOString()
            : null
          : coupon.expiresAt ?? null,
      usageLimit: data.usageLimit ?? coupon.usageLimit ?? null,
      perUserLimit: data.perUserLimit ?? coupon.perUserLimit ?? null,
      isActive: data.isActive ?? coupon.isActive,
      updatedAt: new Date().toISOString(),
    };
    const index = adminCoupons.findIndex((c) => c.id === couponId);
    if (index !== -1) {
      adminCoupons[index] = updated;
    }
    return updated;
  },

  deleteCoupon: async (couponId: string): Promise<{ success: boolean }> => {
    await delay(500);
    const index = adminCoupons.findIndex((c) => c.id === couponId);
    if (index !== -1) {
      adminCoupons.splice(index, 1);
    }
    return { success: true };
  },

  // Promotion/Coupon Management
  getPromotions: async (params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    data: Promotion[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> => {
    await delay(300);
    let promotions = [...adminPromotions];

    // Apply search
    if (params?.search) {
      const searchLower = params.search.toLowerCase();
      promotions = promotions.filter(
        (p) =>
          p.name.toLowerCase().includes(searchLower) ||
          p.code?.toLowerCase().includes(searchLower)
      );
    }

    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const total = promotions.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginatedPromotions = promotions.slice(start, start + limit);

    return {
      data: paginatedPromotions,
      total,
      page,
      limit,
      totalPages,
    };
  },

  getPromotion: async (id: string): Promise<Promotion | null> => {
    await delay(200);
    return adminPromotions.find((p) => p.id === id) || null;
  },

  createPromotion: async (data: Partial<Promotion>): Promise<Promotion> => {
    await delay(500);
    // In real app, this would create in backend
    const newPromotion: Promotion = {
      id: `promo-${Date.now()}`,
      name: data.name || "",
      type: data.type || data.discountType || "PERCENTAGE",
      value:
        data.value !== undefined
          ? data.value
          : data.discountValue !== undefined
          ? data.discountValue
          : 0,
      startsAt: data.startsAt
        ? new Date(data.startsAt).toISOString()
        : data.startDate
        ? new Date(data.startDate).toISOString()
        : new Date().toISOString(),
      expiresAt: data.expiresAt
        ? new Date(data.expiresAt).toISOString()
        : data.endDate
        ? new Date(data.endDate).toISOString()
        : new Date().toISOString(),
      isActive: data.isActive !== undefined ? data.isActive : true,
      applicableProductIds: data.applicableProductIds,
      applicableCategoryIds: data.applicableCategoryIds,
      applyToSubcategories:
        data.applyToSubcategories !== undefined
          ? data.applyToSubcategories
          : true,
      minOrderTotal: data.minOrderTotal ?? data.minPurchase,
      description: data.description,
      maxDiscount: data.maxDiscount,
      // aliases for legacy consumers
      discountType: data.type || data.discountType || "PERCENTAGE",
      discountValue:
        data.value !== undefined
          ? data.value
          : data.discountValue !== undefined
          ? data.discountValue
          : 0,
      startDate: data.startsAt || data.startDate,
      endDate: data.expiresAt || data.endDate,
    };
    adminPromotions.push(newPromotion);
    return newPromotion;
  },

  updatePromotion: async (
    promotionId: string,
    data: Partial<Promotion>
  ): Promise<Promotion> => {
    await delay(500);
    // In real app, this would update in backend
    const promotion = adminPromotions.find((p) => p.id === promotionId);
    if (!promotion) {
      throw new Error("Promotion not found");
    }
    const updatedPromotion: Promotion = {
      ...promotion,
      ...data,
      id: promotionId,
      type:
        data.type ||
        data.discountType ||
        promotion.type ||
        promotion.discountType,
      value:
        data.value !== undefined
          ? data.value
          : data.discountValue !== undefined
          ? data.discountValue
          : promotion.value ?? promotion.discountValue ?? 0,
      startsAt: data.startsAt
        ? new Date(data.startsAt).toISOString()
        : data.startDate
        ? new Date(data.startDate).toISOString()
        : promotion.startsAt || promotion.startDate,
      expiresAt: data.expiresAt
        ? new Date(data.expiresAt).toISOString()
        : data.endDate
        ? new Date(data.endDate).toISOString()
        : promotion.expiresAt || promotion.endDate,
      description: data.description ?? promotion.description,
      applicableProductIds:
        data.applicableProductIds ?? promotion.applicableProductIds,
      applicableCategoryIds:
        data.applicableCategoryIds ?? promotion.applicableCategoryIds,
      applyToSubcategories:
        data.applyToSubcategories ?? promotion.applyToSubcategories ?? true,
      discountType:
        data.type ||
        data.discountType ||
        promotion.type ||
        promotion.discountType,
      discountValue:
        data.value !== undefined
          ? data.value
          : data.discountValue !== undefined
          ? data.discountValue
          : promotion.discountValue ?? promotion.value,
      startDate:
        data.startsAt ||
        data.startDate ||
        promotion.startsAt ||
        promotion.startDate,
      endDate:
        data.expiresAt ||
        data.endDate ||
        promotion.expiresAt ||
        promotion.endDate,
    };
    const index = adminPromotions.findIndex((p) => p.id === promotionId);
    if (index !== -1) {
      adminPromotions[index] = updatedPromotion;
    }
    return updatedPromotion;
  },

  deletePromotion: async (
    promotionId: string
  ): Promise<{ success: boolean }> => {
    await delay(500);
    // In real app, this would delete from backend
    const index = adminPromotions.findIndex((p) => p.id === promotionId);
    if (index !== -1) {
      adminPromotions.splice(index, 1);
    }
    return { success: true };
  },
};
