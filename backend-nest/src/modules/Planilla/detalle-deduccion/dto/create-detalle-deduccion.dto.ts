import { IsNumber, IsOptional, IsString, IsUUID, Length } from "class-validator";

export class CreateDetalleDeduccionDto {
    @IsUUID()
    id_deduccion: string;

    @IsUUID()
    id_afiliado: string;

    @IsString()
    id_institucion: string;

    @IsString()
    @Length(1, 20)
    monto_total: string;

    @IsString()
    @Length(1, 20)
    estado_aplicacion?: string;

    @IsString()
    @Length(4, 4)
    anio: string;

    @IsString()
    @Length(1, 20)
    mes: string;

    @IsNumber()
    monto_aplicado: number;
}
