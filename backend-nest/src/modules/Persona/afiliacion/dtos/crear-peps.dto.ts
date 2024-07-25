import { IsNotEmpty, IsOptional, IsString, IsDateString } from 'class-validator';

export class CrearPepsDto {
  @IsNotEmpty()
  @IsString()
  cargo: string;

  @IsNotEmpty()
  @IsDateString()
  fecha_inicio: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;
}
