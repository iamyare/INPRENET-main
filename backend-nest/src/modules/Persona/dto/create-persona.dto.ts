import { Type } from 'class-transformer';
import {
    IsDate, IsEmail, IsInt, IsOptional, IsString, Matches, MaxLength,
} from 'class-validator';

export interface PersonaResponse {
    id_persona: number;
    dni: string;
    estado_civil: string;
    primer_nombre: string;
    segundo_nombre: string;
    tercer_nombre: string;
    primer_apellido: string;
    segundo_apellido: string;
    genero: string;
    cantidad_dependientes: number;
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
    tipo_persona: string;
}

export class NetPersonaDTO {
    @IsInt()
    @IsOptional()
    id_tipo_identificacion?: number;

    @IsInt()
    id_pais: number;

    @IsString()
    @MaxLength(15)
    @Matches(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/, {
        message: "El DNI debe contener 13 caracteres numéricos en formato continuo o en el formato NNNN-NNNN-NNNNN.",
    })
    dni: string;

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

    @IsString()
    @MaxLength(30)
    genero: string;

    @IsInt()
    @IsOptional()
    cantidad_dependientes?: number;

    @IsInt()
    @IsOptional()
    id_profesion?: number;

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

    @IsString()
    @Matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/, {
        message: "La fecha de nacimiento debe estar en el formato d/m/aaaa.",
    })
    fecha_nacimiento: string;

    @IsString()
    @IsOptional()
    @Matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/, {
        message: "La fecha de defunción debe estar en el formato d/m/aaaa.",
    })
    fecha_defuncion?: string;

    @IsString()
    @MaxLength(200)
    @IsOptional()
    archivo_identificacion?: string;

    @IsString()
    @MaxLength(200)
    direccion_residencia: string;

    @IsInt()
    id_municipio_residencia: number;

    @IsString()
    @MaxLength(1)
    @Matches(/^[FM]$/, {
        message: "El campo 'sexo' solo acepta 'F' o 'M'.",
    })
    sexo: string;

    @IsOptional()
    foto_perfil?: Buffer;

}