import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDate, IsEnum, IsEmail, ValidateNested, IsArray, IsDateString } from 'class-validator';
import { CrearDiscapacidadDto } from './crear-discapacidad.dto';
import { Type } from 'class-transformer';
import { CrearPepsDto } from './crear-peps.dto';

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
  @IsDateString()
  fecha_vencimiento_ident?: string;

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
  @IsEnum(['F', 'M', 'NO BINARIO', 'OTRO'], { message: 'El sexo debe ser uno de los siguientes valores: F, M, NO BINARIO, OTRO' })
  sexo: string;

  @IsNotEmpty()
  @IsOptional()
  @IsEnum(['SI', 'NO'])
  fallecido?: string;

  @IsOptional()
  @IsNumber()
  cantidad_hijos?: number;

  @IsOptional()
  @IsNumber()
  cantidad_dependientes?: number;

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
  @IsString()
  telefono_3?: string;


  @IsOptional()
  @IsEmail()
  correo_1?: string;

  @IsOptional()
  @IsEmail()
  correo_2?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsOptional()
  @IsNumber()
  tipo_defuncion?: number;

  @IsOptional()
  @IsNumber()
  certificado_defuncion?: number;

  @IsOptional()
  @IsDateString()
  fecha_defuncion?: string;

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

  @IsNotEmpty()
  @IsNumber()
  id_municipio_nacimiento: number;

  @IsOptional()
  @IsNumber()
  id_municipio_defuncion?: number;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  id_departamento_nacimiento?: number;

  @IsNotEmpty()
  @IsNumber()
  @IsOptional()
  id_departamento_residencia?: number;

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearPepsDto)
  peps?: CrearPepsDto[];


  @IsOptional()
  cargoPublico?
}
