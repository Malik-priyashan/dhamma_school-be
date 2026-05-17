import { PartialType } from '@nestjs/mapped-types';
import { CreateAnnouncingDto } from './create-announcing.dto';

export class UpdateAnnouncingDto extends PartialType(CreateAnnouncingDto) {}
