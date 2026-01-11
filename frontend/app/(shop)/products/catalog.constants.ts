import {
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Gamepad2,
  Camera,
  Headphones,
  Monitor,
  Package,
  Layers,
  Zap,
  ShoppingBag,
} from "lucide-react";

// Boutique category icons carousel - lifestyle-focused selection
export const COMPACT_CATEGORY_ICONS = [
  {
    slug: "iphone",
    name: "iPhone",
    icon: Smartphone,
    color: "rose",
  },
  {
    slug: "samsung-phones",
    name: "Samsung",
    icon: Smartphone,
    color: "blue",
  },
  {
    slug: "apple-tablets",
    name: "iPad",
    icon: Tablet,
    color: "emerald",
  },
  {
    slug: "macbook",
    name: "MacBook",
    icon: Laptop,
    color: "orange",
  },
  {
    slug: "gaming-laptops",
    name: "Gaming",
    icon: Monitor,
    color: "violet",
  },
  {
    slug: "smart-watches",
    name: "Watches",
    icon: Watch,
    color: "amber",
  },
  {
    slug: "earphones",
    name: "Earphones",
    icon: Headphones,
    color: "rose",
  },
  {
    slug: "gaming-consoles",
    name: "Consoles",
    icon: Gamepad2,
    color: "cyan",
  },
  {
    slug: "smart-cameras",
    name: "Cameras",
    icon: Camera,
    color: "red",
  },
  {
    slug: "phone-cases",
    name: "Accessories",
    icon: ShoppingBag,
    color: "emerald",
  },
];

// Sort options for products catalog
export const SORT_OPTIONS = [
  { value: "latest", label: "Latest" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "name", label: "Name A-Z" },
] as const;

// Items per page for pagination
export const ITEMS_PER_PAGE = 10;
