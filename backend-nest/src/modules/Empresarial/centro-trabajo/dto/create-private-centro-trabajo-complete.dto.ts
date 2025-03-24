import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePrivateCentroTrabajoDto } from './create-private-centro-trabajo.dto';
import { CreatePrivateReferenciaCentroTrabajoDto } from './create-private-referencia-centro-trabajo.dto';
import { CreatePrivateSociedadDto } from './create-private-sociedad.dto';
import { CreatePrivateSocioDto } from './create-private-socio.dto';
import { CreatePrivateSociedadSocioDto } from './create-private-sociedad-socio.dto';
import { CreatePrivatePepsDto } from './create-private-peps.dto';

export class CreatePrivateCentroTrabajoCompleteDto {
  @ValidateNested()
  @Type(() => CreatePrivateCentroTrabajoDto)
  centroTrabajo: CreatePrivateCentroTrabajoDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePrivateReferenciaCentroTrabajoDto)
  referencias: CreatePrivateReferenciaCentroTrabajoDto[];

  @ValidateNested()
  @Type(() => CreatePrivateSociedadDto)
  sociedad: CreatePrivateSociedadDto;

  @ValidateNested()
  @Type(() => CreatePrivateSocioDto)
  socio: CreatePrivateSocioDto;

  @ValidateNested()
  @Type(() => CreatePrivateSociedadSocioDto)
  sociedadSocio: CreatePrivateSociedadSocioDto;

  @ValidateNested()
  @Type(() => CreatePrivatePepsDto)
  @IsOptional()
  peps?: CreatePrivatePepsDto;
}
