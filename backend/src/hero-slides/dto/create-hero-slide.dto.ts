import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsDateString,
  IsArray,
  ValidateNested,
  IsNumber,
  Min,
  Max,
  MaxLength,
  IsUrl,
  ValidateIf,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  HeroSlideType,
  MediaKind,
  LandscapeTheme,
} from '@prisma/client';

// Base media DTO
class MediaDto {
  @IsEnum(MediaKind)
  kind!: MediaKind;

  @ValidateIf((o) => o.kind === MediaKind.PRODUCT)
  @IsString()
  @IsOptional()
  productSlug?: string;

  @ValidateIf((o) => o.kind === MediaKind.IMAGE)
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ValidateIf((o) => o.kind === MediaKind.VIDEO)
  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  alt?: string;

  @IsIn(['center', 'top', 'bottom', 'left', 'right'])
  @IsOptional()
  position?: string;

  @IsIn(['landscape', 'default'])
  @IsOptional()
  aspect?: string;
}

// CTA DTO
class CtaDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  label!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  href!: string;
}

// Type-specific data DTOs
class ProductSpotlightDataDto {
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Object)
  features?: Array<{
    iconName?: string;
    text: string;
  }>;
}

class OfferDataDto {
  @IsString()
  @IsNotEmpty()
  offerLabel!: string;

  @IsDateString()
  offerEndsAt!: string;

  @IsString()
  @IsOptional()
  promoCode?: string;
}

class TestimonialDataDto {
  @IsString()
  @IsNotEmpty()
  quote!: string;

  @IsString()
  @IsNotEmpty()
  authorName!: string;

  @IsNumber()
  @Min(0)
  @Max(5)
  rating!: number;

  @IsArray()
  @IsOptional()
  stats?: Array<{
    label: string;
    value: string;
  }>;
}

class LandscapeImageContentDto {
  @IsString()
  @IsNotEmpty()
  badge!: string;

  @IsString()
  @IsNotEmpty()
  headline!: string;

  @IsString()
  @IsNotEmpty()
  highlight!: string;

  @IsString()
  @IsNotEmpty()
  description!: string;
}

class LandscapeImageDataDto {
  @IsEnum(LandscapeTheme)
  theme!: LandscapeTheme;

  @ValidateNested()
  @Type(() => LandscapeImageContentDto)
  content!: LandscapeImageContentDto;

  @ValidateNested()
  @Type(() => CtaDto)
  actionButton!: CtaDto;
}

class CategorySpotlightDataDto {
  @IsString()
  @IsNotEmpty()
  categorySlug!: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  categoryBullets?: string[];
}

class EditorsPickDataDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  productSlugs!: string[];

  @IsString()
  @IsOptional()
  editorNote?: string;
}

class ComparisonPointDto {
  @IsString()
  @IsNotEmpty()
  label!: string;

  @IsString()
  @IsNotEmpty()
  leftValue!: string;

  @IsString()
  @IsNotEmpty()
  rightValue!: string;
}

class ComparisonBattleDataDto {
  @IsString()
  @IsNotEmpty()
  leftProductSlug!: string;

  @IsString()
  @IsNotEmpty()
  rightProductSlug!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ComparisonPointDto)
  comparisonPoints!: ComparisonPointDto[];
}

class CustomColorsDto {
  @IsString()
  @IsOptional()
  bg?: string;

  @IsString()
  @IsOptional()
  text?: string;
}

class PromotionDataDto {
  @IsString()
  @IsNotEmpty()
  promotionId!: string;

  @ValidateNested()
  @Type(() => CustomColorsDto)
  @IsOptional()
  customColors?: CustomColorsDto;
}

export class CreateHeroSlideDto {
  @IsEnum(HeroSlideType)
  type!: HeroSlideType;

  @IsInt()
  @Min(0)
  priority!: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  startsAt?: string;

  @IsDateString()
  @IsOptional()
  endsAt?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  badgeText?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  headline!: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  highlight?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  description!: string;

  @ValidateNested()
  @Type(() => CtaDto)
  ctaPrimary!: CtaDto;

  @ValidateNested()
  @Type(() => MediaDto)
  media!: MediaDto;

  @IsString()
  @IsOptional()
  promotionId?: string;

  // Type-specific data validation
  @ValidateIf((o) => o.type === HeroSlideType.PRODUCT_SPOTLIGHT)
  @ValidateNested()
  @Type(() => ProductSpotlightDataDto)
  @IsOptional()
  productSpotlightData?: ProductSpotlightDataDto;

  @ValidateIf((o) => o.type === HeroSlideType.OFFER)
  @ValidateNested()
  @Type(() => OfferDataDto)
  @IsOptional()
  offerData?: OfferDataDto;

  @ValidateIf((o) => o.type === HeroSlideType.TESTIMONIAL)
  @ValidateNested()
  @Type(() => TestimonialDataDto)
  @IsOptional()
  testimonialData?: TestimonialDataDto;

  @ValidateIf((o) => o.type === HeroSlideType.LANDSCAPE_IMAGE)
  @ValidateNested()
  @Type(() => LandscapeImageDataDto)
  @IsOptional()
  landscapeImageData?: LandscapeImageDataDto;

  @ValidateIf((o) => o.type === HeroSlideType.CATEGORY_SPOTLIGHT)
  @ValidateNested()
  @Type(() => CategorySpotlightDataDto)
  @IsOptional()
  categorySpotlightData?: CategorySpotlightDataDto;

  @ValidateIf((o) => o.type === HeroSlideType.EDITORS_PICK)
  @ValidateNested()
  @Type(() => EditorsPickDataDto)
  @IsOptional()
  editorsPickData?: EditorsPickDataDto;

  @ValidateIf((o) => o.type === HeroSlideType.COMPARISON_BATTLE)
  @ValidateNested()
  @Type(() => ComparisonBattleDataDto)
  @IsOptional()
  comparisonBattleData?: ComparisonBattleDataDto;

  @ValidateIf((o) => o.type === HeroSlideType.PROMOTION)
  @ValidateNested()
  @Type(() => PromotionDataDto)
  @IsOptional()
  promotionData?: PromotionDataDto;
}
