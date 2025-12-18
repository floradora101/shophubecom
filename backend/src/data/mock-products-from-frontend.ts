// Mock product data extracted from frontend/lib/data/mockCatalog.ts
// This ensures backend seed data matches frontend mock data exactly

export interface MockProductWithVariants {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categorySlug: string; // Maps to backend category slug
  isActive?: boolean;
  isOnSale?: boolean;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  saleStartsAt?: Date;
  saleEndsAt?: Date;
  colors?: string[];
  specs?: Array<{ label: string; value: string }> | Record<string, unknown>;
  variants?: Array<{
    sku: string;
    price: number;
    stock: number;
    image?: string;
    images?: string[];
    options: Record<string, string>;
  }>;
}

export const mockProductsFromFrontend: MockProductWithVariants[] = [
  {
    name: 'Gaming Laptop Pro 2024',
    slug: 'gaming-laptop-pro-2024',
    description:
      'High-performance gaming laptop with RTX 4080, 32GB RAM, and fast NVMe storage. Perfect for gaming and professional work.',
    price: 2999.99,
    stock: 15,
    images: ['https://via.placeholder.com/500x500?text=Gaming+Laptop'],
    categorySlug: 'electronics',
    isActive: true,
    isOnSale: true,
    discountType: 'PERCENTAGE',
    discountValue: 17,
    saleStartsAt: new Date('2025-12-01'),
    saleEndsAt: new Date('2025-12-31'),
    specs: [
      { label: 'Color', value: 'Black or Silver' },
      { label: 'GPU', value: 'NVIDIA RTX 4080' },
      { label: 'Memory', value: '32GB DDR5' },
    ],
    variants: [
      {
        sku: 'SKU-GLP-SIL-1TB',
        price: 2499.99,
        stock: 8,
        image: 'https://via.placeholder.com/500x500?text=Gaming+Laptop',
        options: {
          color: 'Silver',
          storage: '1TB SSD',
        },
      },
      {
        sku: 'SKU-GLP-BLK-2TB',
        price: 2699.99,
        stock: 7,
        image: 'https://via.placeholder.com/500x500?text=Gaming+Laptop',
        options: {
          color: 'Black',
          storage: '2TB SSD',
        },
      },
    ],
  },
  {
    name: 'Apple iPhone 16 Pro Max 256GB UK (2 Years Warranty)',
    slug: 'apple-iphone-16-pro-max-256gb-uk',
    description:
      'Apple iPhone 16 Pro Max with 6.9" OLED Super Retina XDR display, Dynamic Island, A18 Pro and 2-year warranty.',
    price: 1325,
    stock: 13,
    images: [
      'https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Desert-Titanium.jpg',
      'https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Black-Titanium.jpg',
      'https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Natural-Titanium.jpg',
      'https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-White-Titanium.jpg',
    ],
    categorySlug: 'electronics', // Will map to electronics (phones-apple doesn't exist in backend)
    isActive: true,
    specs: [
      { label: 'Display', value: '6.9" OLED Super Retina XDR, 120Hz' },
      { label: 'Chip', value: 'Apple A18 Pro (3nm)' },
      { label: 'Camera', value: '48MP + 12MP + 48MP' },
      { label: 'Warranty', value: '2 Years' },
    ],
    variants: [
      {
        sku: 'SKU-IP16PM-BLK-256',
        price: 1325,
        stock: 8,
        image:
          'https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Black-Titanium.jpg',
        options: {
          color: 'Black Titanium',
          storage: '256GB',
        },
      },
      {
        sku: 'SKU-IP16PM-DES-256',
        price: 1325,
        stock: 0,
        image:
          'https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Desert-Titanium.jpg',
        options: {
          color: 'Desert Titanium',
          storage: '256GB',
        },
      },
      {
        sku: 'SKU-IP16PM-NAT-256',
        price: 1325,
        stock: 5,
        image:
          'https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Natural-Titanium.jpg',
        options: {
          color: 'Natural Titanium',
          storage: '256GB',
        },
      },
      {
        sku: 'SKU-IP16PM-WHT-256',
        price: 1325,
        stock: 0,
        image:
          'https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-White-Titanium.jpg',
        options: {
          color: 'White Titanium',
          storage: '256GB',
        },
      },
      {
        sku: 'SKU-IP16PM-NAT-512',
        price: 1495,
        stock: 3,
        image:
          'https://najemstarcall.com/wp-content/uploads/2024/09/Apple-iPhone-16-Pro-Natural-Titanium.jpg',
        options: {
          color: 'Natural Titanium',
          storage: '512GB',
        },
      },
    ],
  },
  {
    name: 'Honor 400',
    slug: 'honor-400',
    description:
      'Honor 400 with 6.55" 120Hz AMOLED, Snapdragon 7 Gen 3, 12GB RAM, 256GB storage, 200MP + 12MP rear cameras, 50MP selfie, 6000mAh battery with 80W fast charging, IP65/IP66 water resistance, Android 15 with MagicOS 9, 1 year warranty and 365 day screen replacement.',
    price: 370,
    stock: 24,
    images: [
      'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-26.jpg',
      'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-27.jpg',
      'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-28.jpg',
      'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-29.jpg',
    ],
    categorySlug: 'electronics',
    isActive: true,
    specs: [
      { label: 'Display', value: '6.55" AMOLED, 120Hz, 5000 nits peak' },
      { label: 'Chipset', value: 'Snapdragon 7 Gen 3 (4nm)' },
      { label: 'Memory', value: '12GB RAM + 256GB' },
      { label: 'Main Camera', value: '200MP + 12MP' },
      { label: 'Selfie Camera', value: '50MP' },
      { label: 'Battery', value: '6000mAh, 80W wired' },
      { label: 'OS', value: 'Android 15 / MagicOS 9' },
      { label: 'Water Resistance', value: 'IP65/IP66' },
      { label: 'Warranty', value: '1 Year + 365 Days Screen Warranty' },
    ],
    variants: [
      {
        sku: 'SKU-H400-BLK-256',
        price: 370,
        stock: 8,
        image:
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-26.jpg',
        images: [
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-26.jpg',
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-27.jpg',
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-28.jpg',
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-29.jpg',
        ],
        options: {
          color: 'Black',
          storage: '256GB',
        },
      },
      {
        sku: 'SKU-H400-GLD-256',
        price: 370,
        stock: 8,
        image:
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-27.jpg',
        images: [
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-27.jpg',
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-28.jpg',
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-29.jpg',
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-26.jpg',
        ],
        options: {
          color: 'Gold',
          storage: '256GB',
        },
      },
      {
        sku: 'SKU-H400-SLV-256',
        price: 370,
        stock: 8,
        image:
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-28.jpg',
        images: [
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-28.jpg',
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-29.jpg',
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-26.jpg',
          'https://najemstarcall.com/wp-content/uploads/2024/01/honor-400-27.jpg',
        ],
        options: {
          color: 'Silver',
          storage: '256GB',
        },
      },
    ],
  },
  {
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    description:
      'Premium noise-cancelling headphones with 30-hour battery life and crystal-clear sound.',
    price: 199.99,
    stock: 0,
    images: ['https://via.placeholder.com/500x500?text=Headphones'],
    categorySlug: 'electronics',
    isActive: true,
    colors: ['Black', 'White', 'Navy'],
    specs: [
      { label: 'Color', value: 'Black, White, or Navy' },
      { label: 'Battery', value: 'Up to 30 hours' },
      { label: 'Noise Canceling', value: 'Hybrid ANC' },
    ],
  },
  {
    name: 'Smart Watch Series 9',
    slug: 'smart-watch-series-9',
    description:
      'Advanced smartwatch with health tracking, GPS, and 2-day battery life.',
    price: 399.99,
    stock: 30,
    images: ['https://via.placeholder.com/500x500?text=Smart+Watch'],
    categorySlug: 'electronics',
    isActive: true,
    colors: ['Midnight', 'Starlight', 'Rose'],
    specs: [
      { label: 'Color', value: 'Midnight, Starlight, or Rose' },
      { label: 'Battery', value: 'Up to 48 hours' },
      { label: 'Water Resistance', value: '50 meters' },
    ],
  },
  {
    name: '4K Ultra HD TV 55"',
    slug: '4k-ultra-hd-tv-55',
    description: '55-inch 4K Smart TV with HDR10+ and built-in streaming apps.',
    price: 999.99,
    stock: 20,
    images: ['https://via.placeholder.com/500x500?text=TV'],
    categorySlug: 'electronics',
    isActive: true,
    isOnSale: true,
    discountType: 'PERCENTAGE',
    discountValue: 20,
    saleStartsAt: new Date('2025-12-01'),
    saleEndsAt: new Date('2025-12-31'),
    colors: ['Black'],
    specs: [
      { label: 'Color', value: 'Black' },
      { label: 'Resolution', value: '4K UHD with HDR10+' },
      { label: 'Size', value: '55"' },
    ],
  },
  {
    name: 'Wireless Mouse',
    slug: 'wireless-mouse',
    description:
      'Ergonomic wireless mouse with precision tracking and long battery life.',
    price: 29.99,
    stock: 100,
    images: ['https://via.placeholder.com/500x500?text=Mouse'],
    categorySlug: 'electronics',
    isActive: true,
    colors: ['Black', 'White'],
    specs: [
      { label: 'Color', value: 'Black or White' },
      { label: 'Battery', value: 'Up to 12 months' },
      { label: 'Tracking', value: '1600 DPI optical' },
    ],
  },
  {
    name: 'Classic Denim Jacket',
    slug: 'classic-denim-jacket',
    description:
      'Timeless denim jacket made from premium cotton. Perfect for any season.',
    price: 79.99,
    stock: 45,
    images: ['https://via.placeholder.com/500x500?text=Denim+Jacket'],
    categorySlug: 'clothing',
    isActive: true,
    colors: ['Indigo', 'Light Wash'],
    specs: [
      { label: 'Color', value: 'Indigo or Light Wash' },
      { label: 'Material', value: '100% cotton denim' },
      { label: 'Fit', value: 'Regular' },
    ],
  },
  {
    name: 'Cotton T-Shirt Pack',
    slug: 'cotton-t-shirt-pack',
    description:
      'Pack of 3 comfortable cotton t-shirts in various colors. 100% cotton.',
    price: 39.99,
    stock: 80,
    images: ['https://via.placeholder.com/500x500?text=T-Shirt'],
    categorySlug: 'clothing',
    isActive: true,
    colors: ['White', 'Black', 'Gray'],
    specs: [
      { label: 'Color', value: 'White, Black, or Gray' },
      { label: 'Fabric', value: '100% breathable cotton' },
      { label: 'Pack', value: '3 shirts' },
    ],
  },
  {
    name: 'Running Shoes',
    slug: 'running-shoes',
    description:
      'Lightweight running shoes with cushioned sole and breathable mesh upper.',
    price: 159.99,
    stock: 60,
    images: ['https://via.placeholder.com/500x500?text=Running+Shoes'],
    categorySlug: 'clothing',
    isActive: true,
    isOnSale: true,
    discountType: 'PERCENTAGE',
    discountValue: 19,
    saleStartsAt: new Date('2025-12-01'),
    saleEndsAt: new Date('2026-01-15'),
    colors: ['Black/Red', 'Blue/White'],
    specs: [
      { label: 'Color', value: 'Black/Red or Blue/White' },
      { label: 'Upper', value: 'Breathable mesh' },
      { label: 'Sole', value: 'Cushioned foam' },
    ],
  },
  {
    name: 'Coffee Maker Deluxe',
    slug: 'coffee-maker-deluxe',
    description:
      'Programmable coffee maker with thermal carafe and auto-shutoff feature.',
    price: 89.99,
    stock: 35,
    images: ['https://via.placeholder.com/500x500?text=Coffee+Maker'],
    categorySlug: 'home-garden',
    isActive: true,
    colors: ['Black', 'Stainless Steel'],
    specs: [
      { label: 'Color', value: 'Black or Stainless Steel' },
      { label: 'Capacity', value: '12 cups' },
      { label: 'Carafe', value: 'Double-wall thermal' },
    ],
  },
  {
    name: 'Indoor Plant Set',
    slug: 'indoor-plant-set',
    description:
      'Set of 3 low-maintenance indoor plants perfect for beginners.',
    price: 49.99,
    stock: 25,
    images: ['https://via.placeholder.com/500x500?text=Plants'],
    categorySlug: 'home-garden',
    isActive: true,
    colors: ['Various greens'],
    specs: [
      { label: 'Color', value: 'Assorted greens' },
      { label: 'Quantity', value: 'Set of 3 plants' },
      { label: 'Care', value: 'Low maintenance' },
    ],
  },
  {
    name: 'Yoga Mat Premium',
    slug: 'yoga-mat-premium',
    description:
      'Non-slip yoga mat with carrying strap. Extra thick for comfort.',
    price: 34.99,
    stock: 70,
    images: ['https://via.placeholder.com/500x500?text=Yoga+Mat'],
    categorySlug: 'sports-outdoors',
    isActive: true,
    colors: ['Teal', 'Purple', 'Charcoal'],
    specs: [
      { label: 'Color', value: 'Teal, Purple, or Charcoal' },
      { label: 'Thickness', value: '8mm cushioned' },
      { label: 'Extras', value: 'Includes carrying strap' },
    ],
  },
  {
    name: 'Dumbbell Set 20kg',
    slug: 'dumbbell-set-20kg',
    description:
      'Adjustable dumbbell set with weights from 2kg to 20kg per dumbbell.',
    price: 199.99,
    stock: 15,
    images: ['https://via.placeholder.com/500x500?text=Dumbbells'],
    categorySlug: 'sports-outdoors',
    isActive: true,
    colors: ['Black'],
    specs: [
      { label: 'Color', value: 'Black plates with chrome handles' },
      { label: 'Range', value: '2kg to 20kg adjustable' },
      { label: 'Grip', value: 'Knurled steel handles' },
    ],
  },
  {
    name: 'The Complete Guide to Web Development',
    slug: 'complete-guide-web-development',
    description:
      'Comprehensive guide covering HTML, CSS, JavaScript, and modern frameworks.',
    price: 49.99,
    stock: 40,
    images: ['https://via.placeholder.com/500x500?text=Book'],
    categorySlug: 'books',
    isActive: true,
    colors: ['Navy cover'],
    specs: [
      { label: 'Color', value: 'Navy cover' },
      { label: 'Pages', value: '640' },
      { label: 'Format', value: 'Paperback' },
    ],
  },
  {
    name: 'Design Patterns in TypeScript',
    slug: 'design-patterns-typescript',
    description:
      'Learn essential design patterns with practical TypeScript examples.',
    price: 39.99,
    stock: 55,
    images: ['https://via.placeholder.com/500x500?text=Book'],
    categorySlug: 'books',
    isActive: true,
    colors: ['Teal cover'],
    specs: [
      { label: 'Color', value: 'Teal cover' },
      { label: 'Pages', value: '420' },
      { label: 'Format', value: 'Paperback' },
    ],
  },
  // Test products with varying variant prices for minPrice/maxPrice filtering
  {
    name: 'Premium Smartphone Pro',
    slug: 'premium-smartphone-pro',
    description:
      'High-end smartphone with multiple storage and color options. Prices vary by configuration.',
    price: 899.99, // This will be set to minPrice (699.99) after variants are created
    stock: 0, // Stock is managed per variant
    images: ['https://via.placeholder.com/500x500?text=Smartphone'],
    categorySlug: 'electronics',
    isActive: true,
    variants: [
      {
        sku: 'SKU-PSP-128-BLK',
        price: 699.99, // MIN price
        stock: 15,
        image: 'https://via.placeholder.com/500x500?text=Smartphone+Black',
        options: {
          storage: '128GB',
          color: 'Black',
        },
      },
      {
        sku: 'SKU-PSP-256-BLK',
        price: 799.99,
        stock: 10,
        image: 'https://via.placeholder.com/500x500?text=Smartphone+Black',
        options: {
          storage: '256GB',
          color: 'Black',
        },
      },
      {
        sku: 'SKU-PSP-512-BLK',
        price: 999.99,
        stock: 5,
        image: 'https://via.placeholder.com/500x500?text=Smartphone+Black',
        options: {
          storage: '512GB',
          color: 'Black',
        },
      },
      {
        sku: 'SKU-PSP-1TB-BLK',
        price: 1199.99, // MAX price
        stock: 3,
        image: 'https://via.placeholder.com/500x500?text=Smartphone+Black',
        options: {
          storage: '1TB',
          color: 'Black',
        },
      },
    ],
    specs: [
      { label: 'Price Range', value: '$699.99 - $1,199.99' },
      { label: 'Storage', value: '128GB to 1TB' },
      { label: 'Color', value: 'Black' },
    ],
  },
  {
    name: 'Gaming Console Bundle',
    slug: 'gaming-console-bundle',
    description:
      'Gaming console with different bundle options. Each bundle includes different accessories.',
    price: 399.99,
    stock: 0,
    images: ['https://via.placeholder.com/500x500?text=Gaming+Console'],
    categorySlug: 'electronics',
    isActive: true,
    variants: [
      {
        sku: 'SKU-GCB-BASE',
        price: 299.99, // MIN price - base console only
        stock: 20,
        image: 'https://via.placeholder.com/500x500?text=Console+Base',
        options: {
          bundle: 'Console Only',
        },
      },
      {
        sku: 'SKU-GCB-STANDARD',
        price: 399.99, // Standard bundle
        stock: 15,
        image: 'https://via.placeholder.com/500x500?text=Console+Standard',
        options: {
          bundle: 'Console + 1 Controller',
        },
      },
      {
        sku: 'SKU-GCB-DELUXE',
        price: 499.99, // Deluxe bundle
        stock: 10,
        image: 'https://via.placeholder.com/500x500?text=Console+Deluxe',
        options: {
          bundle: 'Console + 2 Controllers + Game',
        },
      },
      {
        sku: 'SKU-GCB-ULTIMATE',
        price: 649.99, // MAX price - ultimate bundle
        stock: 5,
        image: 'https://via.placeholder.com/500x500?text=Console+Ultimate',
        options: {
          bundle: 'Console + 2 Controllers + 3 Games + Accessories',
        },
      },
    ],
    specs: [
      { label: 'Price Range', value: '$299.99 - $649.99' },
      { label: 'Bundles', value: '4 different bundle options' },
    ],
  },
  {
    name: 'Laptop Workstation',
    slug: 'laptop-workstation',
    description:
      'Professional laptop with different RAM and storage configurations. Prices increase with higher specs.',
    price: 1299.99,
    stock: 0,
    images: ['https://via.placeholder.com/500x500?text=Laptop'],
    categorySlug: 'electronics',
    isActive: true,
    variants: [
      {
        sku: 'SKU-LW-16-512',
        price: 999.99, // MIN price - base model
        stock: 12,
        image: 'https://via.placeholder.com/500x500?text=Laptop+Base',
        options: {
          ram: '16GB',
          storage: '512GB SSD',
        },
      },
      {
        sku: 'SKU-LW-32-1TB',
        price: 1299.99, // Mid-range
        stock: 8,
        image: 'https://via.placeholder.com/500x500?text=Laptop+Mid',
        options: {
          ram: '32GB',
          storage: '1TB SSD',
        },
      },
      {
        sku: 'SKU-LW-64-2TB',
        price: 1799.99, // MAX price - high-end
        stock: 4,
        image: 'https://via.placeholder.com/500x500?text=Laptop+High',
        options: {
          ram: '64GB',
          storage: '2TB SSD',
        },
      },
    ],
    specs: [
      { label: 'Price Range', value: '$999.99 - $1,799.99' },
      { label: 'RAM Options', value: '16GB, 32GB, 64GB' },
      { label: 'Storage Options', value: '512GB, 1TB, 2TB SSD' },
    ],
  },
];
