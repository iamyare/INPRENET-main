import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreatePlanillaDto {
    @IsString()
    codigo_planilla: string;

    @IsNumber()
    secuencia: number;

    @IsString({ message: '' })
    @IsNotEmpty({ message: '' })
    periodoInicio: string; 

    @IsString({ message: '' })
    @IsNotEmpty({ message: '' })
    periodoFinalizacion: string;

    @IsString({ message: '' })
    @IsNotEmpty({ message: '' })
    @IsOptional({ message: '' })
    nombre_planilla?: string;
    
    @IsString()
    @IsOptional({ message: '' })
    fecha_cierre?: any;
    
    @IsString()
    @IsOptional({ message: '' })
    estado?: any;
    
}
