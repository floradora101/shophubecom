import { NotFoundException } from '@nestjs/common';

export class AddressNotFoundException extends NotFoundException {
  constructor(message = 'Address not found') {
    super(message);
  }
}
