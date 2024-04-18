import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class VoucherDto {
    @IsString()
    @IsNotEmpty()
    nombreCompleto: string;

    @IsString()
    @IsNotEmpty()
    dni: string;

    @IsString()
    @IsNotEmpty()
    numeroCuenta: string;

    @IsString()
    @IsNotEmpty()
    descripcionMovimiento: string;

    @IsNumber()
    monto: number;

    @IsString()
    fecha: string;

    @IsString()
    tipoMovimiento: string; // Added property
}
