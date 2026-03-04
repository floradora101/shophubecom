import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsDateString,
  IsInt,
  Min,
  Max,
  MaxLength,
  Matches,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DiscountType } from '@prisma/client';

export class CreateCouponDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  @Matches(/^[A-Z0-9_-]+$/, {
    message: 'Code must be uppercase alphanumeric, underscores, or hyphens',
  })
  code!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;

  @IsEnum(DiscountType)
  type!: DiscountType;

  @IsNumber()
  @Min(0.01)
  @Type(() => Number)
  value!: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  minOrderTotal?: number | null;

  @IsDateString()
  @IsOptional()
  startsAt?: string | null;

  @IsDateString()
  @IsOptional()
  expiresAt?: string | null;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  usageLimit?: number | null;

  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  perUserLimit?: number | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
