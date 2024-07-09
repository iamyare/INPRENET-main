import { IsNotEmpty, IsOptional, IsNumber, IsEnum, IsString } from 'class-validator';

export class CrearDetallePersonaDto {
  @IsOptional()
  @IsString()
  @IsEnum(['SI', 'NO'])
  eliminado?: string = 'NO';

  @IsNotEmpty()
  @IsNumber()
  id_tipo_persona: number;

  @IsNotEmpty()
  @IsNumber()
  id_estado_afiliacion: number;
}
