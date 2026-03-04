import {
  IsOptional,
  IsString,
  IsInt,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class FilterAnnouncementsDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isActive?: boolean;

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
  limit?: number = 20;

  @IsString()
  @IsOptional()
  sortBy?: 'priority' | 'createdAt' | 'updatedAt' = 'priority';

  @IsString()
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
