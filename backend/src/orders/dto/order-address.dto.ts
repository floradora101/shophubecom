import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class OrderAddressDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  fullName!: string;

  @IsString()
  @IsOptional()
  @MaxLength(32)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  label?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  street1!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  street2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  city!: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  state?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  postalCode!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  country!: string;
}
