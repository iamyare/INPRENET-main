import { IsNumber, IsOptional, IsString, IsUUID, Length, isNumber } from "class-validator";

export class CreateDetalleDeduccionDto {
    @IsString()
    nombre_deduccion: string;

    @IsString()
    dni: string;

    @IsString()
    nombre_institucion: string;

    @IsNumber()
    monto_total: number;

    @IsString()
    @Length(1, 20)
    @IsOptional()
    estado_aplicacion?: string;

    @IsNumber()
    anio: number;

    @IsNumber()
    mes: number;

    @IsNumber()
    @IsOptional()
    monto_aplicado?: number;
}
