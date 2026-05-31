import {
  Controller,
  Post,
  Get,
  Body,
  HttpCode,
  HttpStatus,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

const isProduction = process.env.NODE_ENV === 'production';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? ('none' as const) : ('lax' as const),
  path: '/',
};

function isCookieRecord(x: unknown): x is Record<string, string | undefined> {
  return !!x && typeof x === 'object';
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(
    @Body() dto: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const uaHeader = req.headers['user-agent'];
    const userAgent = Array.isArray(uaHeader)
      ? uaHeader.join(' ')
      : typeof uaHeader === 'string'
        ? uaHeader
        : 'unknown';

    // Auth service returns the tokens
    const { user, accessToken, refreshToken } = await this.authService.login(
      dto,
      ip,
      userAgent,
    );

    // Set both tokens as HTTP-only cookies
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 mins
    });

    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return {
      message: 'Logged in successfully',
      user,
      accessToken,
      refreshToken,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const uaHeader2 = req.headers['user-agent'];
    const userAgent = Array.isArray(uaHeader2)
      ? uaHeader2.join(' ')
      : typeof uaHeader2 === 'string'
        ? uaHeader2
        : 'unknown';

    const cookiesRaw = (req.cookies ?? {}) as unknown;

    let cookies: Record<string, string | undefined>;
    if (isCookieRecord(cookiesRaw)) {
      cookies = cookiesRaw;
    } else {
      cookies = {};
    }
    // Read the refresh token from cookies; fall back to body if not present
    let oldRefreshToken = cookies.refreshToken;
    if (!oldRefreshToken) {
      // Support clients that send the refresh token in the request body
      // (e.g., mobile apps or cross-origin requests without cookies)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const body = (req as Request & { body?: unknown }).body;
      if (body && typeof body === 'object' && 'refreshToken' in body) {
        const maybe = (body as Record<string, unknown>)['refreshToken'];
        if (typeof maybe === 'string') {
          oldRefreshToken = maybe;
        }
      }
    }
    if (!oldRefreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const { accessToken, refreshToken } = await this.authService.refresh(
      { refreshToken: oldRefreshToken },
      ip,
      userAgent,
    );

    // Set the new rotated tokens as cookies
    res.cookie('accessToken', accessToken, {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie('refreshToken', refreshToken, {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Token refreshed successfully',
      accessToken,
      refreshToken,
    };
  }

  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getMe(@Req() req: Request) {
    const cookiesRaw = (req.cookies ?? {}) as unknown;

    let cookies: Record<string, string | undefined>;
    if (isCookieRecord(cookiesRaw)) {
      cookies = cookiesRaw;
    } else {
      cookies = {};
    }
    const token = cookies.accessToken;
    if (!token) {
      throw new UnauthorizedException('No token provided');
    }
    return this.authService.getMe(token);
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    const cookiesRaw = (req.cookies ?? {}) as unknown;

    let cookies: Record<string, string | undefined>;
    if (isCookieRecord(cookiesRaw)) {
      cookies = cookiesRaw;
    } else {
      cookies = {};
    }
    const refreshToken = cookies.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken, ip);
    }

    // Clear the cookies to safely log out the user
    res.clearCookie('accessToken', COOKIE_OPTIONS);
    res.clearCookie('refreshToken', COOKIE_OPTIONS);

    return { message: 'Logged out successfully' };
  }
}
