import { apiGet, apiGetWithParams } from "@/lib/api/request";

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

export interface AdminOrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  customer: {
    id: string;
    name: string;
    email: string;
  };
}

export interface LowStockProduct {
  id: string;
  name: string;
  stock: number;
  category: string;
  image: string | null;
}

export interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image?: string;
}

export interface SalesData {
  date: string;
  sales: number;
  orders: number;
}

export const adminApi = {
  async getStats(params?: { lowStockThreshold?: number }): Promise<AdminStats> {
    return apiGetWithParams<AdminStats>("/admin/stats", params);
  },

  async getRecentOrders(params?: { limit?: number }): Promise<AdminOrderSummary[]> {
    return apiGetWithParams<AdminOrderSummary[]>("/admin/orders/recent", params);
  },

  async getLowStockProducts(params?: { threshold?: number; limit?: number }): Promise<LowStockProduct[]> {
    return apiGetWithParams<LowStockProduct[]>("/admin/products/low-stock", params);
  },

  async getTopProducts(params?: { limit?: number; sortBy?: "sales" | "revenue" }): Promise<TopProduct[]> {
    return apiGetWithParams<TopProduct[]>("/admin/products/top", params);
  },

  async getSalesData(params?: { days?: number }): Promise<SalesData[]> {
    return apiGetWithParams<SalesData[]>("/admin/sales-data", params);
  },
};
