import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOrderItemDto {
  @IsString()
  @IsNotEmpty()
  variantId!: string;

  @IsInt()
  @IsPositive()
  @Type(() => Number)
  quantity!: number;
}
