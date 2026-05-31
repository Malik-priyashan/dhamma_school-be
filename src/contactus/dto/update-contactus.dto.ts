import { ContactUsStatus } from '@prisma/client';
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdateContactUsDto {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  replyToUserId?: string;

  @IsOptional()
  @IsUUID()
  studentId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  studentIds?: string[];

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  message?: string;

  @IsOptional()
  @IsString()
  senderName?: string;

  @IsOptional()
  @IsEnum(ContactUsStatus)
  status?: ContactUsStatus;
}
