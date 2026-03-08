import { NotFoundException } from '@nestjs/common';

export class PromotionNotFoundException extends NotFoundException {
  constructor(message = 'Promotion not found') {
    super(message);
  }
}
