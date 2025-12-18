import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO for filtering categories in GET /categories endpoint.
 *
 * All filters are optional. When not provided, default behavior is:
 * - Returns all categories
 * - Sorted by name ascending (alphabetically)
 * - Paginated with page 1, 20 items per page
 *
 * VALIDATION:
 * - All string query params are automatically transformed to appropriate types
 * - Page and limit must be positive integers (>= 1)
 * - sortBy must be one of: 'name', 'createdAt'
 * - sortOrder must be 'asc' or 'desc'
 *
 * @see backend/src/categories/categories.service.ts:findAll() for filtering implementation
 */
export class FilterCategoriesDto {
  /** Search query - case-insensitive search in category name, slug, and description */
  @IsString()
  @IsOptional()
  search?: string;

  /** Page number for pagination (default: 1, min: 1) */
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  page = 1;

  /** Items per page (default: 20, min: 1) */
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  limit = 20;

  /** Sort field: 'name' | 'createdAt' (default: 'name') */
  @IsString()
  @IsOptional()
  @IsIn(['name', 'createdAt'])
  sortBy: 'name' | 'createdAt' = 'name';

  /** Sort order: 'asc' | 'desc' (default: 'asc') */
  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'asc';
}

