import { ContactUsStatus } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateContactUsDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  replyToUserId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsNotEmpty()
  senderName!: string;

  @IsOptional()
  @IsEnum(ContactUsStatus)
  status?: ContactUsStatus;
}
