import { Role } from './role.enum';

export interface JwtPayload {
  sub: number;
  email: string;
  roles: Role[];
}

export interface JwtUser {
  userId: number;
  email: string;
  roles: Role[];
}
