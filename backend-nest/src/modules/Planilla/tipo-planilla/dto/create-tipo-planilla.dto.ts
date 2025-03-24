import { IsNotEmpty, IsNotEmptyObject, IsNumber, IsOptional, IsString, Length, Max } from "class-validator";

export class CreateTipoPlanillaDto {
    @IsNotEmpty({ message: 'El nombre de la planilla no debe estar vacío.' })
    @IsString({ message: 'El nombre de la planilla debe ser una cadena de texto.' })
    @Length(5, 50, { message: 'El nombre de la planilla debe tener entre 5 y 50 caracteres.' })
    nombre_planilla: string;

    @IsString()
    @Length(0, 200)
    @IsOptional()
    descripcion: string;

    @IsString()
    @Length(0, 7)
    @IsOptional()
    clase_planilla: string;

    @IsNumber()
    @IsOptional()
    id_tipo_planilla: number;

    @IsString({ message: '' })
    @Length(1, 200, { message: 'El estado debe estar lleno' })
    @IsNotEmpty({ message: '' })
    @IsOptional()
    estado?: string;
}