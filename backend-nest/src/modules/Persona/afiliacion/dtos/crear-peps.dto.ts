import { IsNotEmpty, IsOptional, IsString, ValidateNested, IsDateString, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CrearCargoPublicoDto {
  @IsNotEmpty()
  @IsString()
  cargo: string;

  @IsNotEmpty()
  @IsDateString()
  fecha_inicio: string;

  @IsOptional()
  @IsDateString()
  fecha_fin?: string;

  @IsOptional()
  @IsString()
  referencias?: string;
}

export class CrearPepsDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearCargoPublicoDto)
  cargosPublicos: CrearCargoPublicoDto[];
}
