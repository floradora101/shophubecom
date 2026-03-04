import {
  Allow,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for filtering products in GET /products endpoint.
 *
 * All filters are optional. When not provided, default behavior is:
 * - Returns all active products (for non-admin users)
 * - Sorted by createdAt descending (newest first)
 * - Paginated with page 1, 20 items per page
 *
 * VALIDATION:
 * - All string query params are automatically transformed to appropriate types
 * - Price values must be non-negative numbers
 * - Page and limit must be positive integers (>= 1)
 * - sortBy must be one of: 'price', 'name', 'createdAt'
 * - sortOrder must be 'asc' or 'desc'
 *
 * @see backend/src/products/products.service.ts:findAll() for filtering implementation
 */
export class FilterProductsDto {
  /**
   * Filter by category ID.
   * Includes products from the specified category AND all its subcategories (recursively).
   * For example, filtering by "Electronics" will also include products from "Smartphones", "Laptops", etc.
   */
  @IsOptional()
  @Transform(({ value }): string | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return value as string;
  })
  @IsString()
  categoryId?: string;

  /**
   * Minimum price filter (>= 0).
   * Query param is automatically transformed from string to number.
   * Empty strings are converted to undefined.
   */
  @IsOptional()
  @Transform(({ value }): number | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'minPrice must be a valid number' },
  )
  @Min(0, { message: 'minPrice must be greater than or equal to 0' })
  minPrice?: number;

  /**
   * Maximum price filter (>= 0).
   * Query param is automatically transformed from string to number.
   * Empty strings are converted to undefined.
   */
  @IsOptional()
  @Transform(({ value }): number | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  })
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'maxPrice must be a valid number' },
  )
  @Min(0, { message: 'maxPrice must be greater than or equal to 0' })
  maxPrice?: number;

  /** Search query - case-insensitive search in product name and description */
  @IsOptional()
  @Transform(({ value }): string | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return typeof value === 'string'
      ? value.trim().slice(0, 200) || undefined
      : (value as string);
  })
  @IsString()
  @MaxLength(200, { message: 'Search query must not exceed 200 characters' })
  search?: string;

  /**
   * Filter to show only in-stock products.
   * Query param accepts: "true"/"false", "1"/"0", true/false
   * When true, returns only products with effectiveStock > 0
   * (for products with variants: SUM(variants.stock) > 0, else product.stock > 0)
   */
  @IsOptional()
  @Transform(({ value }): boolean | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    if (typeof value === 'boolean') {
      return value;
    }
    if (typeof value === 'string') {
      const lower = value.toLowerCase().trim();
      if (lower === 'true' || lower === '1') {
        return true;
      }
      if (lower === 'false' || lower === '0') {
        return false;
      }
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    return undefined;
  })
  @IsBoolean({ message: 'inStockOnly must be a boolean value' })
  inStockOnly?: boolean;

  /** Page number for pagination (default: 1, min: 1) */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return 1;
    }
    const num = Number(value);
    return isNaN(num) || num < 1 ? 1 : num;
  })
  @IsInt()
  @Min(1)
  page = 1;

  /** Items per page (default: 20, min: 1, max: 100) */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return 20;
    }
    const num = Number(value);
    return isNaN(num) || num < 1 ? 20 : Math.min(num, 100);
  })
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;

  /** Sort field: 'price' | 'name' | 'createdAt' (default: 'createdAt') */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return 'createdAt';
    }
    const validValues = ['price', 'name', 'createdAt'];
    return typeof value === 'string' && validValues.includes(value)
      ? value
      : 'createdAt';
  })
  @IsString()
  @IsIn(['price', 'name', 'createdAt'])
  sortBy: 'price' | 'name' | 'createdAt' = 'createdAt';

  /** Sort order: 'asc' | 'desc' (default: 'desc') */
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') {
      return 'desc';
    }
    const validValues = ['asc', 'desc'];
    return typeof value === 'string' && validValues.includes(value)
      ? value
      : 'desc';
  })
  @IsString()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';

  /**
   * Filter by promotion ID.
   * When set, returns only products that are part of this promotion (via PromotionProduct).
   * Used by hero promotion slide "Shop Now" to show only that promotion's products.
   */
  @Allow()
  @IsOptional()
  @Transform(({ value }): string | undefined => {
    if (value === undefined || value === null || value === '') {
      return undefined;
    }
    return value as string;
  })
  @IsString()
  promotionId?: string;
}
