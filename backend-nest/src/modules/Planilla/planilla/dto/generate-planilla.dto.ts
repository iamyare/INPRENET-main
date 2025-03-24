import { IsString } from 'class-validator';

export class GeneratePlanillaDto {
  @IsString()
  tipos_persona: string;
}
