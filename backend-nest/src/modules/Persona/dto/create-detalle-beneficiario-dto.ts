import { IsInt, IsNumber, Min, Validate } from 'class-validator';

export class CreateDetalleBeneficiarioDto {
    @IsInt()
    @Min(1)
    idPersona: number;

    @IsInt()
    @Min(1)
    idCausante: number;

    @IsNumber()
    @Min(0)
    porcentaje: number;

    @IsInt()
    @Min(1)
    idCausantePadre: number;

    @IsNumber()
    @Min(1)
    idTipoPersona: number;

    @IsNumber()
    @Min(1)
    idEstadoPersona: number;

    @IsNumber()
    @Min(1)
    idDetallePersona: number;
}
