import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreatePlanillaDto {
    @IsString()
    codigo_planilla: string;

    @IsString()
    @IsOptional({ message: '' })
    id_planilla: number;

    @IsString()
    @IsOptional({ message: '' })
    fecha_cierre?: Date;
    
    @IsNumber()
    secuencia: number;

    @IsString()
    @IsOptional({ message: '' })
    estado?: string;

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
    
    
    
}
