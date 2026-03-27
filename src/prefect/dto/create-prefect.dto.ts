import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
} from 'class-validator';
import { LibraryStatus, SelectionStatus, YesNo } from '@prisma/client';

export class CreatePrefectDto {
  @IsString()
  fullNameEn: string;

  @IsOptional()
  @IsString()
  fullNameSi?: string;

  @IsOptional()
  @IsString()
  addressEn?: string;

  @IsOptional()
  @IsString()
  addressSi?: string;

  @IsOptional()
  @IsString()
  gradeEn?: string;

  @IsOptional()
  @IsString()
  gradeSi?: string;

  @IsOptional()
  @IsDateString()
  entranceDay?: string;

  @IsOptional()
  @IsString()
  entranceNo?: string;

  @IsOptional()
  @IsNumber()
  firstTermMarks?: number;

  @IsOptional()
  @IsNumber()
  secondTermMarks?: number;

  @IsOptional()
  @IsNumber()
  thirdTermMarks?: number;

  @IsOptional()
  @IsNumber()
  absentDaysCount?: number;

  @IsOptional()
  isPrefect?: YesNo;

  @IsOptional()
  @IsArray()
  isPrefectYears?: number[];

  @IsOptional()
  @IsBoolean()
  studentAgreement?: boolean;

  @IsOptional()
  @IsString()
  parentsNameEn?: string;

  @IsOptional()
  @IsEnum(LibraryStatus)
  libraryStatus?: LibraryStatus;

  @IsOptional()
  @IsString()
  specialNoteEn?: string;

  @IsOptional()
  @IsBoolean()
  teachersAgreement?: boolean;

  @IsOptional()
  @IsString()
  teachersAgreementFile?: string;

  @IsOptional()
  @IsString()
  regNo?: string;

  @IsOptional()
  @IsNumber()
  marks?: number;

  @IsOptional()
  @IsEnum(SelectionStatus)
  status?: SelectionStatus;

  @IsOptional()
  @IsDateString()
  date?: string;
}
