import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum StudentMonitor {
  GIVEN = 'GIVEN',
  NOT_GIVEN = 'NOT_GIVEN',
}

class CreateSiblingDto {
  @IsString()
  nameEn: string;

  @IsOptional()
  @IsString()
  nameSi?: string;

  @IsOptional()
  @IsString()
  gradeEn?: string;

  @IsOptional()
  @IsString()
  gradeSi?: string;
}

export class CreateStudentDto {
  @IsString()
  fullNameWithSurnameEn: string;

  @IsOptional()
  @IsString()
  fullNameWithSurnameSi?: string;

  @IsOptional()
  @IsString()
  nameWithInitialsEn?: string;

  @IsOptional()
  @IsString()
  nameWithInitialsSi?: string;

  @IsOptional()
  @IsString()
  dob?: string;

  @IsOptional()
  @IsString()
  addressEn?: string;

  @IsOptional()
  @IsString()
  addressSi?: string;

  @IsOptional()
  @IsString()
  phone1?: string;

  @IsOptional()
  @IsString()
  phone2?: string;

  @IsOptional()
  @IsString()
  schoolEn?: string;

  @IsOptional()
  @IsString()
  schoolSi?: string;

  @IsOptional()
  @IsString()
  earlierSchoolEn?: string;

  @IsOptional()
  @IsString()
  earlierSchoolSi?: string;

  @IsOptional()
  @IsString()
  reasonForLeaveEn?: string;

  @IsOptional()
  @IsString()
  reasonForLeaveSi?: string;

  @IsOptional()
  @IsString()
  fatherFullNameEn?: string;

  @IsOptional()
  @IsString()
  fatherFullNameSi?: string;

  @IsOptional()
  @IsString()
  fatherJobEn?: string;

  @IsOptional()
  @IsString()
  fatherJobSi?: string;

  @IsOptional()
  @IsString()
  fatherJobAddressEn?: string;

  @IsOptional()
  @IsString()
  fatherJobAddressSi?: string;

  @IsOptional()
  @IsString()
  motherFullNameEn?: string;

  @IsOptional()
  @IsString()
  motherFullNameSi?: string;

  @IsOptional()
  @IsString()
  motherJobEn?: string;

  @IsOptional()
  @IsString()
  motherJobSi?: string;

  @IsOptional()
  @IsString()
  motherJobAddressEn?: string;

  @IsOptional()
  @IsString()
  motherJobAddressSi?: string;

  @IsOptional()
  @IsString()
  guardianFullNameEn?: string;

  @IsOptional()
  @IsString()
  guardianFullNameSi?: string;

  @IsOptional()
  @IsString()
  guardianJobEn?: string;

  @IsOptional()
  @IsString()
  guardianJobSi?: string;

  @IsOptional()
  @IsString()
  guardianJobAddressEn?: string;

  @IsOptional()
  @IsString()
  guardianJobAddressSi?: string;

  @IsOptional()
  @IsString()
  emergencyPersonNameEn?: string;

  @IsOptional()
  @IsString()
  emergencyPersonNameSi?: string;

  @IsOptional()
  @IsString()
  emergencyPersonAddressEn?: string;

  @IsOptional()
  @IsString()
  emergencyPersonAddressSi?: string;

  @IsOptional()
  @IsString()
  emergencyNumber?: string;

  @IsOptional()
  @IsBoolean()
  disabilities?: boolean;

  @IsOptional()
  @IsString()
  disabilityReasonEn?: string;

  @IsOptional()
  @IsString()
  disabilityReasonSi?: string;

  @IsOptional()
  @IsBoolean()
  medicated?: boolean;

  @IsOptional()
  @IsBoolean()
  earlierSchool?: boolean;

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
  houseEn?: string;

  @IsOptional()
  @IsString()
  houseSi?: string;

  @IsOptional()
  @IsString()
  gradeEn?: string;

  @IsOptional()
  @IsString()
  gradeSi?: string;

  @IsOptional()
  @IsEnum(StudentMonitor)
  studentActiveMonitor?: StudentMonitor;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSiblingDto)
  siblings?: CreateSiblingDto[];
}
