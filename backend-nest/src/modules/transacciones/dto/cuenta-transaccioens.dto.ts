// src/dto/crear-movimiento.dto.ts
import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class crearCuentaDTO {
    @IsNotEmpty()
    @IsString()
    numero_cuenta: string;

    @IsNotEmpty()
    @IsString()
    creado_por: string;

    @IsNotEmpty()
    @IsString()
    tipo_cuenta: string;
}