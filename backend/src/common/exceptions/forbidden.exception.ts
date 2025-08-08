import { HttpStatus } from '@nestjs/common';
import { AppException } from './app.exception';

export class ForbiddenException extends AppException {
  constructor(message = 'Access forbidden', details?: unknown) {
    super(message, HttpStatus.FORBIDDEN, 'FORBIDDEN', details);
  }
}
