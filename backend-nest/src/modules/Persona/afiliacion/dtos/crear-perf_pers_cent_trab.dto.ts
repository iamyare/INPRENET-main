import { IsNotEmpty, IsString, IsNumber, IsDateString, IsOptional, Min, Max } from 'class-validator';

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

  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(31)
  fecha_pago?: number;

  @IsOptional()
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

  @IsOptional()
  @IsString()
  direccionCentro?: string;

  @IsOptional()
  @IsNumber()
  id_municipio?: number;
}
