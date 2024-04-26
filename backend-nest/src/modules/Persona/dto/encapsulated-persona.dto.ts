import { Type } from 'class-transformer';
import { IsArray, IsOptional, ValidateNested } from 'class-validator';
import { NetPersonaDTO } from './create-persona.dto';
import { CentroTrabajoDTO } from './create-perfAfilCentTrabs.dto';
import { CreateReferenciaPersonalDTO } from './create-referencia.dto ';
import { CreatePersonaBancoDTO } from './create-persona-banco.dto';
import { BeneficiarioDto } from './create-beneficiario.dto';
import { Net_Persona_Colegios } from 'src/modules/transacciones/entities/net_persona_colegios.entity';
import { NetPersonaColegiosDTO } from './create-persona-colegio.dto';

export class EncapsulatedPersonaDTO {
    @ValidateNested()
    @Type(() => NetPersonaDTO)
    datosGenerales: NetPersonaDTO;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CentroTrabajoDTO)
    centrosTrabajo: CentroTrabajoDTO[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => CreateReferenciaPersonalDTO)
    referenciasPersonales?: CreateReferenciaPersonalDTO[];

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreatePersonaBancoDTO)
    @IsOptional()
    bancos?: CreatePersonaBancoDTO[];

    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => BeneficiarioDto)
    beneficiarios?: BeneficiarioDto[];
    
    @IsArray()
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => NetPersonaColegiosDTO)
    colegiosMagisteriales?: NetPersonaColegiosDTO[];

}
