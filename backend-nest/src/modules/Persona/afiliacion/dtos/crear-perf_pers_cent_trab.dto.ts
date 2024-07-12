import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class CrearPersonaCentroTrabajoDto {
  @IsNotEmpty()
  @IsNumber()
  id_centro_trabajo: number;

  @IsNotEmpty()
  @IsString()
  cargo: string;

  @IsOptional()
  @IsString()
  numero_acuerdo?: string;

  @IsOptional()
  @IsNumber()
  salario_base?: number;

  @IsNotEmpty()
  @IsDateString()
  fecha_ingreso: string;

  @IsOptional()
  @IsDateString()
  fecha_egreso?: string;

  @IsNotEmpty()
  @IsString()
  estado: string;

  @IsOptional()
  @IsString()
  tipo_jornada?: string;

  @IsOptional()
  @IsString()
  jornada?: string;
}
