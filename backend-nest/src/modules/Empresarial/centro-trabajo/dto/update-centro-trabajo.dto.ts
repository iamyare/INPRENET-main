import { PartialType } from '@nestjs/mapped-types';
import { CreateCentroTrabajoDto } from './create-centro-trabajo.dto';

export class UpdateCentroTrabajoDto extends PartialType(CreateCentroTrabajoDto) {}
