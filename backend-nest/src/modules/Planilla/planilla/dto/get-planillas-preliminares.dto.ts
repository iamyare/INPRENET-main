import { IsString } from 'class-validator';

export class GetPlanillasPreliminaresDto {
  @IsString()
  codigo_planilla: string;
}