// src/planilla/dto/get-planillas-preliminares.dto.ts
import { IsString } from 'class-validator';

export class GetPlanillasPreliminaresDto {
  @IsString()
  proceso: string;
}
