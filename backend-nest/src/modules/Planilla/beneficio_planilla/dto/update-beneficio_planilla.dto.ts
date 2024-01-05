import { PartialType } from '@nestjs/mapped-types';
import { CreateBeneficioPlanillaDto } from './create-beneficio_planilla.dto';

export class UpdateBeneficioPlanillaDto extends PartialType(CreateBeneficioPlanillaDto) {}
