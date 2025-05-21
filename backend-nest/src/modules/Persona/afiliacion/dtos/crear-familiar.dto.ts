import { IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CrearPersonaDto } from './crear-persona.dto';

export class CrearFamiliaDto {
  @IsNotEmpty()
  @IsString()
  parentesco: string;

  @IsNotEmpty()
  @IsString()
  @IsOptional()
  trabaja?: string;

  @ValidateNested()
  @Type(() => CrearPersonaDto)
  persona_referencia: CrearPersonaDto;
}
