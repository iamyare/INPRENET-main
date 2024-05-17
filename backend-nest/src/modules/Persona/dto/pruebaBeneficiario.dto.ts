import { Type } from 'class-transformer';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsDateString, ValidateNested } from 'class-validator';

export class DetalleBenef {
    @IsNotEmpty()
    @IsNumber()
    ID_CAUSANTE: number;

    @IsOptional()
    @IsNumber()
    porcentaje?: number;

    @IsOptional()
    @IsNumber()
    ID_TIPO_PERSONA?: number;

    @IsOptional()
    @IsNumber()
    ID_CAUSANTE_PADRE?: number;
}

export class Benef {
    @IsNotEmpty()
    @IsString()
    primer_nombre: string;

    @IsOptional()
    @IsString()
    segundo_nombre?: string;

    @IsOptional()
    @IsString()
    tercer_nombre?: string;

    @IsNotEmpty()
    @IsString()
    primer_apellido: string;

    @IsOptional()
    @IsString()
    segundo_apellido?: string;

    @IsOptional()
    @IsString()
    dni?: string;

    @IsOptional()
    @IsString()
    genero?: string;

    @IsOptional()
    @IsString()
    representacion?: string;

    @IsOptional()
    @IsString()
    sexo?: string;

    @IsOptional()
    @IsString()
    direccion_residencia?: string;

    @IsOptional()
    @IsNumber()
    id_municipio_residencia?: number; 

    @IsOptional()
    @IsDateString()
    fecha_nacimiento?: string;

    @IsOptional()
    @IsNumber()
    cantidad_dependientes?: number;

    @IsOptional()
    @IsString()
    telefono_1?: string;

    @IsOptional()
    @IsNumber()
    id_pais?: number;

    @ValidateNested()
    @Type(() => DetalleBenef)
    detalleBenef: DetalleBenef;
}
