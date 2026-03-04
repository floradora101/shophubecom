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
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateProductVariantDto {
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @IsNumber()
  @IsPositive()
  @Type(() => Number)
  price!: number;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  stock!: number;

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
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @IsOptional()
  @IsObject()
  options?: Record<string, string>;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;

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

  @IsNumber()
  @IsPositive()
  @IsOptional()
  discountValue?: number | null;

  @IsDateString()
  @IsOptional()
  saleStartsAt?: string | null;

  @IsDateString()
  @IsOptional()
  saleEndsAt?: string | null;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @IsOptional()
  @IsObject()
  @Type(() => Object)
  specs?: Record<string, string>; // Key-value pairs for product specifications

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants!: CreateProductVariantDto[]; // Required: at least 1 variant needed
}
