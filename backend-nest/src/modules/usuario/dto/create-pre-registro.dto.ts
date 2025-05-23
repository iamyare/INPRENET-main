import { IsString, IsEmail, IsNotEmpty, Length, IsInt, Min, IsOptional } from 'class-validator';

export class CreatePreRegistroDto {
  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  nombreEmpleado: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  nombrePuesto: string;

  @IsEmail()
  @IsNotEmpty()
  @Length(1, 255)
  correo: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  numeroEmpleado: string;

  @IsInt()
  @Min(1)
  @IsOptional()
  idRole?: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  idModulo?: number;
}
