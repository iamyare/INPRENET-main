import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, } from "class-validator";

export class CreateDetallePlanIngDto {
    @IsNumber()
    prestamos: number;

    @IsString()
    dni: string;

    @IsNumber()
    @IsOptional()
    idInstitucion?: number;

    @IsNumber()
    @IsOptional()
    idTipoPlanilla?: number;

    @IsNumber()
    @IsOptional()
    mes?: number;

    /*     @IsNumber()
        sueldo: number; */


}