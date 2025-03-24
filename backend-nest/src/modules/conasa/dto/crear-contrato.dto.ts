import { IsOptional, ValidateNested } from "class-validator";
import { AsignarContratoDto } from "./asignar-contrato.dto";
import { Type } from "class-transformer";
import { CrearBeneficiarioDto } from "./beneficiarios-conasa.dto";

export class ManejarTransaccionDto {
    @ValidateNested()
    @Type(() => AsignarContratoDto)
    contrato: AsignarContratoDto;
  
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CrearBeneficiarioDto)
    beneficiarios?: CrearBeneficiarioDto[];
  }
  