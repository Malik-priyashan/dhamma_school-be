import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsArray,
  IsInt,
} from 'class-validator';
import { LibraryStatus, SelectionStatus } from '@prisma/client';

export class CreatePrefectDto {
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsDateString()
  entranceDay?: string;

  @IsOptional()
  @IsString()
  entranceNo?: string;

  @IsOptional()
  @IsString()
  firstTermPlace?: string;

  @IsOptional()
  @IsNumber()
  firstTermMarks?: number;

  @IsOptional()
  @IsString()
  secondTermPlace?: string;

  @IsOptional()
  @IsNumber()
  secondTermMarks?: number;

  @IsOptional()
  @IsString()
  thirdTermPlace?: string;

  @IsOptional()
  @IsNumber()
  thirdTermMarks?: number;

  @IsOptional()
  @IsInt()
  absentDaysCount?: number;

  @IsOptional()
  @IsBoolean()
  isPrefect?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  isPrefectYears?: number[];

  @IsOptional()
  @IsBoolean()
  isClassLeader?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  isClassLeaderYears?: number[];

  @IsOptional()
  @IsBoolean()
  participateForCompetitions?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  participateForCompetitionsYears?: number[];

  @IsOptional()
  @IsBoolean()
  isInAnnouncingClub?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  isInAnnouncingClubYears?: number[];

  @IsOptional()
  @IsBoolean()
  isOnStage?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  isOnStageYears?: number[];

  @IsOptional()
  @IsBoolean()
  participateToKatina?: boolean;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  participateToKatinaYears?: number[];

  @IsOptional()
  @IsInt()
  poyaDayCount?: number;

  @IsOptional()
  @IsString()
  teachersConfirmFile?: string;

  @IsOptional()
  @IsBoolean()
  studentAgreement?: boolean;

  @IsOptional()
  @IsString()
  parentsName?: string;

  @IsOptional()
  @IsBoolean()
  parentsAgreement?: boolean;

  @IsOptional()
  @IsEnum(LibraryStatus)
  libraryStatus?: LibraryStatus;

  @IsOptional()
  @IsString()
  libraryStatusConfirmationFile?: string;

  @IsOptional()
  @IsString()
  specialNote?: string;

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
