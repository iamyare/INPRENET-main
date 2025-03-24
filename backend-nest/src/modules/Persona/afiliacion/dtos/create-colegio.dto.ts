import { IsString, IsNotEmpty, MaxLength, MinLength, Matches } from 'class-validator';

export class CreateColegioDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  descripcion: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[A-Za-zÁÉÍÓÚáéíóúñÑ]+$/, { message: 'La abreviatura solo debe contener letras' })
  abreviatura: string;
}
