import { PartialType } from '@nestjs/mapped-types';
import { NetPersonaDTO } from './create-persona.dto';

export class UpdatePersonaDto extends PartialType(NetPersonaDTO) {}
