import { IsDateString, IsOptional, IsString } from 'class-validator';
export class CreateHistorialTrabajoDto {


    @IsDateString()
    fecha_inicio: string;

    @IsDateString()
    fechaFin: string;

    @IsString()
    salario: string;

    @IsString()
    @IsOptional()
    nombre_deduccion?: string;    


}