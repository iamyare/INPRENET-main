import { IsNotEmpty, IsString, IsNumber, ValidateNested, IsArray, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CrearPersonaDto } from './crear-persona.dto';
import { CrearDiscapacidadDto } from './crear-discapacidad.dto';

export class CrearBeneficiarioDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CrearPersonaDto)
  persona: CrearPersonaDto;

  @IsNotEmpty()
  @IsNumber()
  porcentaje: number;

  @IsOptional()
  @IsString()
  parentesco?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearDiscapacidadDto)
  discapacidades?: CrearDiscapacidadDto[];
}
