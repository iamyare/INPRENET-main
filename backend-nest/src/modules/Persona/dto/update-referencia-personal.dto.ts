import { PartialType } from '@nestjs/mapped-types';
import { CreateReferenciaPersonalDTO } from './create-referencia.dto ';

export class UpdateReferenciaPersonalDTO extends PartialType(CreateReferenciaPersonalDTO) {}
