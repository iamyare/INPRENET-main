import { Type } from 'class-transformer';
import {
    IsDate, IsEmail, IsEnum, IsInt, IsOptional, IsString, MaxLength, MinLength,
    ValidateNested
} from 'class-validator';

enum Sexo {
    Femenino = 'F',
    Masculino = 'M'
}

export interface PersonaResponse {
    id_persona: number;
    dni: string;
    estado_civil: string;
    primer_nombre: string;
    segundo_nombre: string;
    tercer_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    sexo: string;
    cantidad_dependientes: number;
    cantidad_hijos: number;
    profesion: string;
    representacion: string;
    telefono_1: string;
    telefono_2: string;
    correo_1: string;
    correo_2: string;
    colegio_magisterial: string;
    numero_carnet: string;
    direccion_residencia: string;
    estado: string;
    fecha_nacimiento: string;
    archivo_identificacion: string;
    tipoIdentificacion: string;
    porcentaje: string;
    tipo_afiliado: string;
}

export class NetPersonaDTO {
    @IsInt()
    id_tipo_identificacion: number;

    @IsInt()
    id_pais: number;

    @IsString()
    @MaxLength(40)
    @IsOptional()
    dni?: string;

    @IsString()
    @MaxLength(40)
    @IsOptional()
    estado_civil?: string;

    @IsString()
    @MaxLength(40)
    primer_nombre: string;

    @IsString()
    @MaxLength(40)
    @IsOptional()
    segundo_nombre?: string;

    @IsString()
    @MaxLength(40)
    @IsOptional()
    tercer_nombre?: string;

    @IsString()
    @MaxLength(40)
    primer_apellido: string;

    @IsString()
    @MaxLength(40)
    @IsOptional()
    segundo_apellido?: string;

    @IsInt()
    @IsOptional()
    ID_TIPO_PERSONA?: number;

    @IsEnum(Sexo)
    sexo: Sexo;

    @IsInt()
    @IsOptional()
    cantidad_dependientes?: number;

    @IsInt()
    @IsOptional()
    cantidad_hijos?: number;

    @IsString()
    @MaxLength(30)
    @IsOptional()
    profesion?: string;

    @IsString()
    @MaxLength(40)
    @IsOptional()
    representacion?: string;

    @IsString()
    @MaxLength(12)
    @IsOptional()
    telefono_1?: string;

    @IsString()
    @MaxLength(12)
    @IsOptional()
    telefono_2?: string;

    @IsEmail()
    @MaxLength(40)
    @IsOptional()
    correo_1?: string;

    @IsEmail()
    @MaxLength(40)
    @IsOptional()
    correo_2?: string;

    @IsString()
    @MaxLength(40)
    @IsOptional()
    numero_carnet?: string;

    @IsDate()
    @Type(() => Date)
    fecha_nacimiento?: Date;

    @IsString()
    @MaxLength(200)
    @IsOptional()
    archivo_identificacion?: string;

    @IsString()
    @MaxLength(200)
    direccion_residencia: string;

    @IsInt()
    id_municipio_residencia: number;

    @IsInt()
    id_estado_persona: number;
}