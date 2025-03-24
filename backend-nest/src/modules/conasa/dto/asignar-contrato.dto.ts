import { IsNotEmpty, IsNumber, IsString, IsDate, IsOptional, IsDateString } from 'class-validator';

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

  @IsString()
  @IsNotEmpty()
  observacion: string;
}
