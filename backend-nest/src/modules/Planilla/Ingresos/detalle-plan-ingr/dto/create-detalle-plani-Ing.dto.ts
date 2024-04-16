import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, } from "class-validator";

export class CreateDetallePlanIngDto {
    @IsNumber()
    @IsOptional()
    idInstitucion?: number;

    @IsNumber()
    @IsOptional()
    idTipoPlanilla?: number;

    @IsNumber()
    @IsOptional()
    mes?: number;

    @IsNumber()
    prestamos: number;

}