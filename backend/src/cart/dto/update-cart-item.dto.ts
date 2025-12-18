import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class UpdateCartItemDto {
  @IsInt()
  @Type(() => Number)
  @Min(1)
  quantity!: number;
}
