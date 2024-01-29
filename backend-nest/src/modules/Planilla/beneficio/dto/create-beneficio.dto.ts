import { IsDate, IsEmail, IsNumber, IsOptional, IsString, MinLength } from "class-validator";

export class CreateBeneficioDto {

    @IsString({ message: 'El nombre del tipo de beneficio debe ser una cadena de texto.' })
    nombre_beneficio: string;

    @IsString()
    descripcion_beneficio : string
    
    @IsString()
    estado : string

    @IsNumber()
    numero_rentas_max : number
    

}
