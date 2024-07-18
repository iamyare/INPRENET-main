import { IsString, IsNotEmpty } from 'class-validator';

export class CreateBancoDto {
  @IsString()
  @IsNotEmpty()
  nombre_banco: string;

  @IsString()
  @IsNotEmpty()
  cod_banco: string;
}
