import { IsArray, IsObject, ValidateNested, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { CrearPersonaDto } from './crear-persona.dto';
import { CrearDetallePersonaDto } from './crear-net_detalle_persona.dto';
import { CrearPersonaColegiosDto } from './crear-persona_colegios.dto';
import { CrearPersonaBancoDto } from './crear-persona_por_banco.dto';
import { CrearPersonaCentroTrabajoDto } from './crear-perf_pers_cent_trab.dto';
import { CrearOtraFuenteIngresoDto } from './crear-otra_fuente_ingreso.dto';
import { CrearReferenciaDto } from './crear-referencia.dto';
import { CrearBeneficiarioDto } from './crear-beneficiario.dto';
import { CrearDiscapacidadDto } from './crear-discapacidad.dto';
import { CrearFamiliaDto } from './crear-familiar.dto';
import { CrearPepsDto } from './crear-peps.dto';

export class CrearDatosDto {
  @IsObject()
  @ValidateNested()
  @Type(() => CrearPersonaDto)
  persona: CrearPersonaDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearPepsDto)
  peps?: CrearPepsDto[];

  @IsObject()
  @ValidateNested()
  @Type(() => CrearDetallePersonaDto)
  detallePersona: CrearDetallePersonaDto;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearPersonaColegiosDto)
  colegiosMagisteriales: CrearPersonaColegiosDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearPersonaBancoDto)
  bancos: CrearPersonaBancoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearPersonaCentroTrabajoDto)
  centrosTrabajo: CrearPersonaCentroTrabajoDto[];
  
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CrearOtraFuenteIngresoDto)
  otrasFuentesIngreso?: CrearOtraFuenteIngresoDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearReferenciaDto)
  referencias: CrearReferenciaDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CrearBeneficiarioDto)
  beneficiarios: CrearBeneficiarioDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CrearDiscapacidadDto)
  discapacidades?: CrearDiscapacidadDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CrearFamiliaDto)
  familiares?: CrearFamiliaDto[];
}
