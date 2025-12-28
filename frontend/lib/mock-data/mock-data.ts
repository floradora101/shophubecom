// Consolidated mock data file with 7 main categories, subcategories, and products
export interface MockCategory {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  productCount: number;
  accentColor: string;
  parentId?: string | null;
}

export interface MockProductVariant {
  sku: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  options?: Record<string, string>;
}

export interface MockProduct {
  id?: string;
  name: string;
  slug?: string;
  description?: string;
  price: number;
  stock?: number;
  images?: string[];
  image?: string;
  categorySlug?: string;
  isActive?: boolean;
  isOnSale?: boolean;
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT";
  discountValue?: number;
  saleStartsAt?: Date;
  saleEndsAt?: Date;
  colors?: string[];
  specs?: Array<{ label: string; value: string }> | Record<string, unknown>;
  variants?: MockProductVariant[];
  category?: string;
  originalPrice?: number;
  // Rating fields (frontend-only for now)
  rating?: number; // Average rating out of 5
  reviewCount?: number; // Number of reviews
}

// Utility to convert MockCategory to full Category interface
export function mockCategoryToCategory(
  mock: MockCategory
): import("@/features/products/types").Category {
  return {
    id: mock.id,
    name: mock.name,
    slug: mock.slug,
    description: mock.description,
    parentId: mock.parentId,
    productCount: mock.productCount,
    createdAt: "2024-01-01T00:00:00.000Z",
    updatedAt: "2024-01-01T00:00:00.000Z",
  };
}

// Utility to convert MockProduct to full Product interface
export function mockProductToProduct(
  mock: MockProduct
): import("@/features/products/types").Product {
  // Generate ID from name if not provided
  const id =
    mock.id ||
    mock.name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

  // Use categorySlug or fallback to legacy category field
  const categorySlug =
    mock.categorySlug ||
    mock.category?.toLowerCase().replace(/\s+/g, "-") ||
    "uncategorized";

  // Handle price logic - use minPrice from variants if available, otherwise use base price
  let effectivePrice = mock.price;
  let minPrice: number | undefined;
  let maxPrice: number | undefined;

  if (mock.variants && mock.variants.length > 0) {
    const variantPrices = mock.variants.map((v) => v.price);
    minPrice = Math.min(...variantPrices);
    maxPrice = Math.max(...variantPrices);
    effectivePrice = minPrice; // Use min price as the display price
  }

  // Convert specs to proper format
  const specs = Array.isArray(mock.specs)
    ? mock.specs
    : mock.specs
    ? Object.entries(mock.specs).map(([label, value]) => ({
        label,
        value: String(value),
      }))
    : [];

  // Fix image mapping: baseImage = mock.image ?? mock.images?.[0]
  const baseImage = mock.image ?? mock.images?.[0];

  // Create variants - use provided variants or create default
  const variants =
    mock.variants && mock.variants.length > 0
      ? mock.variants.map((v) => ({
          id: v.sku, // Add id field as required by ProductVariant type
          sku: v.sku,
          price: v.price,
          stock: v.stock,
          image: v.image || baseImage, // Use variant.image || baseImage
          images:
            v.images ||
            (v.image
              ? [v.image]
              : mock.images || (baseImage ? [baseImage] : [])),
          options: v.options || {},
        }))
      : [
          {
            id: `${id}-default`, // Add id field
            sku: `${id}-default`,
            price: mock.price,
            stock: mock.stock || 100,
            image: baseImage, // Use baseImage
            images: mock.images || (baseImage ? [baseImage] : []),
          },
        ];

  // Calculate effective stock
  const effectiveStock = variants.reduce((sum, v) => sum + v.stock, 0);

  // Get the default variant (first variant) and ensure it has images
  const defaultV = variants[0];
  if (defaultV && (!defaultV.images || defaultV.images.length === 0)) {
    defaultV.images = baseImage ? [baseImage] : [];
  }

  return {
    id,
    name: mock.name,
    slug: mock.slug || id,
    description: mock.description || `${mock.name} - High quality product.`,
    price: effectivePrice,
    currency: "USD",
    stock: effectiveStock,
    isOnSale: mock.isOnSale || !!mock.originalPrice,
    discountType:
      mock.discountType || (mock.originalPrice ? "PERCENTAGE" : undefined),
    discountValue:
      mock.discountValue ||
      (mock.originalPrice
        ? Math.round(
            ((mock.originalPrice - mock.price) / mock.originalPrice) * 100
          )
        : undefined),
    saleStartsAt: mock.saleStartsAt?.toISOString(),
    saleEndsAt: mock.saleEndsAt?.toISOString(),
    categoryId: categorySlug,
    isActive: mock.isActive !== false, // Default to true
    isFeatured: false,
    variants,
    defaultVariantId: defaultV?.id,
    defaultVariant: defaultV
      ? {
          id: defaultV.id,
          image: defaultV.image,
          images: defaultV.images,
        }
      : undefined,
    minPrice,
    maxPrice,
    effectiveStock,
    specs,
    colors: mock.colors,
    originalPrice: mock.originalPrice,
    rating: mock.rating,
    reviewCount: mock.reviewCount,
    createdAt: "2025-12-23T00:00:00.000Z", // Fixed future-safe timestamp
    updatedAt: "2025-12-23T00:00:00.000Z", // Fixed future-safe timestamp
  };
}

// 7 Main Categories with their subcategories
export const mockCategories: MockCategory[] = [
  // Main Category 1: Phones
  {
    id: "phones",
    name: "Phones",
    slug: "phones",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    description: "Latest smartphones and mobile devices",
    productCount: 120,
    accentColor: "#3b82f6",
    parentId: null,
  },
  {
    id: "iphone",
    name: "iPhone",
    slug: "iphone",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    description: "Apple iPhone models and accessories",
    productCount: 45,
    accentColor: "#3b82f6",
    parentId: "phones",
  },
  {
    id: "samsung-phones",
    name: "Samsung",
    slug: "samsung-phones",
    image:
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=300&fit=crop",
    description: "Samsung Galaxy phones and accessories",
    productCount: 35,
    accentColor: "#3b82f6",
    parentId: "phones",
  },
  {
    id: "nokia",
    name: "Nokia",
    slug: "nokia",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    description: "Nokia phones and accessories",
    productCount: 25,
    accentColor: "#3b82f6",
    parentId: "phones",
  },
  {
    id: "other-phones",
    name: "Other Brands",
    slug: "other-phones",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    description: "Other phone brands and models",
    productCount: 15,
    accentColor: "#3b82f6",
    parentId: "phones",
  },

  // Main Category 2: Tablets
  {
    id: "tablets",
    name: "Tablets",
    slug: "tablets",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
    description: "Tablets and portable computing devices",
    productCount: 60,
    accentColor: "#10b981",
    parentId: null,
  },
  {
    id: "apple-tablets",
    name: "Apple",
    slug: "apple-tablets",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
    description: "iPad and Apple tablet devices",
    productCount: 25,
    accentColor: "#10b981",
    parentId: "tablets",
  },
  {
    id: "samsung-tablets",
    name: "Samsung",
    slug: "samsung-tablets",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
    description: "Samsung Galaxy tablets",
    productCount: 20,
    accentColor: "#10b981",
    parentId: "tablets",
  },
  {
    id: "other-tablets",
    name: "Other Brands",
    slug: "other-tablets",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=300&fit=crop",
    description: "Other tablet brands including Oscal",
    productCount: 15,
    accentColor: "#10b981",
    parentId: "tablets",
  },

  // Main Category 3: Laptops
  {
    id: "laptops",
    name: "Laptops",
    slug: "laptops",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    description: "Laptops and portable computers",
    productCount: 80,
    accentColor: "#f59e0b",
    parentId: null,
  },
  {
    id: "macbook",
    name: "MacBook",
    slug: "macbook",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    description: "Apple MacBook laptops",
    productCount: 30,
    accentColor: "#f59e0b",
    parentId: "laptops",
  },
  {
    id: "gaming-laptops",
    name: "Gaming Laptops",
    slug: "gaming-laptops",
    image:
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=400&h=300&fit=crop",
    description: "High-performance gaming laptops",
    productCount: 25,
    accentColor: "#f59e0b",
    parentId: "laptops",
  },
  {
    id: "business-laptops",
    name: "Business Laptops",
    slug: "business-laptops",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    description: "Business and productivity laptops",
    productCount: 25,
    accentColor: "#f59e0b",
    parentId: "laptops",
  },

  // Main Category 4: Wearables
  {
    id: "wearables",
    name: "Wearables",
    slug: "wearables",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    description: "Wearable technology and accessories",
    productCount: 90,
    accentColor: "#8b5cf6",
    parentId: null,
  },
  {
    id: "smart-watches",
    name: "Smart Watches",
    slug: "smart-watches",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=300&fit=crop",
    description: "Smart watches and fitness trackers",
    productCount: 35,
    accentColor: "#8b5cf6",
    parentId: "wearables",
  },
  {
    id: "earphones",
    name: "Earphones",
    slug: "earphones",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    description: "Wireless and wired earphones",
    productCount: 30,
    accentColor: "#8b5cf6",
    parentId: "wearables",
  },
  {
    id: "headsets",
    name: "Headsets",
    slug: "headsets",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    description: "Gaming and audio headsets",
    productCount: 25,
    accentColor: "#8b5cf6",
    parentId: "wearables",
  },

  // Main Category 5: Smart Gadgets
  {
    id: "smart-gadgets",
    name: "Smart Gadgets",
    slug: "smart-gadgets",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    description: "Smart home devices and gadgets",
    productCount: 70,
    accentColor: "#ef4444",
    parentId: null,
  },
  {
    id: "smart-cameras",
    name: "Cameras",
    slug: "smart-cameras",
    image:
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=300&fit=crop",
    description: "Smart cameras and security devices",
    productCount: 20,
    accentColor: "#ef4444",
    parentId: "smart-gadgets",
  },
  {
    id: "smart-stands",
    name: "Stands & Mounts",
    slug: "smart-stands",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    description: "Phone stands, mounts, and holders",
    productCount: 25,
    accentColor: "#ef4444",
    parentId: "smart-gadgets",
  },
  {
    id: "other-gadgets",
    name: "Other Gadgets",
    slug: "other-gadgets",
    image:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=300&fit=crop",
    description: "Other smart gadgets and accessories",
    productCount: 25,
    accentColor: "#ef4444",
    parentId: "smart-gadgets",
  },

  // Main Category 6: Gaming Console
  {
    id: "gaming-console",
    name: "Gaming Console",
    slug: "gaming-console",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    description: "Gaming consoles and accessories",
    productCount: 85,
    accentColor: "#06b6d4",
    parentId: null,
  },
  {
    id: "gaming-consoles",
    name: "Consoles",
    slug: "gaming-consoles",
    image:
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=300&fit=crop",
    description: "PlayStation, Xbox, and Nintendo consoles",
    productCount: 30,
    accentColor: "#06b6d4",
    parentId: "gaming-console",
  },
  {
    id: "gaming-controllers",
    name: "Controllers",
    slug: "gaming-controllers",
    image:
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=300&fit=crop",
    description: "Gaming controllers and accessories",
    productCount: 35,
    accentColor: "#06b6d4",
    parentId: "gaming-console",
  },
  {
    id: "gaming-games",
    name: "Games",
    slug: "gaming-games",
    image:
      "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=300&fit=crop",
    description: "Video games and software",
    productCount: 20,
    accentColor: "#06b6d4",
    parentId: "gaming-console",
  },

  // Main Category 7: Accessories
  {
    id: "accessories",
    name: "Accessories",
    slug: "accessories",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    description: "Device cases, bags, and protection",
    productCount: 95,
    accentColor: "#84cc16",
    parentId: null,
  },
  {
    id: "phone-cases",
    name: "Phone Cases",
    slug: "phone-cases",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    description: "Phone cases and covers",
    productCount: 40,
    accentColor: "#84cc16",
    parentId: "accessories",
  },
  {
    id: "bags-cases",
    name: "Bags & Cases",
    slug: "bags-cases",
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=300&fit=crop",
    description: "Laptop bags, tablet cases, and carriers",
    productCount: 35,
    accentColor: "#84cc16",
    parentId: "accessories",
  },
  {
    id: "screen-protectors",
    name: "Screen Protectors",
    slug: "screen-protectors",
    image:
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=300&fit=crop",
    description: "Screen protectors and device protection",
    productCount: 20,
    accentColor: "#84cc16",
    parentId: "accessories",
  },
];

// Products organized by category
export const mockProducts: MockProduct[] = [
  // Phones Products
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    slug: "iphone-15-pro-max",
    price: 1199.99,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    ],
    categorySlug: "iphone",
    description:
      "The most advanced iPhone with titanium design, A17 Pro chip, and professional camera system.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 10,
    specs: [
      { label: "Display", value: '6.7" Super Retina XDR' },
      { label: "Chip", value: "A17 Pro" },
      {
        label: "Camera",
        value: "48MP Main + 12MP Ultra Wide + 12MP Telephoto",
      },
      { label: "Storage", value: "256GB" },
      { label: "Battery", value: "Up to 29 hours video playback" },
    ],
    rating: 4.8,
    reviewCount: 1247,
    variants: [
      {
        sku: "IP15PM-BLK-256",
        price: 1199.99,
        stock: 10,
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=800&fit=crop",
        ],
        options: { color: "Black Titanium", storage: "256GB" },
      },
      {
        sku: "IP15PM-WHT-256",
        price: 1199.99,
        stock: 10,
        image:
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=800&fit=crop",
        ],
        options: { color: "White Titanium", storage: "256GB" },
      },
      {
        sku: "IP15PM-BLU-256",
        price: 1199.99,
        stock: 5,
        image:
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=800&fit=crop",
        ],
        options: { color: "Blue Titanium", storage: "256GB" },
      },
    ],
  },
  {
    id: "samsung-galaxy-s24-ultra",
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    price: 1199.99,
    originalPrice: 1399.99,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=400&h=400&fit=crop",
    ],
    categorySlug: "samsung-phones",
    description:
      "Premium Android smartphone with S Pen, 200MP camera, and AI features.",
    isActive: true,
    isOnSale: true,
    discountType: "FIXED_AMOUNT",
    discountValue: 200,
    specs: [
      { label: "Display", value: '6.8" Dynamic AMOLED 2X' },
      { label: "Chip", value: "Snapdragon 8 Gen 3" },
      {
        label: "Camera",
        value: "200MP Main + 50MP Periscope + 12MP Ultra Wide + 10MP Telephoto",
      },
      { label: "S Pen", value: "Included" },
      { label: "Battery", value: "5000mAh" },
    ],
    rating: 4.6,
    reviewCount: 892,
    variants: [
      {
        sku: "S24U-BLK-512",
        price: 1199.99,
        stock: 10,
        image:
          "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=800&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1610792516307-e2f49844a093?w=800&h=800&fit=crop",
        ],
        options: { color: "Titanium Black", storage: "512GB" },
      },
      {
        sku: "S24U-VIO-512",
        price: 1199.99,
        stock: 10,
        image:
          "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=800&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1610792516307-e2f49844a093?w=800&h=800&fit=crop",
        ],
        options: { color: "Titanium Violet", storage: "512GB" },
      },
    ],
  },
  {
    id: "nokia-x30",
    name: "Nokia X30",
    slug: "nokia-x30",
    price: 699.99,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=800&fit=crop",
    ],
    categorySlug: "nokia",
    description:
      "Durable Nokia smartphone with Pure OS and 5-year update guarantee.",
    isActive: true,
    specs: [
      { label: "Display", value: '6.43" AMOLED' },
      { label: "Chip", value: "Snapdragon 695" },
      { label: "Camera", value: "50MP Main + 13MP Ultra Wide" },
      { label: "OS", value: "Android 12 (Pure OS)" },
      { label: "Updates", value: "5 years guaranteed" },
    ],
  },

  // Tablets Products
  {
    id: "ipad-pro-12-9-m4",
    name: 'iPad Pro 12.9" M4',
    slug: "ipad-pro-12-9-m4",
    price: 1099.99,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1587614295993-0d5bfc6e6fca?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop&q=80",
    ],
    categorySlug: "apple-tablets",
    description:
      "Powerful iPad Pro with M4 chip, Liquid Retina XDR display, and Apple Pencil support.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 15,
    specs: [
      { label: "Display", value: '12.9" Liquid Retina XDR' },
      { label: "Chip", value: "Apple M4" },
      { label: "Camera", value: "12MP Wide + 10MP Ultra Wide" },
      { label: "Storage", value: "256GB" },
      { label: "Battery", value: "Up to 10 hours" },
    ],
    rating: 4.7,
    reviewCount: 634,
  },
  {
    id: "samsung-galaxy-tab-s9-ultra",
    name: "Samsung Galaxy Tab S9 Ultra",
    slug: "samsung-galaxy-tab-s9-ultra",
    price: 1099.99,
    originalPrice: 1299.99,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1587614295993-0d5bfc6e6fca?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&h=800&fit=crop&q=80",
    ],
    categorySlug: "samsung-tablets",
    description:
      "Premium Android tablet with S Pen, 14.6-inch display, and DeX mode.",
    isActive: true,
    isOnSale: true,
    discountType: "FIXED_AMOUNT",
    discountValue: 200,
    specs: [
      { label: "Display", value: '14.6" Dynamic AMOLED 2X' },
      { label: "Chip", value: "Snapdragon 8 Gen 2" },
      { label: "S Pen", value: "Included" },
      { label: "Storage", value: "256GB" },
      { label: "Battery", value: "11200mAh" },
    ],
  },
  {
    id: "oscal-t20",
    name: "Oscal T20 Tablet",
    slug: "oscal-t20",
    price: 299.99,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400&h=400&fit=crop",
    ],
    categorySlug: "other-tablets",
    description:
      "Affordable Android tablet with 10-inch display and long battery life.",
    isActive: true,
    specs: [
      { label: "Display", value: '10.1" IPS' },
      { label: "Chip", value: "MediaTek Helio G80" },
      { label: "Storage", value: "64GB" },
      { label: "Battery", value: "6000mAh" },
      { label: "OS", value: "Android 12" },
    ],
  },

  // Laptops Products
  {
    id: "macbook-pro-16-m3-max",
    name: 'MacBook Pro 16" M3 Max',
    slug: "macbook-pro-16-m3-max",
    price: 3499.99,
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800&h=800&fit=crop&q=80",
    ],
    categorySlug: "macbook",
    description:
      "Professional laptop with M3 Max chip, 16-inch Liquid Retina XDR display.",
    isActive: true,
    specs: [
      { label: "Display", value: '16.2" Liquid Retina XDR' },
      { label: "Chip", value: "Apple M3 Max" },
      { label: "Memory", value: "32GB unified memory" },
      { label: "Storage", value: "1TB SSD" },
      { label: "Battery", value: "Up to 22 hours" },
    ],
    rating: 4.9,
    reviewCount: 423,
  },
  {
    id: "asus-rog-strix-g17",
    name: "ASUS ROG Strix G17",
    slug: "asus-rog-strix-g17",
    price: 1999.99,
    stock: 10,
    images: [
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&h=800&fit=crop&q=80",
    ],
    categorySlug: "gaming-laptops",
    description:
      "High-performance gaming laptop with RTX 4070 and 165Hz display.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 12,
    specs: [
      { label: "Display", value: '17.3" 165Hz FHD' },
      { label: "GPU", value: "NVIDIA RTX 4070" },
      { label: "CPU", value: "AMD Ryzen 9 7945HX" },
      { label: "Memory", value: "32GB DDR5" },
      { label: "Storage", value: "1TB SSD" },
    ],
  },
  {
    id: "dell-xps-13",
    name: "Dell XPS 13",
    slug: "dell-xps-13",
    price: 1199.99,
    originalPrice: 1399.99,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
    ],
    categorySlug: "business-laptops",
    description:
      "Ultra-portable business laptop with 13.4-inch InfinityEdge display.",
    isActive: true,
    isOnSale: true,
    discountType: "FIXED_AMOUNT",
    discountValue: 200,
    specs: [
      { label: "Display", value: '13.4" FHD+ InfinityEdge' },
      { label: "CPU", value: "Intel Core i7-1355U" },
      { label: "Memory", value: "16GB LPDDR5" },
      { label: "Storage", value: "512GB SSD" },
      { label: "Weight", value: "2.73 lbs" },
    ],
  },

  // Wearables Products
  {
    id: "apple-watch-ultra-2",
    name: "Apple Watch Ultra 2",
    slug: "apple-watch-ultra-2",
    price: 799.99,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop&q=80",
    ],
    categorySlug: "smart-watches",
    description:
      "Rugged smartwatch with titanium case, precision dual-frequency GPS, and Action Button.",
    isActive: true,
    specs: [
      { label: "Case", value: "Titanium" },
      { label: "Display", value: "Always-On Retina" },
      { label: "GPS", value: "Precision dual-frequency" },
      { label: "Battery", value: "Up to 36 hours" },
      { label: "Water Resistance", value: "100 meters" },
    ],
    rating: 4.8,
    reviewCount: 756,
  },
  {
    id: "samsung-galaxy-watch-6",
    name: "Samsung Galaxy Watch 6",
    slug: "samsung-galaxy-watch-6",
    price: 349.99,
    originalPrice: 449.99,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    ],
    categorySlug: "smart-watches",
    description: "Advanced smartwatch with health monitoring and Wear OS.",
    isActive: true,
    isOnSale: true,
    discountType: "FIXED_AMOUNT",
    discountValue: 100,
    specs: [
      { label: "Display", value: '1.5" Super AMOLED' },
      { label: "Battery", value: "Up to 40 hours" },
      { label: "Health", value: "ECG, SpO2, Sleep tracking" },
      { label: "OS", value: "Wear OS" },
    ],
  },
  {
    id: "sony-wh-1000xm5",
    name: "Sony WH-1000XM5",
    slug: "sony-wh-1000xm5",
    price: 349.99,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop&q=80",
    ],
    categorySlug: "earphones",
    description:
      "Industry-leading noise canceling headphones with 30-hour battery.",
    isActive: true,
    specs: [
      { label: "Driver", value: "30mm" },
      { label: "Battery", value: "30 hours (NC on)" },
      { label: "Noise Canceling", value: "Industry leading" },
      { label: "Codec", value: "LDAC, AAC" },
    ],
  },
  {
    id: "airpods-pro-2",
    name: "AirPods Pro (2nd generation)",
    slug: "airpods-pro-2",
    price: 249.99,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    ],
    categorySlug: "earphones",
    description:
      "Wireless earbuds with Active Noise Cancellation and spatial audio.",
    isActive: true,
    specs: [
      { label: "Driver", value: "Custom high-excursion" },
      { label: "Battery", value: "6 hours (ANC on)" },
      { label: "ANC", value: "Active Noise Cancellation" },
      { label: "Audio", value: "Spatial audio with dynamic head tracking" },
    ],
    rating: 4.5,
    reviewCount: 2156,
  },
  {
    id: "steelseries-arctis-7",
    name: "SteelSeries Arctis 7",
    slug: "steelseries-arctis-7",
    price: 149.99,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    ],
    categorySlug: "headsets",
    description:
      "Wireless gaming headset with DTS Headphone:X v2.0 surround sound.",
    isActive: true,
    specs: [
      { label: "Driver", value: "40mm" },
      { label: "Battery", value: "24 hours" },
      { label: "Connectivity", value: "Wireless 2.4GHz" },
      { label: "Surround", value: "DTS Headphone:X v2.0" },
    ],
  },

  // Smart Gadgets Products
  {
    id: "ring-spotlight-cam",
    name: "Ring Spotlight Cam Pro",
    slug: "ring-spotlight-cam-pro",
    price: 199.99,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
    ],
    categorySlug: "smart-cameras",
    description:
      "Security camera with spotlight, color night vision, and two-way audio.",
    isActive: true,
    specs: [
      { label: "Resolution", value: "1080p HD" },
      { label: "Night Vision", value: "Color night vision" },
      { label: "Motion Detection", value: "Advanced motion detection" },
      { label: "Audio", value: "Two-way talk" },
      { label: "Spotlight", value: "300 lumen LED" },
    ],
  },
  {
    id: "anker-powerwave-stand",
    name: "Anker PowerWave 10 Stand",
    slug: "anker-powerwave-stand",
    price: 29.99,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    ],
    categorySlug: "smart-stands",
    description: "10W wireless charging stand with 7.5W charging for AirPods.",
    isActive: true,
    specs: [
      { label: "Charging Speed", value: "10W for iPhone, 7.5W for AirPods" },
      { label: "Compatibility", value: "Qi wireless charging" },
      { label: "Design", value: "Compact stand" },
      { label: "Safety", value: "Temperature control" },
    ],
  },
  {
    id: "amazon-echo-dot-5th-gen",
    name: "Amazon Echo Dot (5th Gen)",
    slug: "amazon-echo-dot-5th-gen",
    price: 49.99,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=400&fit=crop",
    ],
    categorySlug: "other-gadgets",
    description: "Smart speaker with Alexa and improved audio quality.",
    isActive: true,
    specs: [
      { label: "Speaker", value: '1.73" front-firing' },
      { label: "Assistant", value: "Alexa" },
      { label: "Connectivity", value: "Wi-Fi, Bluetooth" },
      { label: "Smart Home", value: "Works with smart home devices" },
    ],
  },
  {
    id: "logitech-mx-keys-mini",
    name: "Logitech MX Keys Mini",
    slug: "logitech-mx-keys-mini",
    price: 99.99,
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
    ],
    categorySlug: "other-gadgets",
    description:
      "Compact wireless illuminated keyboard with multi-device support.",
    isActive: true,
    specs: [
      { label: "Layout", value: "87 keys" },
      { label: "Connectivity", value: "Bluetooth, USB-C" },
      { label: "Battery", value: "Up to 10 days" },
      { label: "Backlight", value: "Smart illumination" },
    ],
  },

  // Gaming Console Products
  {
    id: "playstation-5-slim",
    name: "PlayStation 5 Slim",
    slug: "playstation-5-slim",
    price: 499.99,
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=800&fit=crop&q=80",
    ],
    categorySlug: "gaming-consoles",
    description: "Next-gen gaming console with Ultra HD Blu-ray, 825GB SSD.",
    isActive: true,
    specs: [
      { label: "CPU", value: "AMD Zen 2-based" },
      { label: "GPU", value: "10.28 TFLOPs RDNA 2" },
      { label: "Memory", value: "16GB GDDR6" },
      { label: "Storage", value: "825GB SSD" },
      { label: "Optical", value: "Ultra HD Blu-ray" },
    ],
    rating: 4.7,
    reviewCount: 3241,
  },
  {
    id: "xbox-series-x",
    name: "Xbox Series X",
    slug: "xbox-series-x",
    price: 449.99,
    originalPrice: 499.99,
    stock: 6,
    images: [
      "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=400&fit=crop",
    ],
    categorySlug: "gaming-consoles",
    description:
      "Powerful gaming console with 4K gaming and Quick Resume technology.",
    isActive: true,
    isOnSale: true,
    discountType: "FIXED_AMOUNT",
    discountValue: 50,
    specs: [
      { label: "CPU", value: "8x Zen 2 Cores at 3.8 GHz" },
      { label: "GPU", value: "12 TFLOPs RDNA 2" },
      { label: "Memory", value: "16GB GDDR6" },
      { label: "Storage", value: "1TB NVMe SSD" },
      { label: "Resolution", value: "Up to 8K" },
    ],
  },
  {
    id: "nintendo-switch-oled",
    name: "Nintendo Switch OLED",
    slug: "nintendo-switch-oled",
    price: 349.99,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop",
    ],
    categorySlug: "gaming-consoles",
    description:
      "Hybrid gaming console with 7-inch OLED screen and enhanced audio.",
    isActive: true,
    specs: [
      { label: "Display", value: '7" OLED 1280x720' },
      { label: "CPU/GPU", value: "NVIDIA Tegra X1+" },
      { label: "Memory", value: "4GB LPDDR4" },
      { label: "Storage", value: "64GB internal" },
      { label: "Battery", value: "Up to 9 hours" },
    ],
  },
  {
    id: "dualshock-5-controller",
    name: "DualShock 5 Controller",
    slug: "dualshock-5-controller",
    price: 69.99,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop",
    ],
    categorySlug: "gaming-controllers",
    description:
      "Next-generation wireless controller with haptic feedback and adaptive triggers.",
    isActive: true,
    specs: [
      { label: "Connectivity", value: "Bluetooth, USB-C" },
      { label: "Battery", value: "Up to 12 hours" },
      { label: "Features", value: "Haptic feedback, adaptive triggers" },
      { label: "Compatibility", value: "PS5, PC" },
    ],
  },
  {
    id: "xbox-elite-controller-v2",
    name: "Xbox Elite Wireless Controller Series 2",
    slug: "xbox-elite-controller-v2",
    price: 179.99,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1599669454699-248893623440?w=400&h=400&fit=crop",
    ],
    categorySlug: "gaming-controllers",
    description:
      "Professional gaming controller with adjustable tension and components.",
    isActive: true,
    specs: [
      { label: "Design", value: "Modular components" },
      { label: "Battery", value: "Up to 40 hours" },
      { label: "Features", value: "Adjustable tension, hair trigger locks" },
      { label: "Compatibility", value: "Xbox, PC" },
    ],
  },
  {
    id: "the-last-of-us-part-ii",
    name: "The Last of Us Part II",
    slug: "the-last-of-us-part-ii",
    price: 39.99,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=400&fit=crop",
    ],
    categorySlug: "gaming-games",
    description:
      "Award-winning action-adventure game with emotional storytelling.",
    isActive: true,
    specs: [
      { label: "Genre", value: "Action-Adventure" },
      { label: "Platform", value: "PS4, PS5" },
      { label: "Developer", value: "Naughty Dog" },
      { label: "Rating", value: "M for Mature" },
    ],
  },

  // Accessories Products
  {
    id: "otterbox-iphone-case",
    name: "OtterBox Defender iPhone Case",
    slug: "otterbox-defender-iphone-case",
    price: 49.99,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    ],
    categorySlug: "phone-cases",
    description:
      "Military-grade protection case with screen protector and holster.",
    isActive: true,
    specs: [
      { label: "Protection", value: "Military-grade drop protection" },
      { label: "Features", value: "Screen protector included" },
      { label: "Access", value: "Full button protection" },
      { label: "Warranty", value: "Lifetime warranty" },
    ],
  },
  {
    id: "spigen-tough-armor",
    name: "Spigen Tough Armor Case",
    slug: "spigen-tough-armor-case",
    price: 19.99,
    originalPrice: 29.99,
    stock: 50,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    ],
    categorySlug: "phone-cases",
    description:
      "Slim protection case with raised edges and anti-scratch coating.",
    isActive: true,
    isOnSale: true,
    discountType: "FIXED_AMOUNT",
    discountValue: 10,
    specs: [
      { label: "Design", value: "Slim profile" },
      { label: "Protection", value: "Multi-layer protection" },
      { label: "Features", value: "Raised edges for screen" },
      { label: "Material", value: "TPU + Polycarbonate" },
    ],
  },
  {
    id: "incase-laptop-bag",
    name: "Incase Icon Laptop Bag",
    slug: "incase-icon-laptop-bag",
    price: 89.99,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    ],
    categorySlug: "bags-cases",
    description:
      "Professional laptop bag with water-resistant fabric and organization.",
    isActive: true,
    specs: [
      { label: "Capacity", value: 'Up to 15" laptop' },
      { label: "Material", value: "Water-resistant nylon" },
      { label: "Features", value: "Multiple compartments" },
      { label: "Weight", value: "2.2 lbs" },
    ],
  },
  {
    id: "belkin-screen-protector",
    name: "Belkin Tempered Glass Screen Protector",
    slug: "belkin-screen-protector",
    price: 29.99,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&h=400&fit=crop",
    ],
    categorySlug: "screen-protectors",
    description: "9H hardness tempered glass with oleophobic coating.",
    isActive: true,
    specs: [
      { label: "Hardness", value: "9H tempered glass" },
      { label: "Thickness", value: "0.33mm" },
      { label: "Features", value: "Oleophobic coating" },
      { label: "Compatibility", value: "Precise fit" },
    ],
  },
];

// Mock deals data
export interface MockDeal {
  id: string;
  title: string;
  subtitle: string;
  discount: number;
  image: string;
  link: string;
  badge?: string;
  expiresAt?: string;
}

export const mockDeals: MockDeal[] = [
  {
    id: "deal-1",
    title: "Winter Sale",
    subtitle: "Up to 50% off electronics",
    discount: 50,
    image:
      "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=300&fit=crop",
    link: "/deals/winter-electronics",
    badge: "Hot Deal",
    expiresAt: "2026-02-28",
  },
  {
    id: "deal-2",
    title: "New Year Fashion",
    subtitle: "New arrivals - 30% off",
    discount: 30,
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    link: "/deals/new-year-fashion",
    badge: "New",
    expiresAt: "2026-01-31",
  },
  {
    id: "deal-3",
    title: "Home & Garden",
    subtitle: "Winter refresh - 25% off",
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    link: "/deals/home-garden",
    badge: "Limited",
    expiresAt: "2026-03-31",
  },
  {
    id: "deal-4",
    title: "Book Lovers",
    subtitle: "Buy 2, get 1 free",
    discount: 33,
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    link: "/deals/book-lovers",
    badge: "BOGO",
    expiresAt: "2026-04-30",
  },
];

// Mock collections data
export interface MockCollection {
  id: string;
  title: string;
  description: string;
  image: string;
  productCount: number;
  priceRange: {
    min: number;
    max: number;
  };
}

export const mockCollections: MockCollection[] = [
  {
    id: "phones-collection",
    title: "Latest Phones",
    description: "Discover the newest smartphones and mobile technology",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&h=400&fit=crop",
    productCount: 25,
    priceRange: { min: 299, max: 1299 },
  },
  {
    id: "tablets-collection",
    title: "Tablets & Computing",
    description: "Powerful tablets for work and entertainment",
    image:
      "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop",
    productCount: 18,
    priceRange: { min: 299, max: 1199 },
  },
  {
    id: "laptops-collection",
    title: "Laptops & Portables",
    description: "High-performance laptops for every need",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop",
    productCount: 22,
    priceRange: { min: 799, max: 3499 },
  },
  {
    id: "wearables-collection",
    title: "Wearables & Audio",
    description: "Stay connected with the latest wearables",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&h=400&fit=crop",
    productCount: 28,
    priceRange: { min: 149, max: 799 },
  },
];

export const staffPicks = [
  {
    id: "staff-1",
    title: "Editor's Choice",
    productName: "iPhone 15 Pro Max",
    description: "Our top pick for professional photography and performance",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&h=300&fit=crop",
    curator: "Sarah Johnson",
    curatorRole: "Tech Specialist",
  },
  {
    id: "staff-2",
    title: "Best Value",
    productName: 'MacBook Pro 16" M3 Max',
    description: "Unmatched performance for creative professionals",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=300&h=300&fit=crop",
    curator: "Mike Chen",
    curatorRole: "Product Expert",
  },
  {
    id: "staff-3",
    title: "Innovation Award",
    productName: "Apple Watch Ultra 2",
    description: "Revolutionary health and fitness tracking",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    curator: "Dr. Alex Rivera",
    curatorRole: "Wearables Reviewer",
  },
];

// Helper functions to get data by category
export function getMainCategories(): MockCategory[] {
  return mockCategories.filter((cat) => cat.parentId === null);
}

export function getSubcategories(parentId: string): MockCategory[] {
  return mockCategories.filter((cat) => cat.parentId === parentId);
}

export function getProductsByCategory(categorySlug: string): MockProduct[] {
  return mockProducts.filter(
    (product) => product.categorySlug === categorySlug
  );
}

export function getAllProducts(): MockProduct[] {
  return mockProducts;
}

export function getAllCategories(): MockCategory[] {
  return mockCategories;
}
