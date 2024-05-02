// create-referencia-personal.dto.ts

import { IsNotEmpty, IsOptional, IsString, MaxLength, MinLength, IsNumber } from 'class-validator';

export class CreateReferenciaPersonalDTO {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    nombre: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(30)
    parentesco: string;
    
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(200)
    direccion: string;


    @IsOptional()
    @IsString()
    @MaxLength(40)
    telefono_domicilio?: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(12)
    telefono_trabajo: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(12)
    telefono_personal: string;
}