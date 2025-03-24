import { IsString, IsNotEmpty, MaxLength, IsOptional, IsDate } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePrivatePepsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  cargo: string;

  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  fecha_inicio: Date;

  @IsDate()
  @IsOptional()
  @Type(() => Date)
  fecha_fin?: Date;

  @IsString()
  @MaxLength(255)
  @IsOptional()
  referencias?: string;
}
