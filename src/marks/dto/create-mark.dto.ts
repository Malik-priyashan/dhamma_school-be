import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateMarkDto {
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @IsInt()
  @IsNotEmpty()
  year: number;

  @IsString()
  @IsOptional()
  teacherName?: string;

  @IsNumber()
  @IsOptional()
  term1Marks?: number;

  @IsNumber()
  @IsOptional()
  term2Marks?: number;

  @IsNumber()
  @IsOptional()
  term3Marks?: number;
}
