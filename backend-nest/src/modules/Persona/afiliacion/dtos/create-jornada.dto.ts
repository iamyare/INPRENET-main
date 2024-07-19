import { IsString } from 'class-validator';

export class CreateJornadaDto {
  @IsString()
  nombre: string;
}
