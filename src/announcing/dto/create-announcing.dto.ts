import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SpecialTalentsDto {
  @IsOptional()
  announcing?: unknown;

  @IsOptional()
  dancing?: unknown;

  @IsOptional()
  kathika?: unknown;

  @IsOptional()
  padyagayana?: unknown;

  @IsOptional()
  debate?: unknown;

  @IsOptional()
  acting?: unknown;

  @IsOptional()
  singing?: unknown;

  @IsOptional()
  prefectOrClassLeader?: unknown;

  @IsOptional()
  committee?: unknown;

  @IsOptional()
  other?: unknown;
}

export class CreateAnnouncingDto {
  @IsString()
  fullNameWithSurname: string;

  @IsOptional()
  @IsString()
  birthday?: string | Date;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phoneLand?: string;

  @IsOptional()
  @IsString()
  phoneMobile?: string;

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @IsString()
  guardianName?: string;

  @IsOptional()
  @IsString()
  guardianAddress?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => SpecialTalentsDto)
  special?: SpecialTalentsDto;

  @IsOptional()
  @IsBoolean()
  studentAgreement?: boolean;

  @IsOptional()
  @IsNumber()
  marks?: number;

  @IsOptional()
  @IsString()
  status?: 'SELECTED' | 'NOT_SELECTED' | 'PENDING';
}
