import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDate, IsEnum, IsEmail, ValidateNested, IsArray } from 'class-validator';
import { CrearDiscapacidadDto } from './crear-discapacidad.dto';
import { Type } from 'class-transformer';

export class CrearPersonaDto {
  @IsNotEmpty()
  @IsNumber()
  id_tipo_identificacion: number;

  @IsNotEmpty()
  @IsNumber()
  id_pais_nacionalidad: number;

  @IsNotEmpty()
  @IsString()
  n_identificacion: string;

  @IsOptional()
  @IsDate()
  fecha_vencimiento_ident?: Date;

  @IsOptional()
  @IsString()
  rtn?: string;

  @IsOptional()
  @IsString()
  grupo_etnico?: string;

  @IsOptional()
  @IsString()
  estado_civil?: string;

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
  genero?: string;

  @IsNotEmpty()
  @IsEnum(['F', 'M'])
  sexo: string;

  @IsNotEmpty()
  @IsEnum(['SI', 'NO'])
  fallecido: string;

  @IsOptional()
  @IsNumber()
  cantidad_hijos?: number;

  @IsOptional()
  @IsString()
  primer_nombre_censo?: string;

  @IsOptional()
  @IsString()
  segundo_nombre_censo?: string;

  @IsOptional()
  @IsString()
  nombre_apellido_escalafon?: string;

  @IsOptional()
  @IsString()
  primer_apellido_censo?: string;

  @IsOptional()
  @IsString()
  segundo_apellido_censo?: string;

  @IsOptional()
  @IsString()
  representacion?: string;

  @IsOptional()
  @IsString()
  grado_academico?: string;

  @IsOptional()
  @IsString()
  telefono_1?: string;

  @IsOptional()
  @IsString()
  telefono_2?: string;

  @IsOptional()
  @IsEmail()
  correo_1?: string;

  @IsOptional()
  @IsEmail()
  correo_2?: string;

  @IsOptional()
  @IsDate()
  fecha_nacimiento?: Date;

  @IsOptional()
  @IsNumber()
  tipo_defuncion?: number;

  @IsOptional()
  @IsNumber()
  certificado_defuncion?: number;

  @IsOptional()
  @IsDate()
  fecha_defuncion?: Date;

  @IsOptional()
  @IsString()
  archivo_identificacion?: string;

  @IsOptional()
  @IsString()
  direccion_residencia?: string;

  @IsOptional()
  foto_perfil?: Buffer;

  @IsNotEmpty()
  @IsNumber()
  id_municipio_residencia: number;

  @IsOptional()
  @IsNumber()
  id_municipio_defuncion?: number;

  @IsOptional()
  @IsNumber()
  id_profesion?: number;

  @IsOptional()
  @IsNumber()
  id_causa_fallecimiento?: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearDiscapacidadDto)
  discapacidades?: CrearDiscapacidadDto[];
}
