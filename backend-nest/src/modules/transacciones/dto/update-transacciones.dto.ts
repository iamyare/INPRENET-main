import { PartialType } from '@nestjs/mapped-types';
import { CreateTransaccionesDto } from './create-transacciones.dto';

export class UpdateTranssacionesDto extends PartialType(CreateTransaccionesDto) {}
