import { PartialType } from '@nestjs/mapped-types';
import { IsString, IsOptional, Allow } from 'class-validator';
import { CreatePromotionDto } from './create-promotion.dto';

export class UpdatePromotionDto extends PartialType(CreatePromotionDto) {
  /** Optional hero slide image URL; explicitly whitelisted for ValidationPipe. */
  @Allow()
  @IsOptional()
  @IsString()
  heroImageUrl?: string;
}
