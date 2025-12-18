import { BadRequestException } from '@nestjs/common';

export class InvalidResetTokenException extends BadRequestException {
  constructor(message = 'Invalid or expired reset token') {
    super(message);
  }
}
