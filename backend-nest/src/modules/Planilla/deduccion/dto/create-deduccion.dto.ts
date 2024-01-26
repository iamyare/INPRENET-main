import { IsNotEmpty, IsNumber, IsOptional, IsString, Length, isNumber } from "class-validator";

export class CreateDeduccionDto {


    @IsNotEmpty({ message: 'El nombre de la Deduccion no debe estar vacío.' })
    @IsString({ message: 'El nombre de la Deduccion debe ser una cadena de texto.' })
    @Length(5, 50, { message: 'El nombre de la Deduccion debe tener entre 5 y 100 caracteres.' })
    nombre_deduccion : string
    
    @IsString()
    @IsOptional()
    descripcion_deduccion: string;

    @IsNumber()
    prioridad: number;

    @IsString()
    @IsOptional()
    tipo_deduccion: string;

    @IsNumber()
    codigo_deduccion: number

}
