import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PrismaService } from '../database/prisma.service';
import type { AuthenticatedRequest } from './current-thug';

@Injectable()
export class EntraAuthGuard implements CanActivate {
  private verificationKeys?: ReturnType<
    typeof import('jose')['createRemoteJWKSet']
  >;

  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext) {
    const tenantId = process.env.ENTRA_TENANT_ID;
    const audience = process.env.ENTRA_API_AUDIENCE;
    const requiredScope = process.env.ENTRA_API_SCOPE;

    if (!tenantId || !audience || !requiredScope) {
      throw new ServiceUnavailableException(
        'Entra authentication is not configured.',
      );
    }

    const request = context.switchToHttp().getRequest<Request>();
    const token = this.bearerToken(request.headers.authorization);
    const issuer = `https://login.microsoftonline.com/${tenantId}/v2.0`;
    const { createRemoteJWKSet, jwtVerify } = await import('jose');

    this.verificationKeys ??= createRemoteJWKSet(
      new URL(
        `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
      ),
    );

    let objectId: string;

    try {
      const { payload } = await jwtVerify(token, this.verificationKeys, {
        issuer,
        audience,
      });

      if (typeof payload.oid !== 'string') {
        throw new Error('Token has no object ID.');
      }

      if (
        typeof payload.scp !== 'string' ||
        !payload.scp.split(' ').includes(requiredScope)
      ) {
        throw new Error('Token does not grant the required scope.');
      }

      objectId = payload.oid;
    } catch {
      throw new UnauthorizedException('The access token is invalid.');
    }

    const thug = await this.prisma.thug.findUnique({
      where: { entraObjectId: objectId },
      select: { id: true, firstName: true, displayName: true },
    });

    if (!thug) {
      throw new ForbiddenException('This account is not a Thug.');
    }

    (request as AuthenticatedRequest).thug = thug;
    return true;
  }

  private bearerToken(authorization: string | undefined) {
    const [scheme, token] = authorization?.split(' ') ?? [];

    if (scheme !== 'Bearer' || !token) {
      throw new UnauthorizedException('A bearer token is required.');
    }

    return token;
  }
}
