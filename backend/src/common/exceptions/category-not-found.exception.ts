import { NotFoundException } from '@nestjs/common';

export class CategoryNotFoundException extends NotFoundException {
  constructor(message = 'Category not found') {
    super(message);
  }
}
