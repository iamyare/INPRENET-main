import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, IsDateString } from 'class-validator';

export class UpdateBeneficiarioDto {
  @IsInt()
  @IsNotEmpty()
  id_pais: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(15)
  dni: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  primer_nombre: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  segundo_nombre?: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  tercer_nombre?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(40)
  primer_apellido: string;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  segundo_apellido?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  genero: string;

  @IsInt()
  @IsOptional()
  cantidad_dependientes?: number;

  @IsString()
  @IsOptional()
  @MaxLength(40)
  representacion?: string;

  @IsString()
  @IsOptional()
  @MaxLength(12)
  telefono_1?: string;

  @IsOptional()
  @Transform(({ value }) => {
    const [day, month, year] = value.split('/');
    return `${year}-${month}-${day}`;
  }, { toClassOnly: true })
  @IsDateString()
  fecha_nacimiento?: string;

  @IsInt()
  @IsNotEmpty()
  id_municipio_residencia: number;

  @IsInt()
  @IsNotEmpty()
  id_estado_persona: number;

  @IsString()
  @IsNotEmpty()
  @MaxLength(1)
  sexo: string;

  @IsInt()
  @IsNotEmpty()
  id_tipo_persona: number;

  @IsInt()
  @IsOptional()
  porcentaje?: number;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  direccion_residencia?: string;
}
