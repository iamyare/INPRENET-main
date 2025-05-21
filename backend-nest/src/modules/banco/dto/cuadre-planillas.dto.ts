import { Type } from "class-transformer";
import { 
  IsArray, 
  IsDefined, 
  IsInt, 
  IsNotEmpty, 
  IsNumber, 
  IsString, 
  Min, 
  ValidateNested, 
  Length, 
  Matches
} from "class-validator";

class PlanillaEnProcesoDto {
  @IsDefined({ message: 'El ID de planilla debe estar definido.' })
  @IsInt({ message: 'El ID de planilla debe ser un número entero.' })
  @Min(1, { message: 'El ID de planilla debe ser mayor a 0.' })
  @IsNotEmpty({ message: 'El ID de planilla es obligatorio.' })
  id_planilla: number;

  @IsDefined({ message: 'El monto total pendiente debe estar definido.' })
  @IsNumber({}, { message: 'El monto total pendiente debe ser un número.' })
  @Min(0, { message: 'El monto total pendiente no puede ser negativo.' })
  @IsNotEmpty({ message: 'El monto total pendiente es obligatorio.' })
  monto_total_pendiente_de_resolver: number;

  @IsDefined({ message: 'El total de pagos pendientes debe estar definido.' })
  @IsInt({ message: 'El total de pagos pendientes debe ser un número entero.' })
  @Min(0, { message: 'El total de pagos pendientes no puede ser negativo.' })
  @IsNotEmpty({ message: 'El total de pagos pendientes es obligatorio.' })
  total_no_pagos_pendientes: number;
}

export class CuadrePlanillasDto {
  @IsDefined({ message: 'La fecha de cierre debe estar definida.' })
  @IsString({ message: 'La fecha de cierre debe ser una cadena de texto.' })
  @Matches(/^\d{8}$/, { message: 'La fecha de cierre debe estar en formato YYYYMMDD.' })
  @IsNotEmpty({ message: 'La fecha de cierre es obligatoria.' })
  fecha_cierre: string;

  @IsDefined({ message: 'Las planillas en proceso deben estar definidas.' })
  @IsArray({ message: 'Las planillas en proceso deben ser un arreglo.' })
  @ValidateNested({ each: true })
  @Type(() => PlanillaEnProcesoDto)
  @IsNotEmpty({ message: 'Debe proporcionar al menos una planilla en proceso.' })
  planillas_en_proceso: PlanillaEnProcesoDto[];
}
