import { IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateAldeaDto {
  @IsString()
  @IsNotEmpty()
  nombre_aldea: string;

  @IsNumber()
  @IsNotEmpty()
  id_municipio: number;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  observacion?: string;
}
