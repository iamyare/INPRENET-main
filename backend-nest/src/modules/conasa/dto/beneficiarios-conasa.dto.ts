import { IsNotEmpty, IsString, IsDateString } from 'class-validator';

export class CrearBeneficiarioDto {
  @IsString()
  @IsNotEmpty()
  primer_nombre: string;

  @IsString()
  segundo_nombre?: string;

  @IsString()
  @IsNotEmpty()
  primer_apellido: string;

  @IsString()
  segundo_apellido?: string;

  @IsString()
  @IsNotEmpty()
  parentesco: string;

  @IsDateString()
  @IsNotEmpty()
  fecha_nacimiento: string;
}
