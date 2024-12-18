import { IsString, Matches } from 'class-validator';

export class ObtenerAfiliadosPorPeriodoDto {
  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{2}$/, { message: 'La fecha de inicio debe tener el formato dd/MM/yy.' })
  fechaInicio: string;

  @IsString()
  @Matches(/^\d{2}\/\d{2}\/\d{2}$/, { message: 'La fecha de fin debe tener el formato dd/MM/yy.' })
  fechaFin: string;
}
