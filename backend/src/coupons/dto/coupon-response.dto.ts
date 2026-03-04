import { DiscountType } from '@prisma/client';

export class CouponResponseDto {
  id!: string;
  code!: string;
  description!: string | null;
  type!: DiscountType;
  value!: number;
  minOrderTotal!: number | null;
  startsAt!: Date | null;
  expiresAt!: Date | null;
  usageLimit!: number | null;
  perUserLimit!: number | null;
  usedCount!: number;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
}
