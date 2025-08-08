import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { PUBLIC_OR_AUTH_KEY } from '../decorators/public-or-auth.decorator';

@Injectable()
export class ConditionalAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  handleRequest<TUser = any>(
    err: Error | null,
    user: any,
    info: any,
    context: ExecutionContext,
  ): TUser {
    const isPublicOrAuth = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_OR_AUTH_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If endpoint is marked as public or auth, allow both authenticated and unauthenticated access
    if (isPublicOrAuth) {
      // If there's no error but also no user, it means the request was unauthenticated
      if (!err && !user) {
        return user as TUser;
      }
      // If there's an error other than "no token provided", throw it
      if (err && err.message !== 'No auth token') {
        throw err;
      }
      // Return the user if available
      return user as TUser;
    }

    // For regular protected endpoints, handle normally
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user as TUser;
  }
}
