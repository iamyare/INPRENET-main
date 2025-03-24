import { PartialType } from '@nestjs/mapped-types';
import { CreateProfesionDto } from './create-profesion.dto';

export class UpdateProfesionDto extends PartialType(CreateProfesionDto) {}
