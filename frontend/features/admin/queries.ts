import { useQuery } from "@tanstack/react-query";
import { adminApi } from "./api";
import { adminKeys } from "./query-keys";

export function useAdminStatsQuery(params?: { lowStockThreshold?: number }) {
  return useQuery({
    queryKey: adminKeys.stats(params),
    queryFn: () => adminApi.getStats(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useRecentOrdersQuery(params?: { limit?: number }) {
  return useQuery({
    queryKey: adminKeys.recentOrders(params),
    queryFn: () => adminApi.getRecentOrders(params),
    staleTime: 60 * 1000, // 1 minute
  });
}

export function useLowStockProductsQuery(params?: { threshold?: number; limit?: number }) {
  return useQuery({
    queryKey: adminKeys.lowStock(params),
    queryFn: () => adminApi.getLowStockProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useTopProductsQuery(params?: { limit?: number; sortBy?: "sales" | "revenue" }) {
  return useQuery({
    queryKey: adminKeys.topProducts(params),
    queryFn: () => adminApi.getTopProducts(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useSalesDataQuery(params?: { days?: number }) {
  return useQuery({
    queryKey: adminKeys.salesData(params),
    queryFn: () => adminApi.getSalesData(params),
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}
