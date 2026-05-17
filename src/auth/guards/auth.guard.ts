import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeaderOrCookies(request);

    if (!token) {
      throw new UnauthorizedException('Authentication required');
    }

    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        role: string;
      }>(token, {
        secret: process.env.JWT_SECRET || 'super-secret-default-key',
      });
      // 💡 We're assigning the payload to the request object here
      // so that we can access it in our route handlers
      (request as Request & { user: { sub: string; role: string } }).user =
        payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    return true;
  }

  private extractTokenFromHeaderOrCookies(
    request: Request,
  ): string | undefined {
    const cookies = (request.cookies || {}) as Record<
      string,
      string | undefined
    >;
    let token: string | undefined = cookies.accessToken;
    if (!token) {
      const [type, authHeaderToken] =
        request.headers.authorization?.split(' ') ?? [];
      token = type === 'Bearer' ? authHeaderToken : undefined;
    }
    return token;
  }
}
