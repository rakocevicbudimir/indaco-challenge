import { HttpException, HttpStatus } from '@nestjs/common';
import { ApiResponse } from '../interfaces/api-response.interface';

export class AppException extends HttpException {
  constructor(
    message: string,
    status: HttpStatus = HttpStatus.BAD_REQUEST,
    code?: string,
    details?: unknown,
  ) {
    const response: ApiResponse = {
      message,
      data: null,
      error: {
        code: code || 'BAD_REQUEST',
        details: details || message,
      },
    };

    super(response, status);
  }
}
