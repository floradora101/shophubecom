import { NotFoundException } from '@nestjs/common';

export class CouponNotFoundException extends NotFoundException {
  constructor(message = 'Coupon not found') {
    super(message);
  }
}
