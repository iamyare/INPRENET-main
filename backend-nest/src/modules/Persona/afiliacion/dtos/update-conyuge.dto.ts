import { IsString, IsOptional, IsDateString } from 'class-validator';

export class UpdateConyugeDto {
  @IsString()
  @IsOptional()
  primer_nombre: string;

  @IsString()
  @IsOptional()
  segundo_nombre?: string;

  @IsString()
  @IsOptional()
  tercer_nombre?: string;

  @IsString()
  @IsOptional()
  primer_apellido: string;

  @IsString()
  @IsOptional()
  segundo_apellido?: string;

  @IsString()
  @IsOptional()
  n_identificacion?: string;

  @IsDateString()
  @IsOptional()
  fecha_nacimiento?: string;

  @IsString()
  @IsOptional()
  telefono_domicilio?: string;

  @IsString()
  @IsOptional()
  telefono_celular?: string;

  @IsString()
  @IsOptional()
  telefono_trabajo?: string;

  @IsString()
  @IsOptional()
  trabaja?: string;
}
