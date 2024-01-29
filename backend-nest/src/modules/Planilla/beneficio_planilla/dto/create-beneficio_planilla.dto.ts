import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateBeneficioPlanillaDto {
    @IsString()
    @IsOptional()
    periodoPago?: string;

    @IsString()
    @IsOptional()
    estado?: string;

    @IsString()
    beneficio: string;

    @IsString()
    afiliado: string;

    @IsString()
    periodoInicio: string;

    @IsString()
    periodoFinalizacion: string;

    @IsNumber()
    monto: number;

}
