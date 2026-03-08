import { HttpException, HttpStatus } from '@nestjs/common';

export class AccountLockedException extends HttpException {
  constructor(lockedUntilMinutes?: number) {
    const message =
      lockedUntilMinutes != null
        ? `Account temporarily locked. Try again in ${lockedUntilMinutes} minutes.`
        : 'Account temporarily locked due to too many failed login attempts. Try again later.';
    super(message, HttpStatus.TOO_MANY_REQUESTS);
  }
}
