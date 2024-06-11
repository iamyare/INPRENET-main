import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreatePrivateReferenciaCentroTrabajoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  tipoReferencia: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  nombre: string;
}
