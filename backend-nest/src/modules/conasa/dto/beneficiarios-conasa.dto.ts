import { IsNotEmpty, IsString, IsDateString, IsOptional } from 'class-validator';

export class CrearBeneficiarioDto {
  @IsString()
  @IsNotEmpty()
  primer_nombre: string;

  @IsString()
  @IsOptional()
  segundo_nombre?: string | null;

  @IsString()
  @IsNotEmpty()
  primer_apellido: string;

  @IsString()
  @IsOptional()
  segundo_apellido?: string | null;

  @IsString()
  @IsNotEmpty()
  parentesco: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_nacimiento: string;
}
