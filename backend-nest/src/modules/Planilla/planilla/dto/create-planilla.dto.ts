import { IsNotEmpty, IsOptional, IsString, Length } from "class-validator";

export class CreatePlanillaDto {
    @IsString()
    @Length(0, 200)
    @IsOptional()
    codigo_planilla: string;

    @IsString()
    @Length(0, 200)
    @IsOptional()
    fecha_apertura: string;

    @IsString()
    @Length(0, 200)
    @IsOptional()
    secuencia: string;

    @IsString()
    @Length(0, 200)
    @IsOptional()
    estado: string;

    @IsString({ message: '' })
    @Length(1, 200, { message: 'El periodo debe estar lleno' })
    @IsNotEmpty({ message: '' })
    periodoInicio: string; 

    @IsString({ message: '' })
    @Length(1, 200, { message: 'El periodo debe estar lleno' })
    @IsNotEmpty({ message: '' })
    periodoFinalizacion: string;

    @IsString({ message: '' })
    @Length(1, 200, { message: 'El estado debe estar lleno' })
    @IsNotEmpty({ message: '' })
    @IsOptional()
    tipoPlanilla?: string;

    @IsString({ message: '' })
    @Length(1, 200, { message: 'El estado debe estar lleno' })
    @IsNotEmpty({ message: '' })
    @IsOptional()
    afiliado?: string;

}
