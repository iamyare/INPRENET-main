import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class CreateBancoDto {
  @IsString()
  @IsNotEmpty()
  @Length(3, 80)
  nombre_banco: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 20)
  @Matches(/^[0-9]+$/, { message: 'El código ACH solo puede contener números.' })
  codigo_ach: string;

  @IsString()
  @IsNotEmpty()
  estado: string;
}
