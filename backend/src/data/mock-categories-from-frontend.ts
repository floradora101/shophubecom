// Mock category data extracted from frontend/lib/data/mockCatalog.ts
// This ensures backend seed data matches frontend mock data exactly

export interface MockCategory {
  id: string; // Frontend ID (will be ignored, backend generates CUID)
  name: string;
  slug: string;
  description: string | null;
  parentId: string | null; // Frontend parent ID (will be mapped to backend parent ID)
}

export const mockCategoriesFromFrontend: MockCategory[] = [
  {
    id: 'cat-electronics',
    name: 'Electronics',
    slug: 'electronics',
    description: 'Latest electronics and gadgets',
    parentId: null,
  },
  {
    id: 'cat-phones',
    name: 'Phones',
    slug: 'phones',
    description: 'Smartphones and accessories',
    parentId: 'cat-electronics',
  },
  {
    id: 'cat-phones-honor',
    name: 'Honor',
    slug: 'phones-honor',
    description: 'Honor phones',
    parentId: 'cat-phones',
  },
  {
    id: 'cat-phones-apple',
    name: 'Apple',
    slug: 'phones-apple',
    description: 'Apple iPhones',
    parentId: 'cat-phones',
  },
  {
    id: 'cat-phones-samsung',
    name: 'Samsung',
    slug: 'phones-samsung',
    description: 'Samsung phones',
    parentId: 'cat-phones',
  },
  {
    id: 'cat-laptops',
    name: 'Laptops',
    slug: 'laptops',
    description: 'Notebooks, ultrabooks, and gaming laptops',
    parentId: 'cat-electronics',
  },
  {
    id: 'cat-clothing',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Fashion and apparel for everyone',
    parentId: null,
  },
  {
    id: 'cat-home-garden',
    name: 'Home & Garden',
    slug: 'home-garden',
    description: 'Everything for your home and garden',
    parentId: null,
  },
  {
    id: 'cat-sports-outdoors',
    name: 'Sports & Outdoors',
    slug: 'sports-outdoors',
    description: 'Sports equipment and outdoor gear',
    parentId: null,
  },
  {
    id: 'cat-books',
    name: 'Books',
    slug: 'books',
    description: 'Books for all ages and interests',
    parentId: null,
  },
];
