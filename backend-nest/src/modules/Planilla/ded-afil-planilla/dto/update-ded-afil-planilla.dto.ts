import { PartialType } from '@nestjs/mapped-types';
import { CreateDedAfilPlanillaDto } from './create-ded-afil-planilla.dto';

export class UpdateDedAfilPlanillaDto extends PartialType(CreateDedAfilPlanillaDto) {}
