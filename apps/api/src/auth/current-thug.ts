import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

export type AuthenticatedThug = {
  id: number;
  firstName: string;
  displayName: string;
};

export type AuthenticatedRequest = Request & {
  thug: AuthenticatedThug;
};

export const CurrentThug = createParamDecorator(
  (_data: unknown, context: ExecutionContext): AuthenticatedThug =>
    context.switchToHttp().getRequest<AuthenticatedRequest>().thug,
);
