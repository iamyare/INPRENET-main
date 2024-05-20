import {IsNumber, IsOptional, Min} from 'class-validator';

export class CreateDetallePersonaDto {
    @IsNumber()
    @Min(1)
    @IsOptional()
    idPersona?: number;

    @IsNumber()
    @Min(1)
    idTipoPersona: number;

    @IsNumber()
    porcentaje: number;

    @IsNumber()
    @Min(1)
    idEstadoPersona: number;
}

