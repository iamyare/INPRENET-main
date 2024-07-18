import { IsString, IsNotEmpty } from 'class-validator';

export class CreateColegioDto {
  @IsString()
  @IsNotEmpty()
  descripcion: string;
}
