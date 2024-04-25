import { Type } from 'class-transformer';
import { ValidateNested, IsArray, IsNotEmpty, IsInt } from 'class-validator';
import { CreateReferenciaPersonalDTO } from './create-referencia.dto ';

export class AsignarReferenciasDTO {
    @IsNotEmpty()
    @IsInt()
    idPersona: number;

    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateReferenciaPersonalDTO)
    referencias: CreateReferenciaPersonalDTO[];
}