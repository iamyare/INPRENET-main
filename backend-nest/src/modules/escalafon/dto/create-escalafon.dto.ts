import { IsDecimal, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreateEscalafonDto {
  @IsNotEmpty()
  @IsString()
  DNI: string;

  @IsNotEmpty()
  @IsNumber()
  NUMERO_PRESTAMO: number;

  @IsNotEmpty()
  @IsDecimal({ decimal_digits: '1,2' })
  CUOTA: number;

  @IsNotEmpty()
  @IsNumber()
  ANIO: number;

  @IsNotEmpty()
  @IsNumber()
  MES: number;
}
