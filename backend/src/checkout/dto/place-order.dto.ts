import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum ShippingOption {
  PICKUP = 'pickup',
  BEIRUT = 'beirut',
  OUTSIDE = 'outside',
}

export class ShippingAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  lastName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  phone!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  email?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  country!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  street1!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  postalCode!: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  notes?: string;
}

export class PlaceOrderDto {
  @IsEnum(ShippingOption)
  shippingOption!: ShippingOption;

  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shippingAddress!: ShippingAddressDto;
}
