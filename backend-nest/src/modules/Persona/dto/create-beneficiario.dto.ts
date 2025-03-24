import { IsInt, IsNumber, ValidateNested } from "class-validator";
import { Type } from "class-transformer";
import { NetPersonaDTO } from "./create-persona.dto";

export class BeneficiarioDto {
    @ValidateNested()
    @Type(() => NetPersonaDTO)
    datosBeneficiario: NetPersonaDTO; 

    @IsNumber()
    porcentaje: number;
}
