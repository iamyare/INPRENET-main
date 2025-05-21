import { IsNotEmpty, IsOptional, IsString, IsNumber } from 'class-validator';

export class CancelarContratoDto {
  @IsOptional()
  @IsString()
  n_identificacion?: string;

  @IsOptional()
  @IsNumber()
  id_contrato?: number;

  @IsNotEmpty()
  @IsString()
  motivo_cancelacion: string;
}
