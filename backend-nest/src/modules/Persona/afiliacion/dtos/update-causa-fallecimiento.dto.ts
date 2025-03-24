import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateCausaFallecimientoDto {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  nombre?: string;
}
