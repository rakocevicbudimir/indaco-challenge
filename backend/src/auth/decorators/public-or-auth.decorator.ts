import { SetMetadata } from '@nestjs/common';

export const PUBLIC_OR_AUTH_KEY = 'publicOrAuth';
export const PublicOrAuth = () => SetMetadata(PUBLIC_OR_AUTH_KEY, true);
