import {
  IsOptional,
  IsString,
  IsInt,
  IsEnum,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { HeroSlideType } from '@prisma/client';

export class FilterHeroSlidesDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsEnum(HeroSlideType)
  @IsOptional()
  type?: HeroSlideType;

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

  @IsEnum(['priority', 'createdAt', 'updatedAt'])
  @IsOptional()
  sortBy?: 'priority' | 'createdAt' | 'updatedAt' = 'priority';

  @IsEnum(['asc', 'desc'])
  @IsOptional()
  sortOrder?: 'asc' | 'desc' = 'desc';
}
