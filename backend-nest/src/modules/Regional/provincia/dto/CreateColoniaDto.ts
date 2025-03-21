import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateColoniaDto {
  @IsString()
  @IsNotEmpty()
  nombre_colonia: string;

  @IsNumber()
  @IsNotEmpty()
  id_municipio: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  observacion?: string;
}
