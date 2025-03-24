import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCausaFallecimientoDto {
  @IsNotEmpty({ message: 'El nombre de la causa de fallecimiento es obligatorio' })
  @IsString({ message: 'El nombre debe ser un texto' })
  @MaxLength(100, { message: 'El nombre no puede tener más de 100 caracteres' })
  nombre: string;
}
