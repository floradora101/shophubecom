import { NotFoundException } from '@nestjs/common';

export class HeroSlideNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Hero slide with ID "${id}" not found`);
  }
}
