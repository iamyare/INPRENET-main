import { IsNotEmpty, IsNumber, IsOptional, IsString, Length } from 'class-validator';

export class CreateDetalleDeduccionDto {
    @IsNotEmpty({ message: 'El n_identificacion de la persona no debe estar vacío.' })
    @IsString({ message: 'El n_identificacion debe ser una cadena de texto.' })
    n_identificacion: string;

    @IsNotEmpty({ message: 'El id_planilla no debe estar vacío.' })
    @IsNumber({}, { message: 'El id_planilla debe ser numérico.' })
    id_planilla: number;

    @IsNumber({}, { message: 'El valor de codigo deduccion debe ser numérico.' })
    codigo_deduccion: number;

    @IsNumber({}, { message: 'El año debe ser numérico.' })
    anio: number;

    @IsNumber({}, { message: 'El mes debe ser numérico.' })
    mes: number;

    @IsNumber({}, { message: 'El monto total debe ser numérico.' })
    monto_total: number;
}
