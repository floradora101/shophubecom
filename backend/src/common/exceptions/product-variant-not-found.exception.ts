import { NotFoundException } from '@nestjs/common';

export class ProductVariantNotFoundException extends NotFoundException {
  constructor(message = 'Product variant not found') {
    super(message);
  }
}
