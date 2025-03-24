import { PartialType } from '@nestjs/mapped-types';
import { CentroTrabajoDTO } from './create-perfAfilCentTrabs.dto';

export class UpdatePerfCentTrabDto extends PartialType(CentroTrabajoDTO) {}
