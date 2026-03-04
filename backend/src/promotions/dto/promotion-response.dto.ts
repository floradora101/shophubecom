import { DiscountType } from '@prisma/client';

export class PromotionResponseDto {
  id!: string;
  name!: string;
  description?: string | null;
  type!: DiscountType;
  value!: number;
  startsAt?: Date | null;
  expiresAt?: Date | null;
  isActive!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  productIds?: string[];
  categoryIds?: string[];
  heroSlideId?: string | null;
  heroImageUrl?: string | null;
}
