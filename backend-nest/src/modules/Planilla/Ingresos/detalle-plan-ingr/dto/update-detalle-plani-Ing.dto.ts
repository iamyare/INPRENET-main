import { PartialType } from '@nestjs/mapped-types';
import { CreateDetallePlanIngDto } from './create-detalle-plani-Ing.dto';

export class UpdateDetallePlanIngDto extends PartialType(CreateDetallePlanIngDto) { }
