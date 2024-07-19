import { IsNotEmpty, IsString, IsNumber, ValidateNested, IsOptional } from 'class-validator';
import { CrearPersonaDto } from './crear-persona.dto';
import { Type } from 'class-transformer';

export class CrearPersonaReferenciaDto extends CrearPersonaDto {}

export class CrearReferenciaDto {
  @IsNotEmpty()
  @IsString()
  tipo_referencia: string;

  @IsNotEmpty()
  @IsString()
  parentesco: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CrearPersonaReferenciaDto)
  persona_referencia: CrearPersonaReferenciaDto;
}
