import {
  IsEmail,
  IsString,
  MinLength,
  Matches,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { UserRole } from '@prisma/client';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[^A-Za-z0-9\s]).{8,}$/, {
    message: 'Password must include uppercase and lowercase letters, a number, and a symbol',
  })
  password: string;

  @IsString()
  @MinLength(32)
  verificationToken: string;

  @IsString()
  fullName: string;

  @IsOptional()
  @Transform(({ value }) => (value as string | undefined)?.toUpperCase())
  @IsEnum(UserRole)
  role?: UserRole;
}
