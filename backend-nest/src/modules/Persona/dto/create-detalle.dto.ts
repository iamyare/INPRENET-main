import {IsNumber, Min} from 'class-validator';

export class CreateDetallePersonaDto {
    @IsNumber()
    @Min(1)
    idPersona: number;

    @IsNumber()
    @Min(1)
    idTipoPersona: number;

    @IsNumber()
    porcentaje: number;
}