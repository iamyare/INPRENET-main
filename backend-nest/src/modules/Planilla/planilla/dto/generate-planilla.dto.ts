import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GeneratePlanillaDto {
  @IsString()
  tipos_persona: string;

  @IsNumber()
  @IsOptional()
  v_id_planilla?: number;

  @IsNumber()
  @IsOptional()
  secuencia?: number;
}
