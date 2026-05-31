import { IsOptional, IsString } from 'class-validator';

export class QueryNewsDto {
  @IsOptional()
  @IsString()
  topic?: string;

  @IsOptional()
  @IsString()
  page?: string;

  @IsOptional()
  @IsString()
  limit?: string;

  @IsOptional()
  @IsString()
  orderDir?: string;
}
