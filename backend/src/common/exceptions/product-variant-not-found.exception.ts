import { NotFoundException } from '@nestjs/common';

export class ProductVariantNotFoundException extends NotFoundException {
  constructor() {
    super('Product variant not found');
  }
}
