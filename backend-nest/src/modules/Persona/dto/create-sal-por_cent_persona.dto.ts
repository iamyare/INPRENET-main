import { IsNumber, IsString } from "class-validator";

export class CreateSalPorCentPerDto {
    @IsString()
    fecha_inicio : string;
    
    @IsString()
    ficha_final : string;
    
    @IsNumber()
    salario : number;
}