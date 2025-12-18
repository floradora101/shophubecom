import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddCartItemDto {
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @IsInt()
  @Type(() => Number)
  @Min(1)
  quantity = 1;
}
