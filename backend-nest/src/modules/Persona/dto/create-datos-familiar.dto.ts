import { Type } from 'class-transformer';
import { ValidateNested, IsOptional, IsString } from 'class-validator';
import { NetPersonaDTO } from './create-persona.dto';

export class OtraPersonaDTO extends NetPersonaDTO {
    @IsString()
    parentescoConFamiliar: string;
}

export class FamiliarDTO extends NetPersonaDTO {
    @IsString()
    parentescoConPrincipal: string;

    @IsOptional()
    @ValidateNested()
    @Type(() => OtraPersonaDTO)
    encargadoDos?: OtraPersonaDTO;
}