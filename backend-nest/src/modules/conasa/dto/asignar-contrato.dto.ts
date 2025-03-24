import { IsNotEmpty, IsNumber, IsString, IsOptional, IsDateString } from 'class-validator';

export class AsignarContratoDto {
  @IsNumber()
  @IsNotEmpty()
  idPersona: number;

  @IsNumber()
  @IsNotEmpty()
  idPlan: number;

  @IsString()
  @IsNotEmpty()
  lugarCobro: string;

  @IsOptional()
  @IsDateString()
  fechaInicioContrato: string;

  @IsOptional()
  @IsDateString()
  fechaCancelacionContrato?: string;

  @IsOptional()
  @IsString()
  observacion?: string;

  @IsOptional()
  @IsString()
  telefono_1?: string;

  @IsOptional()
  @IsString()
  telefono_2?: string;

  @IsOptional()
  @IsString()
  telefono_3?: string;

  @IsOptional()
  @IsString()
  correo_1?: string;

  @IsOptional()
  @IsString()
  direccionTrabajo?: string;

  @IsOptional()
  @IsString()
  empresa?: string;
}
