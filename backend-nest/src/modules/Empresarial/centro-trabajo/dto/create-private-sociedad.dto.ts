import { IsString, IsNotEmpty, MaxLength, IsOptional, IsEmail } from 'class-validator';

export class CreatePrivateSociedadDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  rtn?: string;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  telefono?: string;

  @IsEmail()
  @MaxLength(50)
  @IsOptional()
  correo_electronico?: string;
}
