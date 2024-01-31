import { IsNumber, IsOptional, IsString, IsUUID, Length, Max, Min, isNumber } from "class-validator";

export class CreateDetalleDeduccionDto {
    @IsString()
    @Length(10, 20)
    dni: string; // Asume que el DNI tiene una longitud específica

    @IsUUID()
    @IsOptional()
    id_deduccion?: string; // Opcional, dependiendo de tu lógica de negocio

    @IsUUID()
    @IsOptional()
    id_institucion?: string; // Opcional, dependiendo de tu lógica de negocio

    @IsNumber()
    @Min(0)
    monto_total: number;

    @IsNumber()
    @Min(0)
    @Max(100) // Asumiendo que es un porcentaje o un valor máximo específico
    monto_aplicado: number;

    @IsString()
    @IsOptional()
    estado_aplicacion?: string; // Opcional, dependiendo de tu lógica de negocio

    @IsNumber()
    @Min(1900)
    @Max(new Date().getFullYear())
    anio: number;

    @IsNumber()
    @Min(1)
    @Max(12)
    mes: number;
}
