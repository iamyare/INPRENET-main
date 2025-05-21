import { IsOptional, IsString, IsIn, MaxLength } from 'class-validator';

export class UpdateAldeaColoniaDto {
  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  @IsIn(['ACTIVO', 'INACTIVO'])
  estado?: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  observacion?: string;
}
