import { PartialType } from '@nestjs/mapped-types';
import { CreateDeduccionDto } from './create-deduccion.dto';

export class UpdateDeduccionDto extends PartialType(CreateDeduccionDto) {}
