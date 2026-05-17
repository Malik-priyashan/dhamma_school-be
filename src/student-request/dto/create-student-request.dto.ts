import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

function normalizeYesNoBoolean(value: unknown) {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (normalized === 'yes') {
      return true;
    }

    if (normalized === 'no') {
      return false;
    }
  }

  return value;
}

export enum StudentMonitor {
  GIVEN = 'GIVEN',
  NOT_GIVEN = 'NOT_GIVEN',
}

export class CreateStudentRequestSiblingDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  grade?: string;
}

export class CreateStudentRequestDto {
  @IsString()
  fullNameWithSurname: string;

  @IsOptional()
  @IsString()
  nameWithInitials?: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone1?: string;

  @IsOptional()
  @IsString()
  phone2?: string;

  @IsOptional()
  @IsString()
  school?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeYesNoBoolean(value))
  @IsBoolean()
  earlierSchool?: boolean;

  @IsOptional()
  @IsString()
  earlierSchoolReason?: string;

  @IsOptional()
  @IsString()
  reasonForLeave?: string;

  @IsOptional()
  @IsString()
  fatherFullName?: string;

  @IsOptional()
  @IsString()
  fatherJob?: string;

  @IsOptional()
  @IsString()
  fatherJobAddress?: string;

  @IsOptional()
  @IsString()
  motherFullName?: string;

  @IsOptional()
  @IsString()
  motherJob?: string;

  @IsOptional()
  @IsString()
  motherJobAddress?: string;

  @IsOptional()
  @IsString()
  guardianFullName?: string;

  @IsOptional()
  @IsString()
  guardianJob?: string;

  @IsOptional()
  @IsString()
  guardianJobAddress?: string;

  @IsOptional()
  @IsString()
  emergencyPersonName?: string;

  @IsOptional()
  @IsString()
  emergencyPersonAddress?: string;

  @IsOptional()
  @IsString()
  emergencyNumber?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeYesNoBoolean(value))
  @IsBoolean()
  disabilities?: boolean;

  @IsOptional()
  @IsString()
  disabilityReason?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeYesNoBoolean(value))
  @IsBoolean()
  medicated?: boolean;

  @IsOptional()
  @IsString()
  medicine?: string;

  @IsOptional()
  @IsNumber()
  registrationPayment?: number;

  @IsOptional()
  @IsString()
  registrationDate?: string;

  @IsOptional()
  @Transform(({ value }) => normalizeYesNoBoolean(value))
  @IsBoolean()
  agreeToTerms?: boolean;

  @IsOptional()
  @IsString()
  indexNo?: string;

  @IsOptional()
  @IsString()
  libraryNo?: string;

  @IsOptional()
  @IsString()
  house?: string;

  @IsOptional()
  @IsString()
  grade?: string;

  @IsOptional()
  @IsEnum(StudentMonitor)
  studentActiveMonitor?: StudentMonitor;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateStudentRequestSiblingDto)
  siblings?: CreateStudentRequestSiblingDto[];

  @IsOptional()
  @IsString()
  studentImage?: string;
}
