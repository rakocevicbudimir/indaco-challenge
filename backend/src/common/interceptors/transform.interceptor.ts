import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        message: 'Success',
        data,
        error: null,
      })),
      catchError((error) => {
        // If it's already an HTTP exception, use its properties
        if (error instanceof HttpException) {
          const response = error.getResponse() as {
            message?: string;
            code?: string;
            details?: unknown;
          };

          throw new HttpException(
            {
              message: response.message || error.message,
              data: null,
              error: {
                code: response.code || this.getCodeFromStatus(error.getStatus()),
                details: response.details || error.message,
              },
            },
            error.getStatus(),
          );
        }

        // For unknown errors, wrap them in an InternalServerErrorException
        const internalError = new InternalServerErrorException({
          message: 'Internal server error',
          data: null,
          error: {
            code: 'INTERNAL_SERVER_ERROR',
            details: error.message || 'An unexpected error occurred',
          },
        });

        throw internalError;
      }),
    );
  }

  private getCodeFromStatus(status: number): string {
    const statusCodes = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      429: 'TOO_MANY_REQUESTS',
      500: 'INTERNAL_SERVER_ERROR',
    };

    return statusCodes[status] || 'UNKNOWN_ERROR';
  }
}
