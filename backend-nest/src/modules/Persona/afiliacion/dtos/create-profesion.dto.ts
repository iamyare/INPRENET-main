import { IsString } from 'class-validator';

export class CreateProfesionDto {
  @IsString()
  descripcion: string;
}
