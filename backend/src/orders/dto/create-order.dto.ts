import {
  IsArray,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreateOrderItemDto } from './order-item.dto';
import { OrderAddressDto } from './order-address.dto';

export class CreateOrderDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items!: CreateOrderItemDto[];

  @ValidateNested()
  @Type(() => OrderAddressDto)
  shippingAddress!: OrderAddressDto;

  @ValidateNested()
  @Type(() => OrderAddressDto)
  @IsOptional()
  billingAddress?: OrderAddressDto;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  shipping?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  tax?: number;

  @IsNumber()
  @Min(0)
  @Type(() => Number)
  @IsOptional()
  discount?: number;

  @IsString()
  @IsOptional()
  @MaxLength(8)
  currency?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}
