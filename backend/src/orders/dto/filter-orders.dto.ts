import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { FulfillmentStatus, OrderStatus, PaymentStatus } from '@prisma/client';

export class FilterOrdersDto {
  @IsEnum(OrderStatus)
  @IsOptional()
  status?: OrderStatus;

  @IsEnum(PaymentStatus)
  @IsOptional()
  paymentStatus?: PaymentStatus;

  @IsEnum(FulfillmentStatus)
  @IsOptional()
  fulfillmentStatus?: FulfillmentStatus;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  page = 1;

  @IsInt()
  @Type(() => Number)
  @IsOptional()
  @Min(1)
  @Max(100)
  limit = 20;
}

export class AdminFilterOrdersDto extends FilterOrdersDto {
  @IsString()
  @IsOptional()
  search?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
