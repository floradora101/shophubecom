import type { Product, ProductVariant } from "./product.types";

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

// Carousel types are imported from carousel.types.ts
export type {
  CarouselType,
  CarouselSlide,
  Carousel,
  CustomBanner,
} from "./carousel.types";

export type AdminPage =
  | "dashboard"
  | "products"
  | "categories"
  | "orders"
  | "carousels"
  | "banners"
  | "variants";
