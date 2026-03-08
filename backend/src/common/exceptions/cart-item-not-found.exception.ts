import { NotFoundException } from '@nestjs/common';

export class CartItemNotFoundException extends NotFoundException {
  constructor(message = 'Cart item not found') {
    super(message);
  }
}
