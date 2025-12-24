// Consolidated mock data file with 4 main categories, subcategories, and products
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
    createdAt: "2025-12-23T00:00:00.000Z", // Fixed future-safe timestamp
    updatedAt: "2025-12-23T00:00:00.000Z", // Fixed future-safe timestamp
  };
}

// 4 Main Categories with their subcategories
export const mockCategories: MockCategory[] = [
  // Main Category 1: Electronics
  {
    id: "electronics",
    name: "Electronics",
    slug: "electronics",
    image:
      "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=400&h=300&fit=crop",
    description: "Latest gadgets and tech innovations",
    productCount: 252,
    accentColor: "#3b82f6",
    parentId: null,
  },
  {
    id: "smartphones",
    name: "Smartphones",
    slug: "smartphones",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=300&fit=crop",
    description: "Latest mobile phones and accessories",
    productCount: 45,
    accentColor: "#3b82f6",
    parentId: "electronics",
  },
  {
    id: "laptops",
    name: "Laptops",
    slug: "laptops",
    image:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop",
    description: "Computers and portable devices",
    productCount: 23,
    accentColor: "#3b82f6",
    parentId: "electronics",
  },
  {
    id: "headphones",
    name: "Headphones & Audio",
    slug: "headphones",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop",
    description: "Headphones, speakers, and audio equipment",
    productCount: 36,
    accentColor: "#3b82f6",
    parentId: "electronics",
  },

  // Main Category 2: Clothing
  {
    id: "clothing",
    name: "Clothing",
    slug: "clothing",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&h=300&fit=crop",
    description: "Fashion and apparel for every style",
    productCount: 461,
    accentColor: "#10b981",
    parentId: null,
  },
  {
    id: "mens-clothing",
    name: "Men's Clothing",
    slug: "mens-clothing",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop",
    description: "Fashion for men",
    productCount: 125,
    accentColor: "#10b981",
    parentId: "clothing",
  },
  {
    id: "womens-clothing",
    name: "Women's Clothing",
    slug: "womens-clothing",
    image:
      "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400&h=300&fit=crop",
    description: "Fashion for women",
    productCount: 147,
    accentColor: "#10b981",
    parentId: "clothing",
  },
  {
    id: "kids-clothing",
    name: "Kids' Clothing",
    slug: "kids-clothing",
    image:
      "https://images.unsplash.com/photo-1503944168849-c1246463d2c8?w=400&h=300&fit=crop",
    description: "Clothing for children",
    productCount: 99,
    accentColor: "#10b981",
    parentId: "clothing",
  },

  // Main Category 3: Home & Garden
  {
    id: "home-garden",
    name: "Home & Garden",
    slug: "home-garden",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    description: "Everything for your home and garden",
    productCount: 194,
    accentColor: "#f59e0b",
    parentId: null,
  },
  {
    id: "kitchen-appliances",
    name: "Kitchen Appliances",
    slug: "kitchen-appliances",
    image:
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop",
    description: "Modern kitchen tools and appliances",
    productCount: 69,
    accentColor: "#f59e0b",
    parentId: "home-garden",
  },
  {
    id: "gardening-tools",
    name: "Gardening Tools",
    slug: "gardening-tools",
    image:
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=300&fit=crop",
    description: "Tools and supplies for gardening",
    productCount: 46,
    accentColor: "#f59e0b",
    parentId: "home-garden",
  },
  {
    id: "home-decor",
    name: "Home Decor",
    slug: "home-decor",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop",
    description: "Decorative items for your home",
    productCount: 79,
    accentColor: "#f59e0b",
    parentId: "home-garden",
  },

  // Main Category 4: Books
  {
    id: "books",
    name: "Books",
    slug: "books",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    description: "Knowledge and inspiration in print",
    productCount: 350,
    accentColor: "#8b5cf6",
    parentId: null,
  },
  {
    id: "fiction-books",
    name: "Fiction",
    slug: "fiction-books",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    description: "Novels and fictional stories",
    productCount: 125,
    accentColor: "#8b5cf6",
    parentId: "books",
  },
  {
    id: "non-fiction-books",
    name: "Non-Fiction",
    slug: "non-fiction-books",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    description: "Educational and informative books",
    productCount: 158,
    accentColor: "#8b5cf6",
    parentId: "books",
  },
  {
    id: "children-books",
    name: "Children's Books",
    slug: "children-books",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=300&fit=crop",
    description: "Books for children and young readers",
    productCount: 67,
    accentColor: "#8b5cf6",
    parentId: "books",
  },
];

// Products organized by category
export const mockProducts: MockProduct[] = [
  // Electronics Products
  {
    id: "wireless-headphones",
    name: "Wireless Headphones",
    slug: "wireless-headphones",
    price: 299.99,
    stock: 50,
    originalPrice: 399.99,
    images: [
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
    ],
    categorySlug: "headphones",
    description:
      "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 25,
    specs: [
      { label: "Battery Life", value: "30 hours" },
      { label: "Noise Cancellation", value: "Active" },
      { label: "Connectivity", value: "Wireless" },
    ],
    variants: [
      {
        sku: "WH-BLK-001",
        price: 299.99,
        stock: 25,
        image:
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1599669454699-248893623440?w=800&h=800&fit=crop",
        ],
        options: { color: "Black" },
      },
      {
        sku: "WH-WHT-001",
        price: 299.99,
        stock: 25,
        image:
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1487215078519-e21cc028cb29?w=800&h=800&fit=crop",
        ],
        options: { color: "White" },
      },
    ],
  },
  {
    id: "smart-watch",
    name: "Smart Watch",
    price: 399.99,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    ],
    categorySlug: "smartphones",
    description:
      "Advanced smartwatch with health tracking, GPS, and 2-day battery life.",
    isActive: true,
    specs: [
      { label: "Battery", value: "Up to 48 hours" },
      { label: "Water Resistance", value: "50 meters" },
      { label: "GPS", value: "Built-in" },
    ],
    variants: [
      {
        sku: "SW-BLK-001",
        price: 399.99,
        stock: 15,
        image:
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop",
        ],
        options: { color: "Black" },
      },
      {
        sku: "SW-SLV-001",
        price: 399.99,
        stock: 15,
        image:
          "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=800&h=800&fit=crop",
        ],
        options: { color: "Silver" },
      },
    ],
  },
  {
    id: "gaming-laptop",
    name: "Gaming Laptop Pro 2024",
    slug: "gaming-laptop-pro-2024",
    price: 2499.99,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
    ],
    categorySlug: "laptops",
    description:
      "High-performance gaming laptop with RTX 4080, 32GB RAM, 1TB SSD.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 17,
    specs: [
      { label: "GPU", value: "NVIDIA RTX 4080" },
      { label: "Memory", value: "32GB DDR5" },
      { label: "Storage", value: "1TB NVMe SSD" },
      { label: "Display", value: '17.3" 4K 144Hz' },
      { label: "Processor", value: "Intel Core i9-13900HX" },
      { label: "Battery", value: "Up to 2 hours gaming" },
    ],
    variants: [
      {
        sku: "GLP-RTX4080-1TB",
        price: 2499.99,
        stock: 15,
        image:
          "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1587614295999-6c1bd70c6d9e?w=800&h=800&fit=crop",
        ],
        options: { storage: "1TB SSD", memory: "32GB" },
      },
    ],
  },
  {
    id: "bluetooth-speaker",
    slug: "bluetooth-speaker",
    name: "Bluetooth Speaker",
    price: 149.99,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
    ],
    categorySlug: "headphones",
    description:
      "Portable Bluetooth speaker with 360-degree sound and waterproof design.",
    isActive: true,
    specs: [
      { label: "Battery", value: "12 hours" },
      { label: "Waterproof", value: "IPX7" },
      { label: "Range", value: "30 feet" },
      { label: "Drivers", value: '2 x 2" + 1 x 4"' },
      { label: "Frequency Response", value: "60Hz - 20kHz" },
    ],
    variants: [
      {
        sku: "BTSPKR-BLK-001",
        price: 149.99,
        stock: 20,
        image:
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=800&fit=crop",
        ],
        options: { color: "Black" },
      },
      {
        sku: "BTSPKR-WHT-001",
        price: 149.99,
        stock: 15,
        image:
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop",
        ],
        options: { color: "White" },
      },
      {
        sku: "BTSPKR-BLU-001",
        price: 149.99,
        stock: 5,
        image:
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=600&fit=crop",
          "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&h=800&fit=crop",
          "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=800&h=800&fit=crop",
        ],
        options: { color: "Blue" },
      },
    ],
  },

  // Clothing Products
  {
    id: "classic-t-shirt",
    slug: "classic-t-shirt",
    name: "Classic Cotton T-Shirt",
    price: 29.99,
    stock: 100,
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    ],
    categorySlug: "mens-clothing",
    description:
      "Comfortable 100% cotton t-shirt available in multiple colors and sizes.",
    isActive: true,
    specs: [
      { label: "Material", value: "100% Cotton" },
      { label: "Fit", value: "Regular" },
      { label: "Care", value: "Machine Wash Cold" },
      { label: "Origin", value: "Made in USA" },
      { label: "Weight", value: "6.1 oz" },
    ],
    variants: [
      {
        sku: "TSHIRT-WHT-S",
        price: 29.99,
        stock: 20,
        options: { color: "White", size: "S" },
      },
      {
        sku: "TSHIRT-WHT-M",
        price: 29.99,
        stock: 25,
        options: { color: "White", size: "M" },
      },
      {
        sku: "TSHIRT-WHT-L",
        price: 29.99,
        stock: 22,
        options: { color: "White", size: "L" },
      },
      {
        sku: "TSHIRT-WHT-XL",
        price: 29.99,
        stock: 18,
        options: { color: "White", size: "XL" },
      },
      {
        sku: "TSHIRT-BLK-S",
        price: 29.99,
        stock: 30,
        options: { color: "Black", size: "S" },
      },
      {
        sku: "TSHIRT-BLK-M",
        price: 29.99,
        stock: 25,
        options: { color: "Black", size: "M" },
      },
      {
        sku: "TSHIRT-BLK-L",
        price: 29.99,
        stock: 20,
        options: { color: "Black", size: "L" },
      },
      {
        sku: "TSHIRT-BLK-XL",
        price: 29.99,
        stock: 15,
        options: { color: "Black", size: "XL" },
      },
      {
        sku: "TSHIRT-NAV-S",
        price: 29.99,
        stock: 12,
        options: { color: "Navy", size: "S" },
      },
      {
        sku: "TSHIRT-NAV-M",
        price: 29.99,
        stock: 15,
        options: { color: "Navy", size: "M" },
      },
      {
        sku: "TSHIRT-NAV-L",
        price: 29.99,
        stock: 10,
        options: { color: "Navy", size: "L" },
      },
      {
        sku: "TSHIRT-GRY-S",
        price: 29.99,
        stock: 8,
        options: { color: "Gray", size: "S" },
      },
      {
        sku: "TSHIRT-GRY-M",
        price: 29.99,
        stock: 12,
        options: { color: "Gray", size: "M" },
      },
    ],
  },
  {
    id: "designer-jeans",
    slug: "designer-jeans",
    name: "Designer Slim Fit Jeans",
    price: 89.99,
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
    ],
    categorySlug: "womens-clothing",
    description:
      "Premium slim fit jeans with stretch fabric for all-day comfort.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 20,
    specs: [
      { label: "Material", value: "98% Cotton, 2% Elastane" },
      { label: "Fit", value: "Slim" },
      { label: "Rise", value: "Mid-rise" },
      { label: "Care", value: "Machine Wash Cold" },
      { label: "Origin", value: "Made in Italy" },
    ],
    variants: [
      {
        sku: "JEANS-BLK-24",
        price: 89.99,
        stock: 8,
        options: { color: "Black", size: "24" },
      },
      {
        sku: "JEANS-BLK-26",
        price: 89.99,
        stock: 10,
        options: { color: "Black", size: "26" },
      },
      {
        sku: "JEANS-BLK-28",
        price: 89.99,
        stock: 12,
        options: { color: "Black", size: "28" },
      },
      {
        sku: "JEANS-BLK-30",
        price: 89.99,
        stock: 8,
        options: { color: "Black", size: "30" },
      },
      {
        sku: "JEANS-IND-24",
        price: 89.99,
        stock: 6,
        options: { color: "Indigo", size: "24" },
      },
      {
        sku: "JEANS-IND-26",
        price: 89.99,
        stock: 8,
        options: { color: "Indigo", size: "26" },
      },
      {
        sku: "JEANS-IND-28",
        price: 89.99,
        stock: 10,
        options: { color: "Indigo", size: "28" },
      },
      {
        sku: "JEANS-LGT-24",
        price: 89.99,
        stock: 4,
        options: { color: "Light Blue", size: "24" },
      },
      {
        sku: "JEANS-LGT-26",
        price: 89.99,
        stock: 6,
        options: { color: "Light Blue", size: "26" },
      },
    ],
  },
  {
    id: "kids-summer-dress",
    name: "Kids Summer Dress",
    price: 39.99,
    stock: 75,
    images: [
      "https://images.unsplash.com/photo-1503944168849-c1246463d2c8?w=400&h=400&fit=crop",
    ],
    categorySlug: "kids-clothing",
    description: "Light and airy summer dress perfect for play and parties.",
    isActive: true,
    specs: [
      { label: "Material", value: "Cotton Blend" },
      { label: "Age Range", value: "3-8 years" },
      { label: "Care", value: "Machine Wash" },
    ],
  },
  {
    id: "casual-blazer",
    name: "Casual Blazer",
    price: 129.99,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    ],
    categorySlug: "mens-clothing",
    description:
      "Versatile casual blazer that transitions from office to evening.",
    isActive: true,
    specs: [
      { label: "Material", value: "Wool Blend" },
      { label: "Fit", value: "Modern" },
      { label: "Care", value: "Dry Clean Only" },
    ],
  },

  // Home & Garden Products
  {
    id: "coffee-maker",
    name: "Programmable Coffee Maker",
    price: 79.99,
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=400&fit=crop",
    ],
    categorySlug: "kitchen-appliances",
    description: "12-cup programmable coffee maker with thermal carafe.",
    isActive: true,
    specs: [
      { label: "Capacity", value: "12 cups" },
      { label: "Features", value: "Programmable, Auto-shutoff" },
      { label: "Warranty", value: "1 year" },
    ],
  },
  {
    id: "garden-tool-set",
    name: "Complete Garden Tool Set",
    price: 59.99,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
    ],
    categorySlug: "gardening-tools",
    description: "8-piece garden tool set with durable steel construction.",
    isActive: true,
    specs: [
      { label: "Pieces", value: "8 tools" },
      { label: "Material", value: "Forged Steel" },
      { label: "Includes", value: "Trowel, Pruners, Gloves" },
    ],
  },
  {
    id: "decorative-pillow-set",
    name: "Decorative Pillow Set",
    price: 49.99,
    stock: 55,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    ],
    categorySlug: "home-decor",
    description: "Set of 4 decorative throw pillows in neutral colors.",
    isActive: true,
    specs: [
      { label: "Set Size", value: "4 pillows" },
      { label: "Material", value: "Cotton Blend" },
      { label: "Care", value: "Spot Clean" },
    ],
  },
  {
    id: "blender",
    name: "High-Speed Blender",
    price: 149.99,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    ],
    categorySlug: "kitchen-appliances",
    description:
      "Powerful blender with multiple speed settings and pre-programmed functions.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 15,
    specs: [
      { label: "Power", value: "1200 watts" },
      { label: "Capacity", value: "72 oz" },
      { label: "Speeds", value: "10 speeds + pulse" },
    ],
  },

  // Books Products
  {
    id: "bestseller-novel",
    name: "The Midnight Library",
    price: 16.99,
    stock: 80,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    ],
    categorySlug: "fiction-books",
    description: "A novel about the infinite possibilities of life choices.",
    isActive: true,
    specs: [
      { label: "Author", value: "Matt Haig" },
      { label: "Pages", value: "288" },
      { label: "Genre", value: "Fiction" },
    ],
  },
  {
    id: "business-biography",
    name: "Elon Musk: Tesla, SpaceX, and the Quest for a Fantastic Future",
    price: 19.99,
    stock: 65,
    images: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
    ],
    categorySlug: "non-fiction-books",
    description: "The definitive biography of Elon Musk.",
    isActive: true,
    specs: [
      { label: "Author", value: "Ashlee Vance" },
      { label: "Pages", value: "400" },
      { label: "Genre", value: "Biography" },
    ],
  },
  {
    id: "children-picture-book",
    name: "Where the Wild Things Are",
    price: 12.99,
    stock: 90,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    ],
    categorySlug: "children-books",
    description: "A classic children's picture book about imagination.",
    isActive: true,
    specs: [
      { label: "Author", value: "Maurice Sendak" },
      { label: "Age Range", value: "4-8 years" },
      { label: "Illustrations", value: "Full Color" },
    ],
  },
  {
    id: "science-textbook",
    name: "A Brief History of Time",
    price: 18.99,
    stock: 40,
    images: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
    ],
    categorySlug: "non-fiction-books",
    description:
      "From the Big Bang to Black Holes, a clear and concise guide to cosmology.",
    isActive: true,
    specs: [
      { label: "Author", value: "Stephen Hawking" },
      { label: "Pages", value: "256" },
      { label: "Topic", value: "Physics & Cosmology" },
    ],
  },
  // Additional Electronics Products
  {
    id: "mechanical-keyboard",
    name: "Mechanical Gaming Keyboard",
    slug: "mechanical-gaming-keyboard",
    price: 149.99,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&h=400&fit=crop",
    ],
    categorySlug: "electronics",
    description: "RGB backlit mechanical keyboard with Cherry MX switches.",
    isActive: true,
    specs: [
      { label: "Switch Type", value: "Cherry MX Red" },
      { label: "Backlighting", value: "RGB" },
      { label: "Connectivity", value: "USB-C" },
    ],
  },
  {
    id: "wireless-mouse",
    name: "Wireless Gaming Mouse",
    slug: "wireless-gaming-mouse",
    price: 89.99,
    stock: 42,
    images: [
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
    ],
    categorySlug: "electronics",
    description:
      "High-precision wireless gaming mouse with 1000Hz polling rate.",
    isActive: true,
    specs: [
      { label: "DPI", value: "Up to 16000" },
      { label: "Battery Life", value: "70 hours" },
      { label: "Connectivity", value: "2.4GHz Wireless" },
    ],
  },
  {
    id: "external-ssd",
    name: "1TB External SSD",
    slug: "1tb-external-ssd",
    price: 129.99,
    stock: 28,
    images: [
      "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=400&fit=crop",
    ],
    categorySlug: "electronics",
    description: "Fast portable SSD with USB 3.2 Gen 2 speeds.",
    isActive: true,
    specs: [
      { label: "Capacity", value: "1TB" },
      { label: "Interface", value: "USB 3.2 Gen 2" },
      { label: "Read Speed", value: "1050 MB/s" },
    ],
  },
  {
    id: "monitor-4k",
    name: "27-inch 4K Monitor",
    slug: "27-inch-4k-monitor",
    price: 449.99,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=400&fit=crop",
    ],
    categorySlug: "electronics",
    description: "Ultra HD monitor with HDR support and 144Hz refresh rate.",
    isActive: true,
    specs: [
      { label: "Resolution", value: "3840 x 2160" },
      { label: "Refresh Rate", value: "144Hz" },
      { label: "Panel Type", value: "IPS" },
    ],
  },
  {
    id: "router-wifi6",
    name: "WiFi 6 Mesh Router",
    slug: "wifi6-mesh-router",
    price: 199.99,
    stock: 22,
    images: [
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=400&fit=crop",
    ],
    categorySlug: "electronics",
    description: "Whole-home WiFi 6 mesh system for seamless connectivity.",
    isActive: true,
    specs: [
      { label: "WiFi Standard", value: "WiFi 6" },
      { label: "Speed", value: "Up to 6000 Mbps" },
      { label: "Coverage", value: "6000 sq ft" },
    ],
  },

  // Additional Clothing Products
  {
    id: "leather-jacket",
    name: "Classic Leather Jacket",
    slug: "classic-leather-jacket",
    price: 199.99,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
    ],
    categorySlug: "mens-clothing",
    description:
      "Timeless leather jacket with modern fit and premium craftsmanship.",
    isActive: true,
    specs: [
      { label: "Material", value: "Genuine Leather" },
      { label: "Lining", value: "Polyester" },
      { label: "Care", value: "Professional Clean Only" },
      { label: "Origin", value: "Made in USA" },
      { label: "Warranty", value: "2 Years" },
    ],
    variants: [
      {
        sku: "LJKT-BLK-S",
        price: 199.99,
        stock: 3,
        options: { color: "Black", size: "S" },
      },
      {
        sku: "LJKT-BLK-M",
        price: 199.99,
        stock: 4,
        options: { color: "Black", size: "M" },
      },
      {
        sku: "LJKT-BLK-L",
        price: 199.99,
        stock: 5,
        options: { color: "Black", size: "L" },
      },
      {
        sku: "LJKT-BLK-XL",
        price: 199.99,
        stock: 3,
        options: { color: "Black", size: "XL" },
      },
      {
        sku: "LJKT-TAN-M",
        price: 199.99,
        stock: 0,
        options: { color: "Tan", size: "M" },
      },
    ],
  },
  {
    id: "wool-coat",
    name: "Wool Overcoat",
    slug: "wool-overcoat",
    price: 299.99,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400&h=400&fit=crop",
    ],
    categorySlug: "mens-clothing",
    description:
      "Premium wool overcoat for cold weather with luxurious texture.",
    isActive: true,
    specs: [
      { label: "Material", value: "100% Wool" },
      { label: "Lining", value: "Viscose" },
      { label: "Season", value: "Fall/Winter" },
      { label: "Care", value: "Dry Clean Only" },
      { label: "Origin", value: "Made in Italy" },
    ],
    variants: [
      {
        sku: "WCOAT-BLK-M",
        price: 299.99,
        stock: 3,
        options: { color: "Black", size: "M" },
      },
      {
        sku: "WCOAT-BLK-L",
        price: 299.99,
        stock: 4,
        options: { color: "Black", size: "L" },
      },
      {
        sku: "WCOAT-BLK-XL",
        price: 299.99,
        stock: 2,
        options: { color: "Black", size: "XL" },
      },
      {
        sku: "WCOAT-GRY-M",
        price: 299.99,
        stock: 2,
        options: { color: "Gray", size: "M" },
      },
      {
        sku: "WCOAT-GRY-L",
        price: 299.99,
        stock: 1,
        options: { color: "Gray", size: "L" },
      },
    ],
  },
  {
    id: "summer-dress-floral",
    name: "Floral Summer Dress",
    slug: "floral-summer-dress",
    price: 79.99,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
    ],
    categorySlug: "womens-clothing",
    description: "Light and airy floral print dress perfect for summer.",
    isActive: true,
    specs: [
      { label: "Material", value: "Cotton Blend" },
      { label: "Length", value: "Midi" },
      { label: "Neckline", value: "V-neck" },
    ],
  },
  {
    id: "evening-gown",
    name: "Elegant Evening Gown",
    slug: "elegant-evening-gown",
    price: 249.99,
    stock: 8,
    images: [
      "https://images.unsplash.com/photo-1566479179817-c7a3c8f0ef79?w=400&h=400&fit=crop",
    ],
    categorySlug: "womens-clothing",
    description: "Sophisticated evening gown for special occasions.",
    isActive: true,
    specs: [
      { label: "Material", value: "Silk Blend" },
      { label: "Length", value: "Floor Length" },
      { label: "Occasion", value: "Formal Events" },
    ],
  },
  {
    id: "kids-hoodie",
    name: "Kids' Fleece Hoodie",
    slug: "kids-fleece-hoodie",
    price: 34.99,
    stock: 45,
    images: [
      "https://images.unsplash.com/photo-1503944168849-c1246463d2c8?w=400&h=400&fit=crop",
    ],
    categorySlug: "kids-clothing",
    description: "Comfortable fleece hoodie for active kids.",
    isActive: true,
    specs: [
      { label: "Material", value: "Cotton/Polyester Fleece" },
      { label: "Fit", value: "Regular" },
      { label: "Features", value: "Kangaroo Pocket" },
    ],
  },

  // Additional Home & Garden Products
  {
    id: "standing-desk",
    name: "Adjustable Standing Desk",
    slug: "adjustable-standing-desk",
    price: 349.99,
    stock: 14,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    ],
    categorySlug: "home-decor",
    description: "Height-adjustable standing desk with memory presets.",
    isActive: true,
    specs: [
      { label: "Height Range", value: "28-48 inches" },
      { label: "Weight Capacity", value: "350 lbs" },
      { label: "Surface", value: "Bamboo" },
    ],
  },
  {
    id: "led-floor-lamp",
    name: "Modern LED Floor Lamp",
    slug: "modern-led-floor-lamp",
    price: 129.99,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
    ],
    categorySlug: "home-decor",
    description: "Contemporary floor lamp with adjustable brightness.",
    isActive: true,
    specs: [
      { label: "Light Output", value: "1500 lumens" },
      { label: "Color Temperature", value: "2700K-6500K" },
      { label: "Power", value: "18W LED" },
    ],
  },
  {
    id: "cast-iron-skillet",
    name: "10-inch Cast Iron Skillet",
    slug: "10-inch-cast-iron-skillet",
    price: 49.99,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    ],
    categorySlug: "kitchen-appliances",
    description: "Pre-seasoned cast iron skillet for versatile cooking.",
    isActive: true,
    specs: [
      { label: "Material", value: "Cast Iron" },
      { label: "Diameter", value: "10 inches" },
      { label: "Weight", value: "5 lbs" },
    ],
  },
  {
    id: "instant-pot",
    name: "7-in-1 Instant Pot",
    slug: "7-in-1-instant-pot",
    price: 89.99,
    stock: 30,
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
    ],
    categorySlug: "kitchen-appliances",
    description: "Multi-cooker that replaces 7 kitchen appliances.",
    isActive: true,
    specs: [
      { label: "Capacity", value: "6 quarts" },
      {
        label: "Functions",
        value: "Pressure Cook, Slow Cook, Rice, Steam, Sauté, Warm, Yogurt",
      },
      { label: "Power", value: "1200W" },
    ],
  },
  {
    id: "watering-can",
    name: "Copper Watering Can",
    slug: "copper-watering-can",
    price: 39.99,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=400&h=400&fit=crop",
    ],
    categorySlug: "gardening-tools",
    description: "Beautiful copper watering can for your garden.",
    isActive: true,
    specs: [
      { label: "Material", value: "Copper" },
      { label: "Capacity", value: "2 gallons" },
      { label: "Finish", value: "Hammered Copper" },
    ],
  },

  // Additional Books Products
  {
    id: "cookbook-italian",
    name: "The Art of Italian Cooking",
    slug: "art-of-italian-cooking",
    price: 24.99,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
    ],
    categorySlug: "non-fiction-books",
    description: "Comprehensive guide to authentic Italian cuisine.",
    isActive: true,
    specs: [
      { label: "Author", value: "Maria Rossi" },
      { label: "Pages", value: "320" },
      { label: "Recipes", value: "150+" },
    ],
  },
  {
    id: "biography-steve-jobs",
    name: "Steve Jobs: The Exclusive Biography",
    slug: "steve-jobs-biography",
    price: 22.99,
    stock: 28,
    images: [
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=400&fit=crop",
    ],
    categorySlug: "non-fiction-books",
    description: "The definitive biography of Apple's co-founder.",
    isActive: true,
    specs: [
      { label: "Author", value: "Walter Isaacson" },
      { label: "Pages", value: "656" },
      { label: "Subject", value: "Technology & Business" },
    ],
  },
  {
    id: "mystery-novel",
    name: "The Silent Patient",
    slug: "silent-patient",
    price: 16.99,
    stock: 42,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    ],
    categorySlug: "fiction-books",
    description: "A psychological thriller about a woman's act of violence.",
    isActive: true,
    specs: [
      { label: "Author", value: "Alex Michaelides" },
      { label: "Pages", value: "336" },
      { label: "Genre", value: "Psychological Thriller" },
    ],
  },
  {
    id: "fantasy-epic",
    name: "The Name of the Wind",
    slug: "name-of-the-wind",
    price: 18.99,
    stock: 38,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    ],
    categorySlug: "fiction-books",
    description: "Epic fantasy novel about a gifted young man's journey.",
    isActive: true,
    specs: [
      { label: "Author", value: "Patrick Rothfuss" },
      { label: "Pages", value: "662" },
      { label: "Genre", value: "Epic Fantasy" },
    ],
  },
  {
    id: "children-picture-book-2",
    name: "The Very Hungry Caterpillar",
    slug: "very-hungry-caterpillar",
    price: 9.99,
    stock: 55,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    ],
    categorySlug: "children-books",
    description:
      "Classic children's book about a caterpillar's transformation.",
    isActive: true,
    specs: [
      { label: "Author", value: "Eric Carle" },
      { label: "Age Range", value: "2-5 years" },
      { label: "Illustrations", value: "Collage Art" },
    ],
  },

  // Additional Sale Products to reach 8+ products for carousel
  {
    id: "smartphone-sale",
    name: "Latest Smartphone Pro",
    slug: "latest-smartphone-pro",
    price: 799.99,
    originalPrice: 999.99,
    stock: 25,
    images: [
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
    ],
    categorySlug: "smartphones",
    description:
      "Flagship smartphone with advanced camera system and all-day battery.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 20,
    specs: [
      { label: "Display", value: "6.7-inch OLED" },
      { label: "Camera", value: "Triple 48MP" },
      { label: "Battery", value: "4500mAh" },
      { label: "Processor", value: "A17 Pro Chip" },
      { label: "Storage", value: "128GB - 1TB" },
      { label: "Water Resistance", value: "IP68" },
    ],
    variants: [
      {
        sku: "PHONE-PRO-BLK-128GB",
        price: 799.99,
        stock: 25,
        image:
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=800&fit=crop",
          "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800&h=800&fit=crop",
        ],
        options: { color: "Space Black", storage: "128GB" },
      },
    ],
  },
  {
    id: "winter-coat-sale",
    name: "Premium Winter Coat",
    slug: "premium-winter-coat",
    price: 179.99,
    originalPrice: 249.99,
    stock: 18,
    images: [
      "https://images.unsplash.com/photo-1544966503-7cc5ac882d5e?w=400&h=400&fit=crop",
    ],
    categorySlug: "womens-clothing",
    description: "Warm and stylish winter coat with water-resistant fabric.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 28,
    specs: [
      { label: "Material", value: "Polyester Blend" },
      { label: "Water Resistant", value: "Yes" },
      { label: "Lining", value: "Fleece" },
      { label: "Care", value: "Machine Wash Cold" },
      { label: "Fill", value: "Down Alternative" },
    ],
    variants: [
      {
        sku: "WCOAT-BLK-S",
        price: 179.99,
        stock: 4,
        options: { color: "Black", size: "S" },
      },
      {
        sku: "WCOAT-BLK-M",
        price: 179.99,
        stock: 5,
        options: { color: "Black", size: "M" },
      },
      {
        sku: "WCOAT-BLK-L",
        price: 179.99,
        stock: 4,
        options: { color: "Black", size: "L" },
      },
      {
        sku: "WCOAT-BLK-XL",
        price: 179.99,
        stock: 3,
        options: { color: "Black", size: "XL" },
      },
      {
        sku: "WCOAT-NAV-M",
        price: 179.99,
        stock: 2,
        options: { color: "Navy", size: "M" },
      },
    ],
  },
  {
    id: "robot-vacuum-sale",
    name: "Smart Robot Vacuum",
    slug: "smart-robot-vacuum",
    price: 299.99,
    originalPrice: 399.99,
    stock: 12,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=400&fit=crop",
    ],
    categorySlug: "kitchen-appliances",
    description: "Intelligent robot vacuum with mapping and app control.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 25,
    specs: [
      { label: "Battery", value: "90 minutes" },
      { label: "Navigation", value: "Laser Mapping" },
      { label: "Filtration", value: "HEPA" },
    ],
  },
  {
    id: "bestseller-sale",
    name: "Atomic Habits",
    slug: "atomic-habits",
    price: 14.99,
    originalPrice: 19.99,
    stock: 60,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    ],
    categorySlug: "non-fiction-books",
    description: "An Easy & Proven Way to Build Good Habits & Break Bad Ones.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 25,
    specs: [
      { label: "Author", value: "James Clear" },
      { label: "Pages", value: "320" },
      { label: "Genre", value: "Self-Help" },
    ],
  },
  {
    id: "gaming-chair-sale",
    name: "Ergonomic Gaming Chair",
    slug: "ergonomic-gaming-chair",
    price: 249.99,
    originalPrice: 349.99,
    stock: 15,
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop",
    ],
    categorySlug: "electronics",
    description:
      "Comfortable gaming chair with lumbar support and adjustable height.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 29,
    specs: [
      { label: "Material", value: "PU Leather" },
      { label: "Adjustable", value: "Height & Tilt" },
      { label: "Weight Capacity", value: "300 lbs" },
    ],
  },
  {
    id: "kids-puzzles-sale",
    name: "Educational Puzzle Set",
    slug: "educational-puzzle-set",
    price: 24.99,
    originalPrice: 34.99,
    stock: 35,
    images: [
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
    ],
    categorySlug: "children-books",
    description: "Set of 5 educational puzzles for ages 3-6.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 29,
    specs: [
      { label: "Age Range", value: "3-6 years" },
      { label: "Pieces", value: "50-100 per puzzle" },
      { label: "Themes", value: "Animals, Shapes, Colors" },
    ],
  },
  {
    id: "air-fryer-sale",
    name: "Digital Air Fryer",
    slug: "digital-air-fryer",
    price: 119.99,
    originalPrice: 159.99,
    stock: 20,
    images: [
      "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1556909114-04e29b5c9c5d?w=400&h=400&fit=crop",
    ],
    categorySlug: "kitchen-appliances",
    description:
      "5.8-quart air fryer with digital controls and multiple functions.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 25,
    specs: [
      { label: "Capacity", value: "5.8 quarts" },
      { label: "Temperature", value: "Up to 400°F" },
      { label: "Functions", value: "Air Fry, Roast, Bake" },
    ],
  },
  {
    id: "running-shoes-sale",
    name: "Performance Running Shoes",
    slug: "performance-running-shoes",
    price: 129.99,
    originalPrice: 179.99,
    stock: 28,
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=400&fit=crop",
    ],
    categorySlug: "mens-clothing",
    description:
      "Lightweight running shoes with advanced cushioning technology.",
    isActive: true,
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 28,
    specs: [
      { label: "Technology", value: "Air Cushioning" },
      { label: "Weight", value: "10.5 oz" },
      { label: "Support", value: "Neutral" },
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
    id: "electronics-collection",
    title: "Tech Essentials",
    description: "Latest gadgets and tech innovations",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?w=600&h=400&fit=crop",
    productCount: 18,
    priceRange: { min: 49, max: 899 },
  },
  {
    id: "clothing-collection",
    title: "Fashion Forward",
    description: "Trendy and timeless fashion pieces",
    image:
      "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop",
    productCount: 24,
    priceRange: { min: 29, max: 299 },
  },
  {
    id: "home-garden-collection",
    title: "Home Comfort",
    description: "Everything for your perfect home",
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=400&fit=crop",
    productCount: 32,
    priceRange: { min: 19, max: 349 },
  },
  {
    id: "books-collection",
    title: "Knowledge Hub",
    description: "Expand your mind with great reads",
    image:
      "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=600&h=400&fit=crop",
    productCount: 45,
    priceRange: { min: 12, max: 99 },
  },
];

export const staffPicks = [
  {
    id: "staff-1",
    title: "Editor's Choice",
    productName: "Wireless Noise-Cancelling Headphones",
    description: "Our top pick for immersive audio experience",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop",
    curator: "Sarah Johnson",
    curatorRole: "Audio Specialist",
  },
  {
    id: "staff-2",
    title: "Best Value",
    productName: "Premium Cotton T-Shirt",
    description: "Quality basics that last for years",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=300&h=300&fit=crop",
    curator: "Mike Chen",
    curatorRole: "Fashion Buyer",
  },
  {
    id: "staff-3",
    title: "Tech Innovation",
    productName: "Smart Watch Series Pro",
    description: "Revolutionary health tracking technology",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=300&h=300&fit=crop",
    curator: "Dr. Alex Rivera",
    curatorRole: "Tech Reviewer",
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
