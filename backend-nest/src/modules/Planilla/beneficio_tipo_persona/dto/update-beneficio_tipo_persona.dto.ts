import { PartialType } from '@nestjs/mapped-types';
import { CreateBeneficioTipoPersonaDto } from './create-beneficio_tipo_persona.dto';

export class UpdateBeneficioTipoPersonaDto extends PartialType(CreateBeneficioTipoPersonaDto) { }
