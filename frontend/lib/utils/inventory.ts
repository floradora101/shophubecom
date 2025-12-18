import type { Product } from "@/lib/types/product.types";

export const LOW_STOCK_THRESHOLD = 10;

export function getEffectiveStock(
  product: Product | null | undefined,
  variant?: { stock?: number | null }
): number {
  if (!product) return 0;
  if (variant && typeof variant.stock === "number") {
    return variant.stock;
  }
  if (product.variants?.length) {
    const total = product.variants.reduce((sum, v) => sum + (v.stock ?? 0), 0);
    return total;
  }
  return product.stock ?? 0;
}

export function orderByAvailability<T extends Product>(
  items: T[],
  comparator?: (a: T, b: T) => number
): T[] {
  const sorted = comparator ? [...items].sort(comparator) : [...items];
  const inStock: T[] = [];
  const outOfStock: T[] = [];

  for (const item of sorted) {
    const stock = getEffectiveStock(item);
    if (stock > 0) {
      inStock.push(item);
    } else {
      outOfStock.push(item);
    }
  }

  return [...inStock, ...outOfStock];
}
