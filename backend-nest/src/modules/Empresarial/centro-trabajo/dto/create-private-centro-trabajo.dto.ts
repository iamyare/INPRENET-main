import { IsString, IsNotEmpty, IsOptional, IsEmail, IsNumber, IsDate, MaxLength, Min, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrivateCentroTrabajoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  nombre_centro_trabajo: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(14)
  rtn: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  objetivo_social?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  numero_empleados: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  telefono_1: string;

  @IsString()
  @MaxLength(30)
  @IsOptional()
  telefono_2?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  celular_1: string;

  @IsString()
  @MaxLength(30)
  @IsOptional()
  celular_2?: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(40)
  correo_1: string;

  @IsEmail()
  @MaxLength(50)
  @IsOptional()
  correo_2?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  colonia_localidad?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  barrio_avenida?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  grupo_calle?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  numero_casa?: string;

  @IsString()
  @MaxLength(200)
  @IsOptional()
  direccion_2?: string;

  @IsNumber()
  @IsOptional()
  numero_acuerdo?: string;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  fecha_emision?: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  fecha_inicio_operaciones?: Date;

  @IsArray()
  @IsOptional()
  @Type(() => String)
  modalidad_ensenanza?: string[];

  @IsArray()
  @IsOptional()
  @Type(() => String)
  tipo_jornada?: string[];

  @IsNumber()
  @IsNotEmpty()
  municipio: number;
}
