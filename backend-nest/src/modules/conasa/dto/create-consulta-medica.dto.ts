import { IsDateString, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CrearConsultaDto {
  @IsString()
  @IsNotEmpty()
  n_identificacion: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_consulta: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  motivo_consulta: string;

  @IsString()
  @IsNotEmpty()
  tiempo_sintomas: string;

  @IsString()
  @IsNotEmpty()
  tipo_atencion: string;

  @IsString()
  @IsNotEmpty()
  triage: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  diagnostico_presuntivo: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  detalle_atencion: string;

  @IsDateString()
  @IsOptional()
  fecha_cierre: string;
}
