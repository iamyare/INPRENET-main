import { PartialType } from '@nestjs/mapped-types';
import { CreateP60RentaDto } from './create-p_60_renta.dto';

export class UpdateP60RentaDto extends PartialType(CreateP60RentaDto) {}