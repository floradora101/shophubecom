import { ProductVariantOptions } from '../../products/dto';

export class CartItemVariantDto {
  id!: string;
  sku!: string;
  price!: number;
  stock!: number;
  image?: string | null;
  images?: string[];
  options?: ProductVariantOptions;
}

export class CartItemProductDto {
  id!: string;
  name!: string;
  slug!: string;
  price!: number;
  currency!: string;
}

export class CartItemResponseDto {
  id!: string;
  cartId!: string;
  productId!: string;
  variantId!: string | null;
  quantity!: number;
  unitPrice!: number;
  product?: CartItemProductDto;
  variant?: CartItemVariantDto;
}

export class CartResponseDto {
  id!: string;
  userId!: string | null;
  items!: CartItemResponseDto[];
  subtotal!: number;
  totalQuantity!: number;
  createdAt!: Date;
  updatedAt!: Date;
}
