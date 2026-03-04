import {
  IsNumber,
  IsString,
  IsNotEmpty,
  IsOptional,
  Min,
  MaxLength,
  IsEmail,
} from 'class-validator';
import { Transform } from 'class-transformer';

/**
 * DTO for validating a coupon at checkout.
 * Used by POST /api/coupons/validate (public endpoint).
 *
 * guestEmail: When provided for guest checkout, enforces perUserLimit by counting
 * orders with this email. Pass from checkout form when available for accurate limit enforcement.
 */
export class ValidateCouponDto {
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  code!: string;

  @IsNumber()
  @Min(0, { message: 'Subtotal must be a non-negative number' })
  @Transform(({ value }) => {
    const num = Number(value);
    return isNaN(num) ? 0 : num;
  })
  subtotal!: number;

  @IsOptional()
  @IsEmail()
  @MaxLength(320)
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() || undefined : undefined,
  )
  guestEmail?: string;
}
