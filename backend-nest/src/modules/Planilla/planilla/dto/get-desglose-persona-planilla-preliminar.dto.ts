import { IsString } from 'class-validator';

export class GetDesglosePersonaPlanillaPreliminarDto {
  @IsString()
  proceso: string;

  @IsString()
  n_identificacion: string;
}
