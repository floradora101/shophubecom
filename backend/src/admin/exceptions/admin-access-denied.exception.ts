import { ForbiddenException } from '@nestjs/common';

export class AdminAccessDeniedException extends ForbiddenException {
  constructor(message = 'Admin access required') {
    super(message);
  }
}

