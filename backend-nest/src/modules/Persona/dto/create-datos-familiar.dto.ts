import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsString } from 'class-validator';
import { NetPersonaDTO } from './create-persona.dto';

export class OtraPersonaDTO extends NetPersonaDTO {
    @IsString()
    parentezcoConFamiliar: string;
}

export class FamiliarDTO extends NetPersonaDTO {
    @IsString()
    parentezcoConPrincipal: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => OtraPersonaDTO)
    encargadoDos?: OtraPersonaDTO;
}