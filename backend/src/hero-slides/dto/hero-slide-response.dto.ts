import { HeroSlideType, MediaKind, LandscapeTheme } from '@prisma/client';

export interface MediaResponse {
  kind: MediaKind;
  productSlug?: string | null;
  imageUrl?: string | null;
  videoUrl?: string | null;
  alt?: string | null;
  position?: string | null;
  aspect?: string | null;
}

export interface CtaResponse {
  label: string;
  href: string;
}

export class HeroSlideResponseDto {
  id!: string;
  type!: HeroSlideType;
  priority!: number;
  isActive!: boolean;
  startsAt!: Date | null;
  endsAt!: Date | null;
  badgeText!: string | null;
  headline!: string;
  highlight!: string | null;
  description!: string;
  ctaPrimary!: CtaResponse;
  media!: MediaResponse;
  promotionId?: string | null;
  typeSpecificData!: any; // JSON data specific to slide type
  createdAt!: Date;
  updatedAt!: Date;
}
