import { IsNotEmpty, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CrearPersonaDto } from './crear-persona.dto';

export class CrearFamiliaDto {
  @IsNotEmpty()
  @IsString()
  parentesco: string;

  @ValidateNested()
  @Type(() => CrearPersonaDto)
  persona_referencia: CrearPersonaDto;
}
