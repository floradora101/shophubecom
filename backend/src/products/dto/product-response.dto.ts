import { CategoryResponseDto } from '../../categories/dto';

export type ProductVariantOptions = Record<string, string>;
export type ProductDiscountType = 'PERCENTAGE' | 'FIXED_AMOUNT';

export class ProductVariantDto {
  id!: string;
  sku!: string;
  price!: number;
  stock!: number;
  image?: string | null;
  images!: string[];
  options?: ProductVariantOptions;
}

export class DefaultVariantDto {
  id!: string;
  image?: string | null;
  images!: string[];
}

export class ProductResponseDto {
  id!: string;
  name!: string;
  slug!: string;
  description!: string | null;
  price!: number;
  currency!: string;
  stock!: number;
  isActive!: boolean;
  defaultVariantId?: string | null;
  defaultVariant?: DefaultVariantDto | null;
  isOnSale?: boolean;
  discountType?: ProductDiscountType | null;
  discountValue?: number | null;
  saleStartsAt?: Date | null;
  saleEndsAt?: Date | null;
  categoryId!: string | null;
  category?: CategoryResponseDto | null;
  variants?: ProductVariantDto[];
  // Price range fields for products with multiple variant prices
  minPrice?: number;
  maxPrice?: number;
  createdAt!: Date;
  updatedAt!: Date;
}
