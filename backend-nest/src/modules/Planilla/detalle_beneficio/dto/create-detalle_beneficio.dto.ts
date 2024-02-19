import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateDetalleBeneficioDto {
    @IsString()
    @IsOptional()
    periodoPago?: string;

    @IsString()
    @IsOptional()
    estado?: string;

    @IsString()
    nombre_beneficio: string;

    @IsString()
    dni: string;

    @IsString()
    periodoInicio: string;

    @IsString()
    periodoFinalizacion: string;

    @IsNumber()
    monto_total: number;

    @IsOptional()
    @IsNumber()
    num_rentas_aplicadas?: number;

    @IsNumber()
    monto_por_periodo:number;

    @IsString()
    metodo_pago: string;

}
