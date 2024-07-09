import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CrearPersonaBancoDto {
  @IsNotEmpty()
  @IsNumber()
  id_banco: number;

  @IsNotEmpty()
  @IsString()
  num_cuenta: string;

  @IsNotEmpty()
  @IsString()
  estado: string;
}
