import { Type } from "class-transformer";
import { IsEmail, IsOptional, IsString, IsDateString, IsNumber, IsUUID, IsArray, ValidateNested, IsObject } from "class-validator"
import { CreatePerfAfilCentTrabDto } from "./create-perfAfilCentTrabs.dto";
import { CreateBancoDto } from "../../banco/dto/create-banco.dto";

export class CreateAfiliadoRelacionadoDto {

    //Datos de tabla Afiliado
    @IsString()
    dni: string;

    @IsString()
    estado_civil: string;

    @IsString()
    tipo_cotizante: string;

    @IsString()
    primer_nombre: string;

    @IsOptional()
    @IsString()
    segundo_nombre: string;

    @IsOptional()
    @IsString()
    tercer_nombre: string;

    @IsString()
    primer_apellido: string;

    @IsOptional()
    @IsString()
    segundo_apellido: string;

    @IsDateString()
    fecha_nacimiento: string;

    @IsString()
    sexo: string;

    @IsNumber()
    cantidad_dependientes: number;

    @IsNumber()
    cantidad_hijos: number;

    @IsString()
    profesion: string;

    @IsString()
    representacion: string;

    @IsString()
    telefono_1: string;

    @IsOptional()
    @IsString()
    telefono_2: string;

    @IsString()
    @IsEmail()
    correo_1: string;

    @IsOptional()
    @IsString()
    @IsEmail()
    correo_2: string;

    @IsString()
    archivo_identificacion: string;

    @IsString()
    direccion_residencia: string;

    @IsString()
    estado: string;

    @IsString()
    colegio_magisterial: string;

    @IsString()
    numero_carnet: string;

    @IsArray()
    @ValidateNested({ each: true })
    @IsOptional()
    @Type(() => CreatePerfAfilCentTrabDto)
    perfAfilCentTrabs?: CreatePerfAfilCentTrabDto[];

    //datos de banco
    /* @IsObject()
    @ValidateNested()
    @Type(() => CreateBancoDto)
    datosBanc: CreateBancoDto; */

    @IsString()
    @IsOptional()
    tipo_identificacion?: string;

    @IsString()
    @IsOptional()
    nombre_pais?: string;

    @IsString()
    @IsOptional()
    nombre_departamento?: string;

}