import { IsNumber, IsString } from 'class-validator';

export class GeneratePlanillaDto {
  @IsString()
  tipos_persona: string;

  @IsNumber()
  v_id_planilla: number;

  @IsNumber()
  secuencia: number;
}
