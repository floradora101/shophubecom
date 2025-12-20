// Admin API - consolidated from multiple admin-*.ts files
export * from "./api/products";
export * from "./api/categories";
export * from "./api/orders";
export * from "./api/dashboard";

// Re-export types for convenience
export type {
  CreateProductPayload,
  UpdateProductPayload,
} from "./api/products";
export type {
  CreateCategoryPayload,
  UpdateCategoryPayload,
} from "./api/categories";
export type { UpdateOrderStatusPayload } from "./api/orders";
