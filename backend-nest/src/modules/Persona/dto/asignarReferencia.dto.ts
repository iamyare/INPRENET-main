import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsNotEmpty, IsInt, IsOptional } from 'class-validator';
import { CreateReferenciaPersonalDTO } from './create-referencia.dto ';

export class AsignarReferenciasDTO {

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateReferenciaPersonalDTO)
    referencias: CreateReferenciaPersonalDTO[];
}