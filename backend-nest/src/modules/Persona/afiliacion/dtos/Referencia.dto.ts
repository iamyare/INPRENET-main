import { IsNotEmpty, IsOptional, IsString, IsNumber, IsDateString, IsArray } from 'class-validator';

export class PersonaDto {
  @IsNotEmpty()
  @IsNumber()
  id_persona: number;

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
  @IsString()
  sexo: string;

  @IsOptional()
  @IsNumber()
  cantidad_hijos?: number;

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
  correo_1?: string;

  @IsOptional()
  @IsString()
  correo_2?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;

  @IsNotEmpty()
  @IsNumber()
  id_municipio_residencia: number;

  @IsOptional()
  @IsNumber()
  id_profesion?: number;

  @IsOptional()
  @IsArray()
  discapacidades?: any[];

  @IsOptional()
  @IsArray()
  peps?: any[];
}

export class ReferenciaDto {
  @IsNotEmpty()
  @IsNumber()
  id_ref: number;

  @IsNotEmpty()
  @IsNumber()
  id_persona: number;

  @IsNotEmpty()
  @IsNumber()
  id_referenciada: number;

  @IsNotEmpty()
  @IsString()
  tipo_referencia: string;

  @IsOptional()
  @IsString()
  dependiente_economico?: string;

  @IsOptional()
  @IsString()
  parentesco?: string;

  @IsNotEmpty()
  personaReferenciada: PersonaDto;
}
