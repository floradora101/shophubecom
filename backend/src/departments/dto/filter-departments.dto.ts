import { IsBoolean, IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FilterDepartmentsDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  page = 1;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  limit = 20;

  @IsString()
  @IsOptional()
  @IsIn(['name', 'createdAt'])
  sortBy: 'name' | 'createdAt' = 'createdAt';

  @IsString()
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder: 'asc' | 'desc' = 'desc';
}

