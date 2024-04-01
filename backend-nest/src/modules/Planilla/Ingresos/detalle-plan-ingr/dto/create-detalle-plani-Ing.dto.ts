import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, } from "class-validator";

export class CreateDetallePlanIngDto {
    @IsString()
    @IsOptional()
    dni?: string;

    @IsNumber()
    @IsOptional()
    idInstitucion?: number;

    @IsNumber()
    sueldo: number;

    @IsNumber()
    prestamos: number;

}