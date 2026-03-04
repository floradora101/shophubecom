import { NotFoundException } from '@nestjs/common';

export class DepartmentNotFoundException extends NotFoundException {
  constructor(message = 'Department not found') {
    super(message);
  }
}

