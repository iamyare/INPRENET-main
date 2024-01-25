import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateBeneficioPlanillaDto {
    @IsString()
    @IsOptional()
    periodoPago: string;

    @IsString()
    @IsOptional()
    estado?: string;

    @IsNumber()
    beneficioPlanilla: number;

    @IsNumber()
    afiliado: number;

}
