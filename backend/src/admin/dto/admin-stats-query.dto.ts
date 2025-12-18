import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class AdminStatsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  lowStockThreshold?: number = 5;
}

