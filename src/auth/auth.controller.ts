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

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // check NODE_ENV instead of NODE_env
  sameSite: 'lax' as const, // Use lax to prevent cross-port fetching issues for cookies on localhost
};

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
    const userAgent = req.headers['user-agent'] || 'unknown';

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
    const userAgent = req.headers['user-agent'] || 'unknown';

    const cookies = (req.cookies || {}) as Record<string, string | undefined>;
    // Read the refresh token from cookies instead of the body
    const oldRefreshToken = cookies.refreshToken;
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

    return { message: 'Token refreshed successfully' };
  }

  @HttpCode(HttpStatus.OK)
  @Get('me')
  async getMe(@Req() req: Request) {
    const cookies = (req.cookies || {}) as Record<string, string | undefined>;
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
    const cookies = (req.cookies || {}) as Record<string, string | undefined>;
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
