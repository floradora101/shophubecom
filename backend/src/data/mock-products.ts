// Mock product data for seeding the database
// This file contains sample products organized by category

export interface MockProduct {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categorySlug: string; // Will be mapped to categoryId in seed
  isActive?: boolean;
  isOnSale?: boolean;
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT';
  discountValue?: number;
  saleStartsAt?: Date;
  saleEndsAt?: Date;
  colors?: string[];
  specs?: Record<string, unknown>;
}

export const mockProducts: MockProduct[] = [
  // Electronics Products
  {
    name: 'Gaming Laptop Pro 2024',
    slug: 'gaming-laptop-pro-2024',
    description:
      'High-performance gaming laptop with RTX 4080, 32GB RAM, 1TB SSD. Perfect for gaming and professional work.',
    price: 2499.99,
    stock: 15,
    images: ['https://via.placeholder.com/500x500?text=Gaming+Laptop'],
    categorySlug: 'electronics',
    isActive: true,
    isOnSale: true,
    discountType: 'PERCENTAGE',
    discountValue: 17,
    saleStartsAt: new Date('2025-12-01'),
    saleEndsAt: new Date('2025-12-31'),
    colors: ['Black', 'Silver'],
    specs: {
      GPU: 'NVIDIA RTX 4080',
      Memory: '32GB DDR5',
      Storage: '1TB NVMe SSD',
      Display: '17.3" 4K 144Hz',
    },
  },
  {
    name: 'Wireless Bluetooth Headphones',
    slug: 'wireless-bluetooth-headphones',
    description:
      'Premium noise-cancelling headphones with 30-hour battery life and crystal-clear sound.',
    price: 199.99,
    stock: 50,
    images: ['https://via.placeholder.com/500x500?text=Headphones'],
    categorySlug: 'electronics',
    isActive: true,
    colors: ['Black', 'White', 'Navy'],
    specs: {
      Battery: 'Up to 30 hours',
      NoiseCanceling: 'Hybrid ANC',
      Connectivity: 'Bluetooth 5.3',
    },
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
    specs: {
      Battery: 'Up to 48 hours',
      WaterResistance: '50 meters',
      Display: 'Always-On Retina',
    },
  },
  {
    name: '4K Ultra HD TV 55"',
    slug: '4k-ultra-hd-tv-55',
    description: '55-inch 4K Smart TV with HDR10+ and built-in streaming apps.',
    price: 799.99,
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
    specs: {
      Resolution: '4K UHD with HDR10+',
      Size: '55"',
      SmartFeatures: 'Built-in streaming apps',
    },
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
    specs: {
      Battery: 'Up to 12 months',
      Tracking: '1600 DPI optical',
      Connectivity: 'Wireless 2.4GHz',
    },
  },
  {
    name: 'Mechanical Keyboard RGB',
    slug: 'mechanical-keyboard-rgb',
    description:
      'Full-size mechanical keyboard with RGB backlighting and Cherry MX switches.',
    price: 129.99,
    stock: 40,
    images: ['https://via.placeholder.com/500x500?text=Keyboard'],
    categorySlug: 'electronics',
    isActive: true,
    colors: ['Black'],
    specs: {
      Switches: 'Cherry MX Brown',
      Backlighting: 'RGB',
      Layout: 'Full-size 104 keys',
    },
  },
  {
    name: 'USB-C Hub 8-in-1',
    slug: 'usb-c-hub-8-in-1',
    description:
      'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader, and more.',
    price: 49.99,
    stock: 75,
    images: ['https://via.placeholder.com/500x500?text=USB+Hub'],
    categorySlug: 'electronics',
    isActive: true,
    colors: ['Silver', 'Space Gray'],
    specs: {
      Ports: '8-in-1',
      HDMI: '4K @ 60Hz',
      USB: 'USB 3.0 x 3',
    },
  },
  // Clothing Products
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
    specs: {
      Material: '100% cotton denim',
      Fit: 'Regular',
      Care: 'Machine washable',
    },
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
    specs: {
      Fabric: '100% breathable cotton',
      Pack: '3 shirts',
      Sizes: 'S, M, L, XL',
    },
  },
  {
    name: 'Running Shoes',
    slug: 'running-shoes',
    description:
      'Lightweight running shoes with cushioned sole and breathable mesh upper.',
    price: 129.99,
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
    specs: {
      Upper: 'Breathable mesh',
      Sole: 'Cushioned foam',
      Weight: 'Lightweight',
    },
  },
  {
    name: 'Winter Wool Coat',
    slug: 'winter-wool-coat',
    description:
      'Warm and stylish winter coat made from premium wool blend. Perfect for cold weather.',
    price: 199.99,
    stock: 25,
    images: ['https://via.placeholder.com/500x500?text=Wool+Coat'],
    categorySlug: 'clothing',
    isActive: true,
    colors: ['Black', 'Navy', 'Camel'],
    specs: {
      Material: '80% Wool, 20% Polyester',
      Lining: 'Fully lined',
      Length: 'Knee-length',
    },
  },
  {
    name: 'Athletic Shorts',
    slug: 'athletic-shorts',
    description:
      'Comfortable athletic shorts with moisture-wicking fabric and elastic waistband.',
    price: 34.99,
    stock: 90,
    images: ['https://via.placeholder.com/500x500?text=Athletic+Shorts'],
    categorySlug: 'clothing',
    isActive: true,
    colors: ['Black', 'Navy', 'Gray'],
    specs: {
      Fabric: 'Moisture-wicking',
      Fit: 'Regular fit',
      Pockets: '2 side pockets',
    },
  },
  // Home & Garden Products
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
    specs: {
      Capacity: '12 cups',
      Carafe: 'Double-wall thermal',
      Features: 'Programmable timer',
    },
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
    specs: {
      Quantity: 'Set of 3 plants',
      Care: 'Low maintenance',
      Pots: 'Included',
    },
  },
  {
    name: 'Smart LED Light Bulbs Pack',
    slug: 'smart-led-light-bulbs-pack',
    description:
      'Pack of 4 smart LED bulbs with color changing and app control. Works with Alexa and Google Home.',
    price: 59.99,
    stock: 50,
    images: ['https://via.placeholder.com/500x500?text=LED+Bulbs'],
    categorySlug: 'home-garden',
    isActive: true,
    colors: ['White'],
    specs: {
      Pack: '4 bulbs',
      Connectivity: 'Wi-Fi enabled',
      Compatibility: 'Alexa, Google Home',
    },
  },
  {
    name: 'Memory Foam Pillow',
    slug: 'memory-foam-pillow',
    description:
      'Ergonomic memory foam pillow that adapts to your head and neck for optimal support.',
    price: 44.99,
    stock: 65,
    images: ['https://via.placeholder.com/500x500?text=Pillow'],
    categorySlug: 'home-garden',
    isActive: true,
    colors: ['White'],
    specs: {
      Material: 'Memory foam',
      Size: 'Standard',
      Cover: 'Removable and washable',
    },
  },
  {
    name: 'Kitchen Knife Set',
    slug: 'kitchen-knife-set',
    description:
      'Professional 8-piece knife set with wooden block. High-quality stainless steel blades.',
    price: 149.99,
    stock: 20,
    images: ['https://via.placeholder.com/500x500?text=Knife+Set'],
    categorySlug: 'home-garden',
    isActive: true,
    colors: ['Silver'],
    specs: {
      Pieces: '8-piece set',
      Material: 'Stainless steel',
      Block: 'Wooden block included',
    },
  },
  // Sports & Outdoors Products
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
    specs: {
      Thickness: '8mm cushioned',
      Extras: 'Includes carrying strap',
      Material: 'Non-slip TPE',
    },
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
    specs: {
      Range: '2kg to 20kg adjustable',
      Grip: 'Knurled steel handles',
      Material: 'Cast iron plates',
    },
  },
  {
    name: 'Resistance Bands Set',
    slug: 'resistance-bands-set',
    description:
      'Set of 5 resistance bands with different resistance levels. Includes door anchor and workout guide.',
    price: 24.99,
    stock: 85,
    images: ['https://via.placeholder.com/500x500?text=Resistance+Bands'],
    categorySlug: 'sports-outdoors',
    isActive: true,
    colors: ['Assorted'],
    specs: {
      Bands: '5 different resistance levels',
      Accessories: 'Door anchor included',
      Guide: 'Workout guide included',
    },
  },
  {
    name: 'Water Bottle Insulated',
    slug: 'water-bottle-insulated',
    description:
      'Stainless steel insulated water bottle that keeps drinks cold for 24 hours or hot for 12 hours.',
    price: 29.99,
    stock: 100,
    images: ['https://via.placeholder.com/500x500?text=Water+Bottle'],
    categorySlug: 'sports-outdoors',
    isActive: true,
    colors: ['Black', 'White', 'Blue', 'Pink'],
    specs: {
      Capacity: '32oz (1L)',
      Insulation: 'Double-wall vacuum',
      Material: 'Stainless steel',
    },
  },
  {
    name: 'Camping Tent 4-Person',
    slug: 'camping-tent-4-person',
    description:
      'Spacious 4-person camping tent with rainfly and easy setup. Weather-resistant and durable.',
    price: 149.99,
    stock: 12,
    images: ['https://via.placeholder.com/500x500?text=Camping+Tent'],
    categorySlug: 'sports-outdoors',
    isActive: true,
    colors: ['Blue/Gray'],
    specs: {
      Capacity: '4-person',
      Setup: 'Easy 10-minute setup',
      Weather: 'Water-resistant',
    },
  },
  // Books Products
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
    specs: {
      Pages: '640',
      Format: 'Paperback',
      Language: 'English',
    },
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
    specs: {
      Pages: '420',
      Format: 'Paperback',
      Language: 'English',
    },
  },
  {
    name: 'Introduction to Machine Learning',
    slug: 'introduction-machine-learning',
    description:
      'A beginner-friendly guide to machine learning concepts and practical applications.',
    price: 54.99,
    stock: 30,
    images: ['https://via.placeholder.com/500x500?text=Book'],
    categorySlug: 'books',
    isActive: true,
    colors: ['Green cover'],
    specs: {
      Pages: '520',
      Format: 'Paperback',
      Language: 'English',
    },
  },
  {
    name: 'Database Design Fundamentals',
    slug: 'database-design-fundamentals',
    description:
      'Learn the fundamentals of database design, normalization, and SQL optimization.',
    price: 44.99,
    stock: 35,
    images: ['https://via.placeholder.com/500x500?text=Book'],
    categorySlug: 'books',
    isActive: true,
    colors: ['Orange cover'],
    specs: {
      Pages: '480',
      Format: 'Paperback',
      Language: 'English',
    },
  },
  {
    name: 'Clean Code: A Handbook',
    slug: 'clean-code-handbook',
    description:
      'A handbook of agile software craftsmanship with practical coding principles.',
    price: 47.99,
    stock: 50,
    images: ['https://via.placeholder.com/500x500?text=Book'],
    categorySlug: 'books',
    isActive: true,
    colors: ['Red cover'],
    specs: {
      Pages: '464',
      Format: 'Paperback',
      Language: 'English',
    },
  },
];
