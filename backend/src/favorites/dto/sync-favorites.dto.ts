import { ArrayMaxSize, IsArray, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class SyncFavoritesDto {
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : []))
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(500, { message: 'Cannot sync more than 500 favorites at once' })
  productIds: string[] = [];
}
