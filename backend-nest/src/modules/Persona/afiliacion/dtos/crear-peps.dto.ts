import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CrearPepsDto {
  @IsNotEmpty()
  @IsString()
  @IsOptional()
  cargo?: string;

  @IsNotEmpty()
  @IsOptional()
  @IsDateString()
  fecha_inicio?: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;
}
