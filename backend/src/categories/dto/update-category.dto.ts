import {
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string | null;

  @IsOptional()
  @Transform(({ value }) =>
    value === '' || value === null ? undefined : value,
  )
  @IsString()
  @IsUrl({ protocols: ['http', 'https'] })
  @MaxLength(2048)
  image?: string | null;

  @IsString()
  @IsOptional()
  parentId?: string | null;
}
