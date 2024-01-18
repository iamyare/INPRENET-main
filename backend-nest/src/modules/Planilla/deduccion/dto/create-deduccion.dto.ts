import { IsNumber, IsOptional, IsString } from "class-validator";

export class CreateDeduccionDto {

    @IsString()
    descripcion_deduccion: string;

}
