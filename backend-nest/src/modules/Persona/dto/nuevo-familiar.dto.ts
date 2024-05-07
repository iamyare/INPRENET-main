import { IsString, IsOptional, IsDateString } from 'class-validator';

export class NuevoFamiliarDTO {
  @IsString()
  primerNombre: string;

  @IsOptional()
  @IsString()
  segundoNombre?: string;

  @IsString()
  primerApellido: string;

  @IsOptional()
  @IsString()
  segundoApellido?: string;

  @IsString()
  dni: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsString()
  parentesco: string;
}