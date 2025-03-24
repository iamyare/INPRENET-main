import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CrearOtraFuenteIngresoDto {
  @IsNotEmpty()
  @IsString()
  actividad_economica: string;

  @IsOptional()
  @IsString()
  monto_ingreso?: string;

  @IsOptional()
  @IsString()
  observacion?: string;
}
