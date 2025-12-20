import type { Product, ProductVariant } from "@/features/products/types";

export interface AdminStats {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockItems: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image?: string;
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  category: string;
  image?: string;
}

export interface AdminOrder {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productSlug: string;
  productImage?: string;
  quantity: number;
  price: number;
}

export interface OrderAddress {
  id: string;
  name: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
}

export interface OrderStatusHistory {
  status: string;
  timestamp: string;
  note?: string;
}

export interface FullOrderDetail {
  id: string;
  orderNumber: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  address: OrderAddress;
  items: OrderItem[];
  statusHistory?: OrderStatusHistory[];
}

export type AdminProduct = Product;

export interface AdminProductVariant extends ProductVariant {
  id?: string;
}

// Carousel types
export interface CarouselType {
  id: string;
  name: string;
  slug: string;
  description?: string;
  backgroundColor?: string; // For hero carousel background color
  textColor?: string; // For hero carousel text color
}

export interface CarouselSlide {
  id: string;
  carouselTypeId: string;
  title: string;
  description?: string;
  image: string;
  ctaText?: string;
  ctaLink?: string;
  productId?: string;
  productSlug?: string;
  order: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  // For Offers/Promotional carousel
  badgeText?: string; // e.g., "Xmas Gifts", "Summer Sale"
  mainTitle?: string; // e.g., "Christmas Offer!"
  leftBackgroundColor?: string; // Left side background color
  rightBackgroundColor?: string; // Right side background color
  decorativeIcon?: string; // Emoji or icon (e.g., "🎅", "🎄")
  bundledItems?: string[]; // List of bundled/free items
  brandName?: string; // Override brand name extraction
}

export interface Carousel {
  id: string;
  type: CarouselType;
  slides: CarouselSlide[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CustomBanner {
  id: string;
  title: string;
  description?: string;
  image: string;
  link?: string;
  position: "top" | "middle" | "bottom" | "sidebar";
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AdminPage =
  | "dashboard"
  | "products"
  | "categories"
  | "orders"
  | "carousels"
  | "banners"
  | "variants";

