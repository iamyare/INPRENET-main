import { Type } from "class-transformer";
import { ArrayNotEmpty, IsArray, IsDefined, IsInt, IsNotEmpty, IsNumber, IsString, Length, Min, ValidateNested } from "class-validator";

class PagoFallidoDto {
  @IsDefined({ message: 'El número de identificación es obligatorio.' })
  @IsString({ message: 'El número de identificación debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El número de identificación no puede estar vacío.' })
  @Length(13, 20, { message: 'El número de identificación debe tener entre 13 y 20 caracteres.' })
  numero_identificacion: string;

  @IsDefined({ message: 'El motivo de fallo es obligatorio.' })
  @IsString({ message: 'El motivo de fallo debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El motivo de fallo no puede estar vacío.' })
  @Length(3, 255, { message: 'El motivo de fallo debe tener entre 3 y 255 caracteres.' })
  motivo_fallo: string;
}

export class ResultadosPagosDto {
  @IsDefined({ message: 'El ID de planilla es obligatorio.' })
  @IsInt({ message: 'El ID de planilla debe ser un número entero.' })
  @Min(1, { message: 'El ID de planilla debe ser mayor a 0.' })
  id_planilla: number;

  @IsDefined({ message: 'La fecha de procesamiento es obligatoria.' })
  @IsString({ message: 'La fecha de procesamiento debe ser un string en formato YYYYMMDD.' })
  @Length(8, 8, { message: 'La fecha de procesamiento debe tener exactamente 8 caracteres.' })
  fecha_procesamiento: string;

  @IsDefined({ message: 'El total de pagos exitosos es obligatorio.' })
  @IsInt({ message: 'El total de pagos exitosos debe ser un número entero.' })
  @Min(0, { message: 'El total de pagos exitosos no puede ser negativo.' })
  total_pagos_exitosos: number;

  @IsDefined({ message: 'El monto de pagos exitosos es obligatorio.' })
  @IsNumber({}, { message: 'El monto de pagos exitosos debe ser un número.' })
  @Min(0, { message: 'El monto de pagos exitosos no puede ser negativo.' })
  monto_pagos_exitosos: number;

  @IsDefined({ message: 'El total de pagos fallidos es obligatorio.' })
  @IsInt({ message: 'El total de pagos fallidos debe ser un número entero.' })
  @Min(0, { message: 'El total de pagos fallidos no puede ser negativo.' })
  total_pagos_fallidos: number;

  @IsDefined({ message: 'El monto de pagos fallidos es obligatorio.' })
  @IsNumber({}, { message: 'El monto de pagos fallidos debe ser un número.' })
  @Min(0, { message: 'El monto de pagos fallidos no puede ser negativo.' })
  monto_pagos_fallidos: number;

  @IsArray({ message: 'Debe ser un array.' })
  @ValidateNested({ each: true })
  @Type(() => PagoFallidoDto)
  pagos_fallidos: PagoFallidoDto[];
}
