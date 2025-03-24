import { IsString, IsNotEmpty } from 'class-validator';

export class GetPlanillasPreliminaresDto {
  @IsString()
  @IsNotEmpty({ message: 'El código de planilla no puede estar vacío' })
  codigo_planilla: string;
}
