import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * Query params for paginated promotions list.
 * Default: page 1, limit 50 (promotions list is typically small).
 */
export class FilterPromotionsDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 50;
}
