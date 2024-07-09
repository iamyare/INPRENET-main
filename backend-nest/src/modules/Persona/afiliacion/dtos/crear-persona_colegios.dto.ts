import { IsNotEmpty, IsNumber } from 'class-validator';

export class CrearPersonaColegiosDto {
  @IsNotEmpty()
  @IsNumber()
  id_colegio: number;
}
