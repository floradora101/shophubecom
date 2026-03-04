import {
  IsEnum,
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { AnnouncementIconType } from '@prisma/client';

export class UpdateAnnouncementDto {
  @IsString()
  @IsOptional()
  @MaxLength(500)
  text?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  highlight?: string;

  @IsEnum(AnnouncementIconType)
  @IsOptional()
  icon?: AnnouncementIconType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;
}
