import { IsInt, IsOptional, IsString, MaxLength, MinLength, IsNumber, IsDate } from 'class-validator';

export class CentroTrabajoDTO {
    @IsInt()
    idCentroTrabajo: number;

    @IsString()
    @MaxLength(40)
    cargo: string;

    @IsString()
    @MaxLength(40)
    numeroAcuerdo: string;

    @IsOptional()
    @IsNumber()
    salarioBase?: number;

    @IsString()
    @MinLength(10)
    @MaxLength(10)
    fechaIngreso: string;

    @IsOptional()
    @IsString()
    @MinLength(10)
    @MaxLength(10)
    fechaEgreso?: string;

    @IsString()
    @MaxLength(40)
    claseCliente: string;

    @IsString()
    @MaxLength(40)
    sectorEconomico: string;
}
