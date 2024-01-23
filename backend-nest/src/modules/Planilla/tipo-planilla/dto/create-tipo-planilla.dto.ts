import { IsNotEmpty, IsOptional, IsString, Length, Max } from "class-validator";

export class CreateTipoPlanillaDto {

    @IsString()
    @Length(0, 50)
    @IsNotEmpty()
    nombre_planilla: string;

    @IsString()
    @Length(0, 200)
    @IsOptional()
    descripcion: string;

    @IsString()
    @Length(0, 200)
    @IsNotEmpty()
    periodoFinalizacion: string;

    @IsString()
    @Length(0, 200)
    @IsNotEmpty()
    periodoInicio: string;

}