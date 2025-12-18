import { NotFoundException } from '@nestjs/common';

export class ProductNotFoundException extends NotFoundException {
  constructor(message = 'Product not found') {
    super(message);
  }
}

