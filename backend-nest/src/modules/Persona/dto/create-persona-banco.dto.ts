// create-persona-banco.dto.ts
import { IsInt, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePersonaBancoDTO {
    @IsNotEmpty()
    @IsInt()
    idBanco: number;

    @IsNotEmpty()
    @IsString()
    numCuenta: string;

    @IsNotEmpty()
    @IsString()
    estado: string;
}
