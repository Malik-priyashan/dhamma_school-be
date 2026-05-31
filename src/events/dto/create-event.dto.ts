import { IsDateString, IsOptional, IsString } from 'class-validator';

export class CreateEventDto {
  @IsOptional()
  @IsString()
  image?: string;

  @IsString()
  topic!: string;

  @IsOptional()
  @IsString()
  topicSi?: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  descriptionSi?: string;

  @IsDateString()
  happenedDate!: string;
}
