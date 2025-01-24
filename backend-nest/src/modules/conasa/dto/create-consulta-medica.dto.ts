import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Length, MaxLength } from 'class-validator';

export class CrearConsultaDto {
  @IsString()
  @IsNotEmpty({ message: 'El campo "dni" es obligatorio.' })
  @Length(13, 13, { message: 'El campo "dni" debe tener exactamente 13 caracteres.' })
  dni: string;

  @IsDateString({}, { message: 'El campo "fecha_consulta" debe tener un formato de fecha válido.' })
  @IsNotEmpty({ message: 'El campo "fecha_consulta" es obligatorio.' })
  fecha_consulta: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo "motivo_consulta" es obligatorio.' })
  @MaxLength(1000, { message: 'El campo "motivo_consulta" no debe exceder los 1000 caracteres.' })
  motivo_consulta: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo "tiempo_sintomas" es obligatorio.' })
  tiempo_sintomas: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo "tipo_atencion" es obligatorio.' })
  tipo_atencion: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo "triage" es obligatorio.' })
  triage: string;

  @IsString()
  @IsNotEmpty({ message: 'El campo "diagnostico_presuntivo" es obligatorio.' })
  @MaxLength(1000, { message: 'El campo "diagnostico_presuntivo" no debe exceder los 1000 caracteres.' })
  diagnostico_presuntivo: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'El campo "detalle_atencion" no debe exceder los 1000 caracteres.' })
  detalle_atencion?: string;

  @IsDateString({}, { message: 'El campo "fecha_cierre" debe tener un formato de fecha válido.' })
  @IsOptional()
  fecha_cierre?: string;

  @IsInt({ message: 'El campo "corrcaso" debe ser un número entero.' })
  @IsOptional()
  corrcaso?: number;
}
