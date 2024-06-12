import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail } from 'class-validator';

export class CreatePrivateSocioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  apellido: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  dni: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  direccion_1?: string;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  direccion_2?: string;

  @IsString()
  @MaxLength(20)
  @IsOptional()
  telefono?: string;

  @IsEmail()
  @MaxLength(255)
  @IsOptional()
  email?: string;

  @IsNotEmpty()
  municipio: number;
}
