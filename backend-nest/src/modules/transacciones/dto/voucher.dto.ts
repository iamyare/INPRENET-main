// src/dto/crear-movimiento.dto.ts
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CrearMovimientoDTO {
    @IsNotEmpty()
    @IsString()
    numeroCuenta: string;

    @IsNotEmpty()
    @IsNumber()
    monto: number;

    @IsNotEmpty()
    @IsString()
    descripcion: string;

    @IsNotEmpty()
    @IsString()
    tipoMovimientoDescripcion: string;
}
