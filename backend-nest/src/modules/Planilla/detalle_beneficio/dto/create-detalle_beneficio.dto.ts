import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateDetalleBeneficioDto {
    @IsString()
    nombre_beneficio: string;

    @IsString()
    dni: string;

    @IsNumber()
    monto_por_periodo: number;

    @IsString()
    metodo_pago: string;

    @IsString()
    ley_aplicable: string;

    @IsNumber()
    monto_total: number;

    @IsString()
    @IsOptional()
    periodoPago?: string;

    @IsString()
    @IsOptional()
    estado?: string;

    @IsString()
    @IsOptional()
    periodoInicio: string;

    @IsString()
    @IsOptional()
    periodoFinalizacion: string;

    @IsString()
    @IsOptional()
    fecha_calculo: string;

    @IsOptional()
    @IsNumber()
    num_rentas_aplicadas?: number;
}