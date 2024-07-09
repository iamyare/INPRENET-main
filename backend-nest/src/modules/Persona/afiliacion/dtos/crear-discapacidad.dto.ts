import { IsNotEmpty, IsNumber } from 'class-validator';

export class CrearDiscapacidadDto {
  @IsNotEmpty()
  @IsNumber()
  id_discapacidad: number;
}
