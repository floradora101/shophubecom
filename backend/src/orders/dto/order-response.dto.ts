import { FulfillmentStatus, OrderStatus, PaymentStatus } from '@prisma/client';
import { OrderAddressDto } from './order-address.dto';

export class OrderItemOptionDto {
  name!: string;
  value!: string;
}

export class OrderVariantSummaryDto {
  id!: string;
  sku!: string;
  image?: string | null;
  options?: OrderItemOptionDto[];
}

export class OrderProductSummaryDto {
  id!: string;
  name!: string;
  slug!: string;
  images!: string[];
}

export class OrderItemResponseDto {
  id!: string;
  productId!: string;
  variantId!: string;
  quantity!: number;
  unitPrice!: number;
  total!: number;
  title!: string;
  attributes?: Record<string, unknown> | null;
  variant?: OrderVariantSummaryDto;
  product?: OrderProductSummaryDto;
}

export class OrderResponseDto {
  id!: string;
  orderNumber!: string;
  userId?: string | null;
  status!: OrderStatus;
  paymentStatus!: PaymentStatus;
  fulfillmentStatus!: FulfillmentStatus;
  subtotal!: number;
  tax!: number;
  shipping!: number;
  discount!: number;
  total!: number;
  currency!: string;
  shippingAddress!: OrderAddressDto;
  billingAddress?: OrderAddressDto | null;
  items!: OrderItemResponseDto[];
  placedAt!: Date;
  updatedAt!: Date;
  user?: {
    id: string;
    fullName: string;
    email: string;
  } | null;
}

export class PaginatedOrderResponseDto {
  data!: OrderResponseDto[];
  total!: number;
  page!: number;
  limit!: number;
}
