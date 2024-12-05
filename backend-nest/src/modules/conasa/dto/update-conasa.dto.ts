import { PartialType } from '@nestjs/mapped-types';
import { CreateConasaDto } from './create-conasa.dto';

export class UpdateConasaDto extends PartialType(CreateConasaDto) {}
