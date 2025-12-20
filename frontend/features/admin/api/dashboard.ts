import { apiClient } from "@/lib/api/client";
import type { BackendResponse } from "@/lib/types/api";
import type {
  AdminStats,
  SalesData,
  TopProduct,
  LowStockProduct,
} from "../types";

// Backend response types
interface BackendStatsResponse {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockItems: number;
  pendingOrders: number;
  processingOrders: number;
  shippedOrders: number;
  deliveredOrders: number;
}

interface BackendSalesDataResponse {
  date: string;
  sales: number;
  orders: number;
}

interface BackendTopProductResponse {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image?: string | null;
}

interface BackendLowStockProductResponse {
  id: string;
  name: string;
  stock: number;
  category: string;
  image?: string | null;
}

export const adminDashboardApi = {
  /**
   * Get dashboard statistics
   */
  async getStats(lowStockThreshold?: number): Promise<AdminStats> {
    const params = new URLSearchParams();
    if (lowStockThreshold !== undefined) {
      params.append("lowStockThreshold", lowStockThreshold.toString());
    }

    const response = await apiClient.get<BackendResponse<BackendStatsResponse>>(
      `/admin/stats${params.toString() ? `?${params.toString()}` : ""}`
    );

    return response.data.data;
  },

  /**
   * Get sales data for a specific number of days
   */
  async getSalesData(days: number = 30): Promise<SalesData[]> {
    const params = new URLSearchParams();
    params.append("days", days.toString());

    const response = await apiClient.get<
      BackendResponse<BackendSalesDataResponse[]>
    >(`/admin/sales-data?${params.toString()}`);

    return response.data.data;
  },

  /**
   * Get top products by revenue or sales
   */
  async getTopProducts(
    limit: number = 10,
    sortBy: "revenue" | "sales" = "revenue"
  ): Promise<TopProduct[]> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("sortBy", sortBy);

    const response = await apiClient.get<
      BackendResponse<BackendTopProductResponse[]>
    >(`/admin/products/top?${params.toString()}`);

    return response.data.data.map((product) => ({
      ...product,
      image: product.image ?? undefined,
    }));
  },

  /**
   * Get low stock products
   */
  async getLowStockProducts(
    limit: number = 20,
    threshold: number = 5
  ): Promise<LowStockProduct[]> {
    const params = new URLSearchParams();
    params.append("limit", limit.toString());
    params.append("threshold", threshold.toString());

    const response = await apiClient.get<
      BackendResponse<BackendLowStockProductResponse[]>
    >(`/admin/products/low-stock?${params.toString()}`);

    return response.data.data.map((product) => ({
      ...product,
      image: product.image ?? undefined,
    }));
  },
};
