import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreatePlanillaDto {
    /*     @IsString()
        codigo_planilla: string;
     */
    @IsString()
    @IsOptional({ message: '' })
    id_planilla: number;

    @IsString()
    @IsOptional({ message: '' })
    fecha_cierre?: Date;

    @IsNumber()
    @IsOptional({ message: '' })
    secuencia?: number;

    @IsString()
    @IsOptional({ message: '' })
    estado?: string;

    @IsOptional({ message: '' })
    @IsString({ message: '' })
    @IsNotEmpty({ message: '' })
    periodo_inicio?: string;
    
    @IsOptional({ message: '' })
    @IsString({ message: '' })
    @IsNotEmpty({ message: '' })
    periodo_finalizacion?: string;

    @IsString({ message: '' })
    @IsNotEmpty({ message: '' })
    @IsOptional({ message: '' })
    nombre_planilla?: string;
}
