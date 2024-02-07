import { PartialType } from '@nestjs/mapped-types';
import { CreateTipoPlanillaDto } from './create-tipo-planilla.dto';

export class UpdateTipoPlanillaDto extends PartialType(CreateTipoPlanillaDto) {}
