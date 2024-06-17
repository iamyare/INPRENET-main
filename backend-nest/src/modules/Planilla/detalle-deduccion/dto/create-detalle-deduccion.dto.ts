import { IsNumber, IsOptional, IsString, IsUUID, Length, Max, Min, isNumber } from "class-validator";

export class CreateDetalleDeduccionDto {
    @IsString()
    n_identificacion: string; // Asume que el DNI tiene una longitud específica

    @IsString()
    nombre_deduccion: string;

    @IsString()
    nombre_centro_trabajo: string;

    @IsNumber()
    @Min(0)
    monto_total: number;

    @IsNumber()
    @IsOptional()
    monto_aplicado?: number;

    @IsString()
    @IsOptional()
    estado_aplicacion?: string;

    @IsNumber()
    @Min(1900)
    @Max(new Date().getFullYear())
    anio: number;

    @IsNumber()
    @Min(1)
    @Max(12)
    mes: number;
}
