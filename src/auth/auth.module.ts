import 'dotenv/config';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController, AuthMeController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PrismaModule } from '../prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters');
}

@Module({
  imports: [
    UsersModule,
    PrismaModule,
    JwtModule.register({
      global: true,
      secret: jwtSecret,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController, AuthMeController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
