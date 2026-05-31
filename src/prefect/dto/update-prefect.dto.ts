import { PartialType } from '@nestjs/mapped-types';
import { CreatePrefectDto } from './create-prefect.dto';

export class UpdatePrefectDto extends PartialType(CreatePrefectDto) {}
