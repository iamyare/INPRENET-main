import { PartialType } from '@nestjs/mapped-types';
import { CreateDiscapacidadDto } from './create-discapacidad.dto';

export class UpdateDiscapacidadDto extends PartialType(CreateDiscapacidadDto) {}
