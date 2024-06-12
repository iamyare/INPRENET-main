import { IsNumber, IsNotEmpty, IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrivateSociedadSocioDto {
  @IsNumber()
  @IsNotEmpty()
  porcentajeParticipacion: number;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  fechaIngreso: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  fechaSalida?: Date;
}
