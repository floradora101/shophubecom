export const adminKeys = {
  all: ["admin"] as const,
  stats: (params?: any) => [...adminKeys.all, "stats", params] as const,
  recentOrders: (params?: any) => [...adminKeys.all, "recent-orders", params] as const,
  lowStock: (params?: any) => [...adminKeys.all, "low-stock", params] as const,
  topProducts: (params?: any) => [...adminKeys.all, "top-products", params] as const,
  salesData: (params?: any) => [...adminKeys.all, "sales-data", params] as const,
};
