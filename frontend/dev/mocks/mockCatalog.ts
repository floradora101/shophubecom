// Mock product catalog data.
import type {
  Category,
  Product,
  Promotion,
  ProductDiscount,
} from "@/features/products/types";

const mockCategories: Category[] = [
  {
    id: "cat-electronics",
    name: "Electronics",
    slug: "electronics",
    description: "Latest electronics and gadgets",
    parentId: null,
    createdAt: "2024-01-10T10:00:00.000Z",
    updatedAt: "2024-01-10T10:00:00.000Z",
  },
  {
    id: "cat-phones",
    name: "Phones",
    slug: "phones",
    description: "Smartphones and accessories",
    parentId: "cat-electronics",
    createdAt: "2024-01-15T10:00:00.000Z",
    updatedAt: "2024-01-15T10:00:00.000Z",
  },
  {
    id: "cat-phones-honor",
    name: "Honor",
    slug: "phones-honor",
    description: "Honor phones",
    parentId: "cat-phones",
    createdAt: "2024-11-20T10:00:00.000Z",
    updatedAt: "2024-11-20T10:00:00.000Z",
  },
  {
    id: "cat-phones-apple",
    name: "Apple",
    slug: "phones-apple",
    description: "Apple iPhones",
    parentId: "cat-phones",
    createdAt: "2024-09-10T10:00:00.000Z",
    updatedAt: "2024-09-10T10:00:00.000Z",
  },
  {
    id: "cat-phones-samsung",
    name: "Samsung",
    slug: "phones-samsung",
    description: "Samsung phones",
    parentId: "cat-phones",
    createdAt: "2024-09-11T10:00:00.000Z",
    updatedAt: "2024-09-11T10:00:00.000Z",
  },
  {
    id: "cat-laptops",
    name: "Laptops",
    slug: "laptops",
    description: "Notebooks, ultrabooks, and gaming laptops",
    parentId: "cat-electronics",
    createdAt: "2024-01-16T10:00:00.000Z",
    updatedAt: "2024-01-16T10:00:00.000Z",
  },
  {
    id: "cat-clothing",
    name: "Clothing",
    slug: "clothing",
    description: "Fashion and apparel for everyone",
    parentId: null,
    createdAt: "2024-01-11T10:00:00.000Z",
    updatedAt: "2024-01-11T10:00:00.000Z",
  },
  {
    id: "cat-home-garden",
    name: "Home & Garden",
    slug: "home-garden",
    description: "Everything for your home and garden",
    parentId: null,
    createdAt: "2024-01-12T10:00:00.000Z",
    updatedAt: "2024-01-12T10:00:00.000Z",
  },
  {
    id: "cat-sports-outdoors",
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    description: "Sports equipment and outdoor gear",
    parentId: null,
    createdAt: "2024-01-13T10:00:00.000Z",
    updatedAt: "2024-01-13T10:00:00.000Z",
  },
  {
    id: "cat-books",
    name: "Books",
    slug: "books",
    description: "Books for all ages and interests",
    parentId: null,
    createdAt: "2024-01-14T10:00:00.000Z",
    updatedAt: "2024-01-14T10:00:00.000Z",
  },
];

const categoryBySlug: Record<string, Category> = Object.fromEntries(
  mockCategories.map((category) => [category.slug, category])
);

const mockProducts: (Product & { images?: string[] })[] = [
  {
    id: "prod-gaming-laptop-pro-2024",
    name: "Gaming Laptop Pro 2024",
    slug: "gaming-laptop-pro-2024",
    description:
      "High-performance gaming laptop with RTX 4080, 32GB RAM, and fast NVMe storage. Perfect for gaming and professional work.",
    price: 2999.99, // Base price before sale/promo
    currency: "USD",
    stock: 15,
    images: ["https://via.placeholder.com/500x500?text=Gaming+Laptop"],
    isActive: true,
    categoryId: categoryBySlug["electronics"].id,
    category: categoryBySlug["electronics"],
    createdAt: "2024-02-15T10:00:00.000Z",
    updatedAt: "2024-02-15T10:00:00.000Z",

    specs: [
      { label: "Color", value: "Black or Silver" },
      { label: "GPU", value: "NVIDIA RTX 4080" },
      { label: "Memory", value: "32GB DDR5" },
    ],
    variants: [
      {
        id: "var-gaming-laptop-silver-1tb",
        sku: "SKU-GLP-SIL-1TB",
        price: 2499.99,
        stock: 8,
        image: "https://via.placeholder.com/500x500?text=Gaming+Laptop",
        options: {
          color: "Silver",
          storage: "1TB SSD",
        },
      },
      {
        id: "var-gaming-laptop-black-2tb",
        sku: "SKU-GLP-BLK-2TB",
        price: 2699.99,
        stock: 7,
        image: "https://via.placeholder.com/500x500?text=Gaming+Laptop",
        options: {
          color: "Black",
          storage: "2TB SSD",
        },
      },
    ],
    // Direct sale (not via promotion)
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 17,
    saleStartsAt: "2025-12-01T00:00:00.000Z",
    saleEndsAt: "2025-12-31T23:59:59.000Z",
    discount: {
      originalPrice: 2999.99,
      discountPercent: 17,
      isOnSale: true,
      saleStartDate: "2025-12-01T00:00:00.000Z",
      saleEndDate: "2025-12-31T23:59:59.000Z",
    },
  },
  {
    id: "prod-apple-iphone-16-pro-max-256gb-uk",
    name: "Apple iPhone 16 Pro Max 256GB UK (2 Years Warranty)",
    slug: "apple-iphone-16-pro-max-256gb-uk",
    description:
      'Apple iPhone 16 Pro Max with 6.9" OLED Super Retina XDR display, Dynamic Island, A18 Pro and 2-year warranty.',
    price: 1325,
    currency: "USD",
    stock: 13,
    images: [
      "https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Desert-Titanium.jpg",
      "https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Black-Titanium.jpg",
      "https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Natural-Titanium.jpg",
      "https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-White-Titanium.jpg",
    ],
    isActive: true,
    categoryId: categoryBySlug["phones-apple"].id,
    category: categoryBySlug["phones-apple"],
    createdAt: "2024-09-10T10:00:00.000Z",
    updatedAt: "2024-09-10T10:00:00.000Z",
    specs: [
      { label: "Display", value: '6.9" OLED Super Retina XDR, 120Hz' },
      { label: "Chip", value: "Apple A18 Pro (3nm)" },
      { label: "Camera", value: "48MP + 12MP + 48MP" },
      { label: "Warranty", value: "2 Years" },
    ],
    variants: [
      {
        id: "var-iphone16pm-black-256",
        sku: "SKU-IP16PM-BLK-256",
        price: 1325,
        stock: 8,
        image:
          "https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Black-Titanium.jpg",
        options: {
          color: "Black Titanium",
          storage: "256GB",
        },
      },
      {
        id: "var-iphone16pm-desert-256",
        sku: "SKU-IP16PM-DES-256",
        price: 1325,
        stock: 0,
        image:
          "https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Desert-Titanium.jpg",
        options: {
          color: "Desert Titanium",
          storage: "256GB",
        },
      },
      {
        id: "var-iphone16pm-natural-256",
        sku: "SKU-IP16PM-NAT-256",
        price: 1325,
        stock: 5,
        image:
          "https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Natural-Titanium.jpg",
        options: {
          color: "Natural Titanium",
          storage: "256GB",
        },
      },
      {
        id: "var-iphone16pm-white-256",
        sku: "SKU-IP16PM-WHT-256",
        price: 1325,
        stock: 0,
        image:
          "https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-White-Titanium.jpg",
        options: {
          color: "White Titanium",
          storage: "256GB",
        },
      },
      {
        id: "var-iphone16pm-natural-512",
        sku: "SKU-IP16PM-NAT-512",
        price: 1495,
        stock: 3,
        image:
          "https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Natural-Titanium.jpg",
        options: {
          color: "Natural Titanium",
          storage: "512GB",
        },
      },
    ],
  },
  {
    id: "prod-honor-400",
    name: "Honor 400",
    slug: "honor-400",
    description:
      'Honor 400 with 6.55" 120Hz AMOLED, Snapdragon 7 Gen 3, 12GB RAM, 256GB storage, 200MP + 12MP rear cameras, 50MP selfie, 6000mAh battery with 80W fast charging, IP65/IP66 water resistance, Android 15 with MagicOS 9, 1 year warranty and 365 day screen replacement.',
    price: 370,
    currency: "USD",
    stock: 24,
    images: [
      "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-26.jpg",
      "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-27.jpg",
      "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-28.jpg",
      "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-29.jpg",
    ],
    isActive: true,
    isFeatured: true,
    categoryId: categoryBySlug["phones-honor"].id,
    category: categoryBySlug["phones-honor"],
    createdAt: "2024-11-20T10:00:00.000Z",
    updatedAt: "2024-11-20T10:00:00.000Z",
    specs: [
      { label: "Display", value: '6.55" AMOLED, 120Hz, 5000 nits peak' },
      { label: "Chipset", value: "Snapdragon 7 Gen 3 (4nm)" },
      { label: "Memory", value: "12GB RAM + 256GB" },
      { label: "Main Camera", value: "200MP + 12MP" },
      { label: "Selfie Camera", value: "50MP" },
      { label: "Battery", value: "6000mAh, 80W wired" },
      { label: "OS", value: "Android 15 / MagicOS 9" },
      { label: "Water Resistance", value: "IP65/IP66" },
      { label: "Warranty", value: "1 Year + 365 Days Screen Warranty" },
    ],
    variants: [
      {
        id: "var-honor400-black-256",
        sku: "SKU-H400-BLK-256",
        price: 370,
        stock: 8,
        image:
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-26.jpg",
        images: [
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-26.jpg",
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-27.jpg",
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-28.jpg",
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-29.jpg",
        ],
        options: {
          color: "Black",
          storage: "256GB",
        },
      },
      {
        id: "var-honor400-gold-256",
        sku: "SKU-H400-GLD-256",
        price: 370,
        stock: 8,
        image:
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-27.jpg",
        images: [
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-27.jpg",
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-28.jpg",
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-29.jpg",
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-26.jpg",
        ],
        options: {
          color: "Gold",
          storage: "256GB",
        },
      },
      {
        id: "var-honor400-silver-256",
        sku: "SKU-H400-SLV-256",
        price: 370,
        stock: 8,
        image:
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-28.jpg",
        images: [
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-28.jpg",
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-29.jpg",
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-26.jpg",
          "https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-27.jpg",
        ],
        options: {
          color: "Silver",
          storage: "256GB",
        },
      },
    ],
  },
  {
    id: "prod-wireless-bluetooth-headphones",
    name: "Wireless Bluetooth Headphones",
    slug: "wireless-bluetooth-headphones",
    description:
      "Premium noise-cancelling headphones with 30-hour battery life and crystal-clear sound.",
    price: 199.99,
    currency: "USD",
    stock: 0,
    images: ["https://via.placeholder.com/500x500?text=Headphones"],
    isActive: true,
    categoryId: categoryBySlug["electronics"].id,
    category: categoryBySlug["electronics"],
    createdAt: "2024-02-12T10:00:00.000Z",
    updatedAt: "2024-02-12T10:00:00.000Z",
    colors: ["Black", "White", "Navy"],
    specs: [
      { label: "Color", value: "Black, White, or Navy" },
      { label: "Battery", value: "Up to 30 hours" },
      { label: "Noise Canceling", value: "Hybrid ANC" },
    ],
  },
  {
    id: "prod-smart-watch-series-9",
    name: "Smart Watch Series 9",
    slug: "smart-watch-series-9",
    description:
      "Advanced smartwatch with health tracking, GPS, and 2-day battery life.",
    price: 399.99,
    currency: "USD",
    stock: 30,
    images: ["https://via.placeholder.com/500x500?text=Smart+Watch"],
    isActive: true,
    categoryId: categoryBySlug["electronics"].id,
    category: categoryBySlug["electronics"],
    createdAt: "2024-02-10T10:00:00.000Z",
    updatedAt: "2024-02-10T10:00:00.000Z",
    colors: ["Midnight", "Starlight", "Rose"],
    specs: [
      { label: "Color", value: "Midnight, Starlight, or Rose" },
      { label: "Battery", value: "Up to 48 hours" },
      { label: "Water Resistance", value: "50 meters" },
    ],
  },
  {
    id: "prod-4k-ultra-hd-tv-55",
    name: '4K Ultra HD TV 55"',
    slug: "4k-ultra-hd-tv-55",
    description: "55-inch 4K Smart TV with HDR10+ and built-in streaming apps.",
    price: 999.99,
    currency: "USD",
    stock: 20,
    images: ["https://via.placeholder.com/500x500?text=TV"],
    isActive: true,
    categoryId: categoryBySlug["electronics"].id,
    category: categoryBySlug["electronics"],
    createdAt: "2024-02-08T10:00:00.000Z",
    updatedAt: "2024-02-08T10:00:00.000Z",
    colors: ["Black"],
    specs: [
      { label: "Color", value: "Black" },
      { label: "Resolution", value: "4K UHD with HDR10+" },
      { label: "Size", value: '55"' },
    ],
    // Direct sale
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 20,
    saleStartsAt: "2025-12-01T00:00:00.000Z",
    saleEndsAt: "2025-12-31T23:59:59.000Z",
    discount: {
      originalPrice: 999.99,
      discountPercent: 20,
      isOnSale: true,
      saleStartDate: "2025-12-01T00:00:00.000Z",
      saleEndDate: "2025-12-31T23:59:59.000Z",
    },
  },
  {
    id: "prod-wireless-mouse",
    name: "Wireless Mouse",
    slug: "wireless-mouse",
    description:
      "Ergonomic wireless mouse with precision tracking and long battery life.",
    price: 29.99,
    currency: "USD",
    stock: 100,
    images: ["https://via.placeholder.com/500x500?text=Mouse"],
    isActive: true,
    categoryId: categoryBySlug["electronics"].id,
    category: categoryBySlug["electronics"],
    createdAt: "2024-02-05T10:00:00.000Z",
    updatedAt: "2024-02-05T10:00:00.000Z",
    colors: ["Black", "White"],
    specs: [
      { label: "Color", value: "Black or White" },
      { label: "Battery", value: "Up to 12 months" },
      { label: "Tracking", value: "1600 DPI optical" },
    ],
  },
  {
    id: "prod-classic-denim-jacket",
    name: "Classic Denim Jacket",
    slug: "classic-denim-jacket",
    description:
      "Timeless denim jacket made from premium cotton. Perfect for any season.",
    price: 79.99,
    currency: "USD",
    stock: 45,
    images: ["https://via.placeholder.com/500x500?text=Denim+Jacket"],
    isActive: true,
    categoryId: categoryBySlug["clothing"].id,
    category: categoryBySlug["clothing"],
    createdAt: "2024-02-03T10:00:00.000Z",
    updatedAt: "2024-02-03T10:00:00.000Z",
    colors: ["Indigo", "Light Wash"],
    specs: [
      { label: "Color", value: "Indigo or Light Wash" },
      { label: "Material", value: "100% cotton denim" },
      { label: "Fit", value: "Regular" },
    ],
  },
  {
    id: "prod-cotton-t-shirt-pack",
    name: "Cotton T-Shirt Pack",
    slug: "cotton-t-shirt-pack",
    description:
      "Pack of 3 comfortable cotton t-shirts in various colors. 100% cotton.",
    price: 39.99,
    currency: "USD",
    stock: 80,
    images: ["https://via.placeholder.com/500x500?text=T-Shirt"],
    isActive: true,
    categoryId: categoryBySlug["clothing"].id,
    category: categoryBySlug["clothing"],
    createdAt: "2024-02-01T10:00:00.000Z",
    updatedAt: "2024-02-01T10:00:00.000Z",
    colors: ["White", "Black", "Gray"],
    specs: [
      { label: "Color", value: "White, Black, or Gray" },
      { label: "Fabric", value: "100% breathable cotton" },
      { label: "Pack", value: "3 shirts" },
    ],
  },
  {
    id: "prod-running-shoes",
    name: "Running Shoes",
    slug: "running-shoes",
    description:
      "Lightweight running shoes with cushioned sole and breathable mesh upper.",
    price: 159.99,
    currency: "USD",
    stock: 60,
    images: ["https://via.placeholder.com/500x500?text=Running+Shoes"],
    isActive: true,
    categoryId: categoryBySlug["clothing"].id,
    category: categoryBySlug["clothing"],
    createdAt: "2024-01-30T10:00:00.000Z",
    updatedAt: "2024-01-30T10:00:00.000Z",
    colors: ["Black/Red", "Blue/White"],
    specs: [
      { label: "Color", value: "Black/Red or Blue/White" },
      { label: "Upper", value: "Breathable mesh" },
      { label: "Sole", value: "Cushioned foam" },
    ],
    // Direct sale
    isOnSale: true,
    discountType: "PERCENTAGE",
    discountValue: 19,
    saleStartsAt: "2025-12-01T00:00:00.000Z",
    saleEndsAt: "2026-01-15T23:59:59.000Z",
    discount: {
      originalPrice: 159.99,
      discountPercent: 19,
      isOnSale: true,
      saleStartDate: "2025-12-01T00:00:00.000Z",
      saleEndDate: "2026-01-15T23:59:59.000Z",
    },
  },
  {
    id: "prod-coffee-maker-deluxe",
    name: "Coffee Maker Deluxe",
    slug: "coffee-maker-deluxe",
    description:
      "Programmable coffee maker with thermal carafe and auto-shutoff feature.",
    price: 89.99,
    currency: "USD",
    stock: 35,
    images: ["https://via.placeholder.com/500x500?text=Coffee+Maker"],
    isActive: true,
    categoryId: categoryBySlug["home-garden"].id,
    category: categoryBySlug["home-garden"],
    createdAt: "2024-01-28T10:00:00.000Z",
    updatedAt: "2024-01-28T10:00:00.000Z",
    colors: ["Black", "Stainless Steel"],
    specs: [
      { label: "Color", value: "Black or Stainless Steel" },
      { label: "Capacity", value: "12 cups" },
      { label: "Carafe", value: "Double-wall thermal" },
    ],
  },
  {
    id: "prod-indoor-plant-set",
    name: "Indoor Plant Set",
    slug: "indoor-plant-set",
    description:
      "Set of 3 low-maintenance indoor plants perfect for beginners.",
    price: 49.99,
    currency: "USD",
    stock: 25,
    images: ["https://via.placeholder.com/500x500?text=Plants"],
    isActive: true,
    categoryId: categoryBySlug["home-garden"].id,
    category: categoryBySlug["home-garden"],
    createdAt: "2024-01-25T10:00:00.000Z",
    updatedAt: "2024-01-25T10:00:00.000Z",
    colors: ["Various greens"],
    specs: [
      { label: "Color", value: "Assorted greens" },
      { label: "Quantity", value: "Set of 3 plants" },
      { label: "Care", value: "Low maintenance" },
    ],
  },
  {
    id: "prod-yoga-mat-premium",
    name: "Yoga Mat Premium",
    slug: "yoga-mat-premium",
    description:
      "Non-slip yoga mat with carrying strap. Extra thick for comfort.",
    price: 34.99,
    currency: "USD",
    stock: 70,
    images: ["https://via.placeholder.com/500x500?text=Yoga+Mat"],
    isActive: true,
    categoryId: categoryBySlug["sports-outdoors"].id,
    category: categoryBySlug["sports-outdoors"],
    createdAt: "2024-01-22T10:00:00.000Z",
    updatedAt: "2024-01-22T10:00:00.000Z",
    colors: ["Teal", "Purple", "Charcoal"],
    specs: [
      { label: "Color", value: "Teal, Purple, or Charcoal" },
      { label: "Thickness", value: "8mm cushioned" },
      { label: "Extras", value: "Includes carrying strap" },
    ],
  },
  {
    id: "prod-dumbbell-set-20kg",
    name: "Dumbbell Set 20kg",
    slug: "dumbbell-set-20kg",
    description:
      "Adjustable dumbbell set with weights from 2kg to 20kg per dumbbell.",
    price: 199.99,
    currency: "USD",
    stock: 15,
    images: ["https://via.placeholder.com/500x500?text=Dumbbells"],
    isActive: true,
    categoryId: categoryBySlug["sports-outdoors"].id,
    category: categoryBySlug["sports-outdoors"],
    createdAt: "2024-01-20T10:00:00.000Z",
    updatedAt: "2024-01-20T10:00:00.000Z",
    colors: ["Black"],
    specs: [
      { label: "Color", value: "Black plates with chrome handles" },
      { label: "Range", value: "2kg to 20kg adjustable" },
      { label: "Grip", value: "Knurled steel handles" },
    ],
  },
  {
    id: "prod-complete-guide-web-development",
    name: "The Complete Guide to Web Development",
    slug: "complete-guide-web-development",
    description:
      "Comprehensive guide covering HTML, CSS, JavaScript, and modern frameworks.",
    price: 49.99,
    currency: "USD",
    stock: 40,
    images: ["https://via.placeholder.com/500x500?text=Book"],
    isActive: true,
    categoryId: categoryBySlug["books"].id,
    category: categoryBySlug["books"],
    createdAt: "2024-01-18T10:00:00.000Z",
    updatedAt: "2024-01-18T10:00:00.000Z",
    colors: ["Navy cover"],
    specs: [
      { label: "Color", value: "Navy cover" },
      { label: "Pages", value: "640" },
      { label: "Format", value: "Paperback" },
    ],
  },
  {
    id: "prod-design-patterns-typescript",
    name: "Design Patterns in TypeScript",
    slug: "design-patterns-typescript",
    description:
      "Learn essential design patterns with practical TypeScript examples.",
    price: 39.99,
    currency: "USD",
    stock: 55,
    images: ["https://via.placeholder.com/500x500?text=Book"],
    isActive: true,
    categoryId: categoryBySlug["books"].id,
    category: categoryBySlug["books"],
    createdAt: "2024-01-16T10:00:00.000Z",
    updatedAt: "2024-01-16T10:00:00.000Z",
    colors: ["Teal cover"],
    specs: [
      { label: "Color", value: "Teal cover" },
      { label: "Pages", value: "420" },
      { label: "Format", value: "Paperback" },
    ],
  },
];

const featuredSlugs = [
  "gaming-laptop-pro-2024",
  "apple-iphone-16-pro-max-256gb-uk",
  "honor-400",
  "wireless-bluetooth-headphones",
  "smart-watch-series-9",
  "4k-ultra-hd-tv-55",
  "running-shoes",
  "coffee-maker-deluxe",
  "yoga-mat-premium",
  "design-patterns-typescript",
];

// Mock Promotions
const mockPromotions: Promotion[] = [
  {
    id: "promo-black-friday",
    name: "Black Friday Sale",
    code: "BLACKFRIDAY2024",
    type: "PERCENTAGE",
    value: 25, // 25% off
    startsAt: "2025-11-20T00:00:00.000Z",
    expiresAt: "2025-12-15T23:59:59.000Z",
    isActive: true,
    applicableProductIds: [
      "prod-gaming-laptop-pro-2024",
      "prod-4k-ultra-hd-tv-55",
      "prod-wireless-bluetooth-headphones",
    ],
    minOrderTotal: 100,
    discountType: "PERCENTAGE",
    discountValue: 25,
    startDate: "2025-11-20T00:00:00.000Z",
    endDate: "2025-12-15T23:59:59.000Z",
  },
  {
    id: "promo-christmas",
    name: "Christmas Special",
    code: "CHRISTMAS2024",
    type: "PERCENTAGE",
    value: 20, // 20% off
    startsAt: "2025-12-01T00:00:00.000Z",
    expiresAt: "2025-12-31T23:59:59.000Z",
    isActive: true,
    applicableProductIds: [
      "prod-apple-iphone-16-pro-max-256gb-uk",
      "prod-gaming-laptop-pro-2024",
    ],
    discountType: "PERCENTAGE",
    discountValue: 20,
    startDate: "2025-12-01T00:00:00.000Z",
    endDate: "2025-12-31T23:59:59.000Z",
  },
  {
    id: "promo-new-year",
    name: "New Year Flash Sale",
    code: "NEWYEAR50",
    type: "FIXED_AMOUNT",
    value: 50, // $50 off
    startsAt: "2025-12-26T00:00:00.000Z",
    expiresAt: "2026-01-05T23:59:59.000Z",
    isActive: true,
    minOrderTotal: 200,
    maxDiscount: 100, // Max $100 discount
    discountType: "FIXED_AMOUNT",
    discountValue: 50,
    startDate: "2025-12-26T00:00:00.000Z",
    endDate: "2026-01-05T23:59:59.000Z",
  },
  {
    id: "promo-winter-sale",
    name: "Winter Sale",
    code: "WINTER15",
    type: "PERCENTAGE",
    value: 15, // 15% off
    startsAt: "2025-12-01T00:00:00.000Z",
    expiresAt: "2026-02-28T23:59:59.000Z",
    isActive: true,
    applicableProductIds: [
      "prod-classic-denim-jacket",
      "prod-indoor-plant-set",
    ],
    discountType: "PERCENTAGE",
    discountValue: 15,
    startDate: "2025-12-01T00:00:00.000Z",
    endDate: "2026-02-28T23:59:59.000Z",
  },
];

// Helper function to check date ranges safely
const isDateActive = (start?: string | null, end?: string | null): boolean => {
  const now = new Date();
  if (!start && !end) return true;
  if (start && now < new Date(start)) return false;
  if (end && now > new Date(end)) return false;
  return true;
};

// Helper function to check if promotion is active
const isPromotionActive = (promotion: Promotion): boolean => {
  if (!promotion.isActive) return false;
  return isDateActive(
    promotion.startsAt || promotion.startDate || null,
    promotion.expiresAt || promotion.endDate || null
  );
};

// Helper function to calculate discount
const calculateDiscount = (
  price: number,
  promotion: Promotion
): { discountedPrice: number; discountAmount: number } => {
  let discountAmount = 0;

  const type = promotion.type || promotion.discountType;
  const value = promotion.value ?? promotion.discountValue ?? 0;

  if (type === "PERCENTAGE") {
    discountAmount = (price * value) / 100;
    if (promotion.maxDiscount) {
      discountAmount = Math.min(discountAmount, promotion.maxDiscount);
    }
  } else {
    // FIXED_AMOUNT
    discountAmount = value;
  }

  const discountedPrice = Math.max(0, price - discountAmount);
  return { discountedPrice, discountAmount };
};

// Helper: find best promotion-based discount for a product
const getPromotionSale = (
  product: Product,
  promotions: Promotion[],
  basePrice: number
): {
  discountedPrice: number;
  discountAmount: number;
  discountPercent: number;
  promotionId: string;
  promotionIds: string[];
  saleStartDate?: string;
  saleEndDate?: string;
} | null => {
  const activePromotions = promotions.filter((promo) => {
    if (!isPromotionActive(promo)) return false;

    // Check if promotion applies to this product
    if (promo.applicableProductIds?.length) {
      return promo.applicableProductIds.includes(product.id);
    }

    if (promo.applicableCategoryIds?.length) {
      return promo.applicableCategoryIds.includes(product.categoryId ?? "");
    }

    // If no restrictions, applies to all
    return true;
  });

  if (activePromotions.length === 0) {
    return null;
  }

  // Get the best promotion (highest discount)
  const bestPromotion = activePromotions.reduce((best, current) => {
    const bestDiscount = calculateDiscount(basePrice, best);
    const currentDiscount = calculateDiscount(basePrice, current);
    return currentDiscount.discountAmount > bestDiscount.discountAmount
      ? current
      : best;
  });

  const { discountedPrice, discountAmount } = calculateDiscount(
    basePrice,
    bestPromotion
  );

  const discountPercent = Math.round((discountAmount / basePrice) * 100);

  return {
    discountedPrice,
    discountAmount,
    discountPercent,
    promotionId: bestPromotion.id,
    promotionIds: activePromotions.map((p) => p.id),
    saleStartDate:
      bestPromotion.startsAt || bestPromotion.startDate || undefined,
    saleEndDate: bestPromotion.expiresAt || bestPromotion.endDate || undefined,
  };
};

// Helper: evaluate direct sale fields on product
const getDirectSale = (
  product: Product
): {
  discountedPrice: number;
  discountAmount: number;
  discountPercent: number;
  saleStartDate?: string;
  saleEndDate?: string;
} | null => {
  const hasDirectSale = product.isOnSale || product.discount?.isOnSale;
  if (!hasDirectSale) return null;

  const saleStart =
    product.saleStartsAt || product.discount?.saleStartDate || null;
  const saleEnd = product.saleEndsAt || product.discount?.saleEndDate || null;
  if (!isDateActive(saleStart, saleEnd)) return null;

  const basePrice = product.discount?.originalPrice ?? product.price;
  const type =
    product.discountType ||
    (product.discount?.discountPercent ? "PERCENTAGE" : undefined) ||
    "PERCENTAGE";
  const value = product.discountValue ?? product.discount?.discountPercent ?? 0;

  if (!value || value <= 0) return null;

  const rawDiscount = type === "PERCENTAGE" ? (basePrice * value) / 100 : value;
  const discountAmount = Math.min(rawDiscount, basePrice);
  const discountedPrice = Math.max(0, basePrice - discountAmount);
  const discountPercent = Math.round((discountAmount / basePrice) * 100);

  return {
    discountedPrice,
    discountAmount,
    discountPercent,
    saleStartDate: saleStart ?? undefined,
    saleEndDate: saleEnd ?? undefined,
  };
};

export const getProducts = (): Product[] => mockProducts;

// Helper function to process product with discounts
const processProductDiscounts = (
  product: Product
): Product & { discount?: ProductDiscount } => {
  const basePrice = product.discount?.originalPrice ?? product.price;

  const directSale = getDirectSale({ ...product, price: basePrice });
  const promotionSale = getPromotionSale(product, mockPromotions, basePrice);

  const bestSale =
    directSale && promotionSale
      ? directSale.discountAmount >= promotionSale.discountAmount
        ? { ...directSale, source: "direct" as const }
        : { ...promotionSale, source: "promotion" as const }
      : directSale
      ? { ...directSale, source: "direct" as const }
      : promotionSale
      ? { ...promotionSale, source: "promotion" as const }
      : null;

  if (!bestSale) {
    return product;
  }

  return {
    ...product,
    price: bestSale.discountedPrice,
    discount: {
      originalPrice: basePrice,
      discountPercent: bestSale.discountPercent,
      isOnSale: true,
      saleStartDate: bestSale.saleStartDate,
      saleEndDate: bestSale.saleEndDate,
      promotionId:
        bestSale.source === "promotion" ? bestSale.promotionId : undefined,
    },
    promotionIds:
      bestSale.source === "promotion"
        ? bestSale.promotionIds
        : product.promotionIds,
    // For backward compatibility
    originalPrice: basePrice,
    discountPercent: bestSale.discountPercent,
  };
};

export const getFeaturedProducts = (): Array<
  Product & { discount?: ProductDiscount }
> => {
  // First try to get products marked as featured
  const featuredProducts = mockProducts.filter(
    (product) => product.isFeatured === true
  );

  // If no products are marked as featured, fall back to featuredSlugs for backward compatibility
  if (featuredProducts.length > 0) {
    return featuredProducts.map(processProductDiscounts);
  }

  // Fallback to hardcoded slugs (for backward compatibility)
  const products = mockProducts.filter((product) =>
    featuredSlugs.includes(product.slug)
  );
  return products.map(processProductDiscounts);
};

export const getLatestProducts = (): Array<
  Product & { discount?: ProductDiscount }
> => {
  const products = [...mockProducts].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  return products.map(processProductDiscounts);
};

export const getOfferProducts = (): Array<
  Product & {
    originalPrice: number;
    discountPercent: number;
    bundledItems?: string[];
    discount?: ProductDiscount;
  }
> => {
  // Define bundled items for specific product types
  const offerConfigs: Record<
    string,
    {
      bundledItems: string[];
    }
  > = {
    "apple-iphone-16-pro-max-256gb-uk": {
      bundledItems: [
        "Free Powerbank 10,000mAh",
        "Free Wireless Earbuds",
        "Free Phone Stand",
        "Free Screen Protector",
        "Free Smartwatch",
        "Free Carrying Bag",
      ],
    },
    "gaming-laptop-pro-2024": {
      bundledItems: [
        "Free Wireless Mouse",
        "Free Laptop Bag",
        "Free USB Hub",
        "Free Keyboard Cleaner",
        "Free Mouse Pad",
      ],
    },
    "wireless-bluetooth-headphones": {
      bundledItems: [
        "Free Carrying Case",
        "Free Audio Cable",
        "Free Cleaning Kit",
        "Free Warranty Extension",
      ],
    },
  };

  return getLatestProducts()
    .slice(0, 12)
    .map((product) => {
      const config = offerConfigs[product.slug] || {};

      // Ensure discount info exists for offer products
      const originalPrice =
        product.discount?.originalPrice ||
        product.originalPrice ||
        product.price;
      const discountPercent =
        product.discount?.discountPercent || product.discountPercent || 0;

      return {
        ...product,
        originalPrice,
        discountPercent,
        bundledItems: config.bundledItems,
      };
    });
};

export const getProductBySlug = (
  slug: string
): (Product & { discount?: ProductDiscount }) | null => {
  const product = mockProducts.find((product) => product.slug === slug);
  return product ? processProductDiscounts(product) : null;
};

export const getCategories = (): Category[] => mockCategories;

// Export promotions for use in checkout/cart
export const getPromotions = (): Promotion[] => mockPromotions;

export const getActivePromotions = (): Promotion[] => {
  return mockPromotions.filter(isPromotionActive);
};

export const getPromotionByCode = (code: string): Promotion | null => {
  return mockPromotions.find((p) => p.code === code) || null;
};
