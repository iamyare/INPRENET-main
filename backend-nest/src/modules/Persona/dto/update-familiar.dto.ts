import { IsString, IsOptional, IsDateString, MaxLength } from 'class-validator';

export class UpdateFamiliarDTO {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  primerNombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  segundoNombre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  primerApellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  segundoApellido?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  tercerNombre?: string;

  @IsOptional()
  @IsDateString()
  fechaNacimiento?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  parentesco?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  dni?: string;
}
