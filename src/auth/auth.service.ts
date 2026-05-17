import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import { randomBytes, createHash } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const role = dto.role || 'STUDENT';
    const isActive = role !== 'TEACHER'; // Teacher needs approval

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        fullName: dto.fullName,
        role,
        isActive,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...result } = user;
    return result;
  }

  async login(
    dto: LoginDto,
    ip: string,
    userAgent: string,
  ): Promise<{
    user: Omit<import('@prisma/client').User, 'passwordHash'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }
    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const result = await this.generateTokens(user.id, user.role, ip, userAgent);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
    };
  }

  async refresh(
    dto: RefreshDto,
    ip: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const hashedToken = this.hashToken(dto.refreshToken);

    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { tokenHash: hashedToken },
      include: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord.revokedAt ||
      tokenRecord.expiresAt < new Date() ||
      !tokenRecord.user.isActive
    ) {
      if (tokenRecord && !tokenRecord.revokedAt) {
        await this.prisma.refreshToken.update({
          where: { id: tokenRecord.id },
          data: { revokedAt: new Date(), revokedByIp: ip },
        });
      }
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { accessToken, refreshToken, tokenId } = await this.generateTokens(
      tokenRecord.userId,
      tokenRecord.user.role,
      ip,
      userAgent,
    );

    // Rotate the token: mark old as revoked and link the new one
    await this.prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: {
        revokedAt: new Date(),
        revokedByIp: ip,
        replacedById: tokenId,
      },
    });

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string, ip: string) {
    const hashed = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash: hashed, revokedAt: null },
      data: {
        revokedAt: new Date(),
        revokedByIp: ip,
      },
    });
    return { success: true };
  }

  async getMe(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync<{
        sub: string;
        role: string;
      }>(token);
      const user = await this.usersService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('User is inactive');
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash: _, ...result } = user;
      return result;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private async generateTokens(
    userId: string,
    role: string,
    ip: string,
    userAgent: string,
  ): Promise<{ accessToken: string; refreshToken: string; tokenId: string }> {
    const payload = { sub: userId, role };
    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshTokenPlain = randomBytes(32).toString('hex');
    const tokenHash = this.hashToken(refreshTokenPlain);

    // Store in DB
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    const newTokenRecord = await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash,
        expiresAt,
        createdByIp: ip,
        userAgent: userAgent,
      },
    });

    return {
      accessToken,
      refreshToken: refreshTokenPlain,
      tokenId: newTokenRecord.id,
    };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
