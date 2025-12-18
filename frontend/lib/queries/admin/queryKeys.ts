export const adminQueryKeys = {
  categories: {
    all: ["admin", "categories"] as const,
    lists: () => ["admin", "categories", "list"] as const,
    list: (params?: {
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: "name" | "createdAt";
      sortOrder?: "asc" | "desc";
    }) => ["admin", "categories", "list", params] as const,
    detail: (id: string) => ["admin", "categories", "detail", id] as const,
    // Special query for loading all categories (for dropdowns, parent lookup, etc.)
    allCategories: () => ["admin", "categories", "all"] as const,
  },
  products: {
    all: ["admin", "products"] as const,
    lists: () => ["admin", "products", "list"] as const,
    list: (params?: {
      search?: string;
      categoryId?: string;
      page?: number;
      limit?: number;
      sortBy?: "name" | "price" | "createdAt";
      sortOrder?: "asc" | "desc";
    }) => ["admin", "products", "list", params] as const,
    detail: (id: string) => ["admin", "products", "detail", id] as const,
    // Special query for loading all products (for dropdowns, promotions, etc.)
    allProducts: () => ["admin", "products", "all"] as const,
  },
  orders: {
    all: ["admin", "orders"] as const,
    lists: () => ["admin", "orders", "list"] as const,
    list: (params?: {
      search?: string;
      status?: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
      paymentStatus?: "PENDING" | "AUTHORIZED" | "PAID" | "FAILED" | "REFUNDED";
      fulfillmentStatus?: "UNFULFILLED" | "PARTIAL" | "FULFILLED" | "RETURNED";
      userId?: string;
      startDate?: string;
      endDate?: string;
      page?: number;
      limit?: number;
    }) => ["admin", "orders", "list", params] as const,
    detail: (id: string) => ["admin", "orders", "detail", id] as const,
  },
} as const;
