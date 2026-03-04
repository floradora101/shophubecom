import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  Min,
  MaxLength,
  IsArray,
  Allow,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '@prisma/client';

export class CreatePromotionDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @IsEnum(DiscountType)
  type!: DiscountType;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  value!: number;

  @IsDateString()
  @IsOptional()
  startsAt?: string | null;

  @IsDateString()
  @IsOptional()
  expiresAt?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  productIds?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryIds?: string[];

  /** Optional hero slide image URL. When provided, a hero slide is created/updated using promotion name and description. */
  @Allow()
  @IsOptional()
  @IsString()
  heroImageUrl?: string;
}
