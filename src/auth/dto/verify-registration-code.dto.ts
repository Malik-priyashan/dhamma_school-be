import { IsEmail, IsString, Matches } from 'class-validator';

export class VerifyRegistrationCodeDto {
  @IsEmail()
  email: string;

  @IsString()
  @Matches(/^\d{6}$/, { message: 'Enter a six-digit code' })
  code: string;
}
