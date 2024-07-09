import { IsNotEmpty, IsString, IsNumber, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { CrearPersonaDto } from './crear-persona.dto';

export class CrearBeneficiarioDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CrearPersonaDto)
  persona: CrearPersonaDto;
}
