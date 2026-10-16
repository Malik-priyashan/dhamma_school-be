import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ServiceUnavailableException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshDto } from './dto/refresh.dto';
import {
  randomBytes,
  randomInt,
  createHash,
  createHmac,
  timingSafeEqual,
} from 'crypto';

type UserProfile = NonNullable<
  Awaited<ReturnType<UsersService['findProfileById']>>
>;

function mapUserProfile(user: UserProfile) {
  const loginAt = user.lastLoginAt;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    loginAt,
    lastLoginAt: loginAt,
    studentNames: user.students.map((student) => student.fullNameWithSurname),
    students: user.students,
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private codeDigest(email: string, code: string): string {
    const secret = process.env.EMAIL_VERIFICATION_SECRET;
    if (!secret || secret.length < 32) {
      throw new ServiceUnavailableException(
        'Email verification is not configured',
      );
    }
    return createHmac('sha256', secret)
      .update(`${email}:${code}`)
      .digest('hex');
  }

  async sendRegistrationCode(rawEmail: string) {
    const email = this.normalizeEmail(rawEmail);
    if (await this.usersService.findByEmail(email)) {
      throw new BadRequestException('Email already in use');
    }
    const now = new Date();
    const previous = await this.prisma.registrationEmailVerification.findUnique(
      { where: { email } },
    );
    if (previous && now.getTime() - previous.sentAt.getTime() < 60_000) {
      throw new HttpException(
        'Please wait one minute before requesting another code',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const code = randomInt(0, 1_000_000).toString().padStart(6, '0');
    const codeHash = this.codeDigest(email, code);
    const subject = 'Your Dhamma School verification code';
    const text = `Your Dhamma School verification code is ${code}. It expires in 10 minutes. If you did not request this code, you can ignore this email.`;
    const provider = (process.env.EMAIL_PROVIDER || 'resend')
      .trim()
      .toLowerCase();

    if (provider === 'gmail') {
      const gmailUser = process.env.GMAIL_USER?.trim();
      const gmailAppPassword = process.env.GMAIL_APP_PASSWORD?.replace(
        /\s/g,
        '',
      );
      if (!gmailUser || !gmailAppPassword) {
        throw new ServiceUnavailableException(
          'Gmail email verification is not configured',
        );
      }
      const gmailSmtpPort = process.env.GMAIL_SMTP_PORT === '587' ? 587 : 465;
      try {
        await nodemailer
          .createTransport({
            host: 'smtp.gmail.com',
            port: gmailSmtpPort,
            secure: gmailSmtpPort === 465,
            requireTLS: gmailSmtpPort === 587,
            auth: { user: gmailUser, pass: gmailAppPassword },
            connectionTimeout: 10_000,
            greetingTimeout: 10_000,
            socketTimeout: 15_000,
          })
          .sendMail({
            from: `Dhamma School <${gmailUser}>`,
            to: email,
            subject,
            text,
          });
      } catch {
        throw new ServiceUnavailableException(
          'Unable to send verification email. Please try again.',
        );
      }
    } else if (provider === 'resend') {
      const apiKey = process.env.RESEND_API_KEY;
      const from = process.env.RESEND_FROM_EMAIL;
      if (!apiKey || !from) {
        throw new ServiceUnavailableException(
          'Resend email verification is not configured',
        );
      }
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ from, to: [email], subject, text }),
      }).catch(() => null);
      if (!response?.ok) {
        throw new ServiceUnavailableException(
          'Unable to send verification email. Please try again.',
        );
      }
    } else {
      throw new ServiceUnavailableException(
        'Invalid email provider configuration',
      );
    }
    await this.prisma.registrationEmailVerification.upsert({
      where: { email },
      update: {
        codeHash,
        proofHash: null,
        verifiedAt: null,
        attempts: 0,
        sentAt: now,
        expiresAt: new Date(now.getTime() + 10 * 60_000),
      },
      create: {
        email,
        codeHash,
        sentAt: now,
        expiresAt: new Date(now.getTime() + 10 * 60_000),
      },
    });
    return { message: 'Verification code sent' };
  }

  async verifyRegistrationCode(rawEmail: string, code: string) {
    const email = this.normalizeEmail(rawEmail);
    const record = await this.prisma.registrationEmailVerification.findUnique({
      where: { email },
    });
    if (
      !record ||
      record.expiresAt <= new Date() ||
      record.attempts >= 5 ||
      record.verifiedAt
    ) {
      throw new BadRequestException(
        'Code expired or unavailable. Request a new code.',
      );
    }
    const actual = Buffer.from(this.codeDigest(email, code), 'hex');
    const expected = Buffer.from(record.codeHash, 'hex');
    if (
      actual.length !== expected.length ||
      !timingSafeEqual(actual, expected)
    ) {
      await this.prisma.registrationEmailVerification.updateMany({
        where: { email, codeHash: record.codeHash, verifiedAt: null },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException('Incorrect code. Please try again.');
    }
    const verificationToken = randomBytes(32).toString('base64url');
    const updated = await this.prisma.registrationEmailVerification.updateMany({
      where: {
        email,
        codeHash: record.codeHash,
        verifiedAt: null,
        expiresAt: { gt: new Date() },
        attempts: { lt: 5 },
      },
      data: {
        verifiedAt: new Date(),
        proofHash: createHash('sha256').update(verificationToken).digest('hex'),
      },
    });
    if (updated.count !== 1) {
      throw new BadRequestException(
        'Code expired or unavailable. Request a new code.',
      );
    }
    return { verificationToken };
  }

  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    if (await this.usersService.findByEmail(email)) {
      throw new BadRequestException('Email already in use');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);
    if (dto.role === 'ADMIN') {
      throw new BadRequestException('Invalid registration role');
    }
    const role = dto.role || 'STUDENT';
    const isActive = role !== 'TEACHER'; // Teacher needs approval
    const proofHash = createHash('sha256')
      .update(dto.verificationToken)
      .digest('hex');
    const user = await this.prisma.$transaction(async (tx) => {
      const consumed = await tx.registrationEmailVerification.deleteMany({
        where: {
          email,
          proofHash,
          verifiedAt: { not: null },
          expiresAt: { gt: new Date() },
        },
      });
      if (consumed.count !== 1) {
        throw new BadRequestException('Confirm your email before signing up');
      }
      return tx.user.create({
        data: { email, passwordHash, fullName: dto.fullName, role, isActive },
      });
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
    user: ReturnType<typeof mapUserProfile>;
    loginAt: Date | null;
    lastLoginAt: Date | null;
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

    const loginAt = new Date();
    const userProfile = await this.usersService.updateLastLoginAndFetchProfile(
      user.id,
      loginAt,
    );

    const result = await this.generateTokens(user.id, user.role, ip, userAgent);
    if (!userProfile) {
      throw new UnauthorizedException('User not found');
    }

    return {
      user: mapUserProfile(userProfile),
      loginAt: userProfile.lastLoginAt,
      lastLoginAt: userProfile.lastLoginAt,
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
      const user = await this.usersService.findProfileById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      if (!user.isActive) {
        throw new UnauthorizedException('User is inactive');
      }
      return mapUserProfile(user);
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
