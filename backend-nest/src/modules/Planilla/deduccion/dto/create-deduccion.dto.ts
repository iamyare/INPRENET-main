import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateDeduccionDto {

    @IsString()
    descripcion_deduccion: string;

    @IsString()
    @IsOptional()
    estado_deduccion? : string;

    @IsNumber()
    total_deduccion : number;
}
