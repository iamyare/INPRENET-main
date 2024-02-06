import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleBeneficioDto } from './create-detalle_beneficio.dto';

export class UpdateDetalleBeneficioDto extends PartialType(CreateDetalleBeneficioDto) {}
