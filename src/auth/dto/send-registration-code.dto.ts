import { IsEmail } from 'class-validator';

export class SendRegistrationCodeDto {
  @IsEmail()
  email: string;
}
