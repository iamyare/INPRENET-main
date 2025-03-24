import { IsString, IsOptional, IsDateString } from 'class-validator';

export class NuevoFamiliarDTO {
  @IsString()
  primer_nombre: string;

  @IsOptional()
  @IsString()
  segundo_nombre?: string;

  @IsString()
  primer_apellido: string;

  @IsOptional()
  @IsString()
  segundo_apellido?: string;

  @IsString()
  dni: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsString()
  parentesco: string;
}