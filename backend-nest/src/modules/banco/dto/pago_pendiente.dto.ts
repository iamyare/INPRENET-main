import { Type } from "class-transformer";
import { IsArray, IsInt, IsNotEmpty, IsNumber, IsString, Length, Min, ValidateNested } from "class-validator";

class PagoAcumuladoDto {
  @IsInt({ message: 'El ID de planilla debe ser un número entero.' })
  @Min(1, { message: 'El ID de planilla debe ser mayor a 0.' })
  @IsNotEmpty({ message: 'El ID de planilla es obligatorio.' })
  id_planilla: number;
}

export class NotificacionPagosPendientesDto {
  @IsString({ message: 'El número de identificación debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El número de identificación es obligatorio.' })
  @Length(13, 20, { message: 'El número de identificación debe tener entre 13 y 20 caracteres.' })
  numero_identificacion: string;

  @IsNumber({}, { message: 'El monto pagado debe ser un número.' })
  @Min(0, { message: 'El monto pagado no puede ser negativo.' })
  @IsNotEmpty({ message: 'El monto pagado es obligatorio.' })
  monto_pagado: number;

  @IsString({ message: 'El número de cuenta debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'El número de cuenta es obligatorio.' })
  @Length(10, 20, { message: 'El número de cuenta debe tener entre 10 y 20 caracteres.' })
  numero_cuenta: string;

  @IsString({ message: 'La fecha de actualización debe estar en formato YYYYMMDD.' })
  @IsNotEmpty({ message: 'La fecha de actualización es obligatoria.' })
  @Length(8, 8, { message: 'La fecha de actualización debe tener exactamente 8 caracteres en formato YYYYMMDD.' })
  fecha_actualizacion: string;

  @IsInt({ message: 'El código del banco debe ser un número entero.' })
  @Min(1, { message: 'El código del banco debe ser mayor a 0.' })
  @IsNotEmpty({ message: 'El código del banco es obligatorio.' })
  codigo_banco_ach: number;

  @IsNumber({}, { message: 'El monto total pagado debe ser un número.' })
  @Min(0, { message: 'El monto total pagado no puede ser negativo.' })
  @IsNotEmpty({ message: 'El monto total pagado es obligatorio.' })
  monto_total_pagado: number;

  @IsString({ message: 'La descripción de resolución debe ser una cadena de texto.' })
  @IsNotEmpty({ message: 'La descripción de resolución es obligatoria.' })
  @Length(3, 500, { message: 'La descripción de resolución debe tener entre 3 y 500 caracteres.' })
  descripcion_resolucion: string;

  @IsArray({ message: 'Los pagos acumulados deben ser un arreglo.' })
  @ValidateNested({ each: true })
  @Type(() => PagoAcumuladoDto)
  @IsNotEmpty({ message: 'La lista de pagos acumulados no puede estar vacía.' })
  pagos_acumulados: PagoAcumuladoDto[];
}
