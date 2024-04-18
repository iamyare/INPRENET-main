import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateTransaccionesDto {
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
}
