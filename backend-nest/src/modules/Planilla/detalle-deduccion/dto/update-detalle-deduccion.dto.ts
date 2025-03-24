import { PartialType } from '@nestjs/mapped-types';
import { CreateDetalleDeduccionDto } from './create-detalle-deduccion.dto';

export class UpdateDetalleDeduccionDto extends PartialType(CreateDetalleDeduccionDto) {}
