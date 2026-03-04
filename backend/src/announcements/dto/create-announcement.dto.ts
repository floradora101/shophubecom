import {
  IsEnum,
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
} from 'class-validator';
import { AnnouncementIconType } from '@prisma/client';

export class CreateAnnouncementDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  text!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  highlight!: string;

  @IsEnum(AnnouncementIconType)
  icon!: AnnouncementIconType;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  priority?: number;
}
