import { IsNotEmpty, IsNotEmptyObject, IsOptional, IsString, Length, Max } from "class-validator";

export class CreateTipoPlanillaDto {
    

    @IsNotEmpty({ message: 'El nombre de la planilla no debe estar vacío.' })
    @IsString({ message: 'El nombre de la planilla debe ser una cadena de texto.' })
    @Length(1, 50, { message: 'El nombre de la planilla debe tener entre 1 y 50 caracteres.' })
    nombre_planilla: string;

    @IsString()
    @Length(0, 200)
    @IsOptional()
    descripcion: string;

    @IsString({ message: '' })
    @Length(1, 200, { message: 'El periodo debe estar lleno' })
    @IsNotEmpty({ message: '' })
    periodoFinalizacion: string;

    @IsString({ message: '' })
    @Length(1, 200, { message: 'El periodo debe estar lleno' })
    @IsNotEmpty({ message: '' })
    periodoInicio: string;

}