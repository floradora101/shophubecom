import { ConflictException } from '@nestjs/common';

export class UserAlreadyExistsException extends ConflictException {
  constructor(message = 'User with this email already exists') {
    super(message);
  }
}
