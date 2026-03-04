import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import { extractResponseData } from "@/lib/api/response-transformer";

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
    const response = await apiClient.get<BackendResponse<AdminStats>>("/admin/stats", { params });
    return extractResponseData(response);
  },

  async getRecentOrders(params?: { limit?: number }): Promise<AdminOrderSummary[]> {
    const response = await apiClient.get<BackendResponse<AdminOrderSummary[]>>("/admin/orders/recent", { params });
    return extractResponseData(response);
  },

  async getLowStockProducts(params?: { threshold?: number; limit?: number }): Promise<LowStockProduct[]> {
    const response = await apiClient.get<BackendResponse<LowStockProduct[]>>("/admin/products/low-stock", { params });
    return extractResponseData(response);
  },

  async getTopProducts(params?: { limit?: number; sortBy?: "sales" | "revenue" }): Promise<TopProduct[]> {
    const response = await apiClient.get<BackendResponse<TopProduct[]>>("/admin/products/top", { params });
    return extractResponseData(response);
  },

  async getSalesData(params?: { days?: number }): Promise<SalesData[]> {
    const response = await apiClient.get<BackendResponse<SalesData[]>>("/admin/sales-data", { params });
    return extractResponseData(response);
  },
};
