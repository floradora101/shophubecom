import {
  ArrayMaxSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class UpdateProductVariantDto {
  @IsString()
  @IsOptional()
  id?: string;

  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @IsOptional()
  @IsPositive()
  @Type(() => Number)
  price?: number;

  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  stock?: number;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : value,
  )
  @IsString()
  @IsUrl({ protocols: ['http', 'https'] })
  @MaxLength(2048)
  image?: string;

  @IsArray()
  @ArrayMaxSize(20)
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true }, { each: true })
  @MaxLength(2048, { each: true })
  @IsOptional()
  images?: string[];

  @IsOptional()
  @IsObject()
  options?: Record<string, string>;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(65535, { message: 'Description must not exceed 65535 characters' })
  description?: string;

  @IsString()
  @IsOptional()
  @Length(3, 3)
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isOnSale?: boolean;

  @IsIn(['PERCENTAGE', 'FIXED_AMOUNT'])
  @IsOptional()
  discountType?: 'PERCENTAGE' | 'FIXED_AMOUNT' | null;

  @ValidateIf((o) => o.discountType === 'PERCENTAGE')
  @Max(100, { message: 'Percentage discount cannot exceed 100%' })
  @IsNumber()
  @IsOptional()
  @IsPositive()
  discountValue?: number | null;

  @IsDateString()
  @IsOptional()
  saleStartsAt?: string | null;

  @IsDateString()
  @IsOptional()
  saleEndsAt?: string | null;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsOptional()
  @Transform(({ value }) => (value === null ? undefined : value))
  @IsString()
  @IsNotEmpty({ message: 'defaultVariantId cannot be an empty string' })
  defaultVariantId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateProductVariantDto)
  @IsOptional()
  variants?: UpdateProductVariantDto[];
}
