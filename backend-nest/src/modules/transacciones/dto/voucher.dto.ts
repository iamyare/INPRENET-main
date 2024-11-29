import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CrearMovimientoDTO {
  @IsNotEmpty()
  @IsString()
  numeroCuenta: string;

  @IsNotEmpty()
  @IsNumber()
  monto: number;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsNotEmpty()
  @IsString()
  tipoMovimientoDescripcion: string;

  @IsNotEmpty()
  @IsNumber()
  ANO: number;

  @IsNotEmpty()
  @IsNumber()
  MES: number;
}
