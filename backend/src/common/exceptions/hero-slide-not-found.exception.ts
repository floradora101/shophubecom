import { NotFoundException } from '@nestjs/common';

export class HeroSlideNotFoundException extends NotFoundException {
  constructor(message = 'Hero slide not found') {
    super(message);
  }
}
