import { IsNotEmpty, IsString, IsNumber, IsOptional, IsDate } from 'class-validator';

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

  @IsOptional()
  @IsDate()
  fecha_activacion?: Date;
  
  @IsOptional()
  @IsDate()
  fecha_inactivacion?: Date;
}
