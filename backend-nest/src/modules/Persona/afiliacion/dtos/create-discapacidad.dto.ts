import { IsString, IsOptional } from 'class-validator';

export class CreateDiscapacidadDto {
  @IsString()
  tipo_discapacidad: string;

  @IsString()
  @IsOptional()
  descripcion?: string;
}
