import { IsNotEmpty, IsString } from 'class-validator';

export class CrearDiscapacidadDto {
  @IsNotEmpty()
  @IsString()
  tipo_discapacidad: string;
}
