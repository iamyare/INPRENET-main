import { IsNotEmpty, IsString, IsNumber } from "class-validator";

export class CreateP60RentaDto {
    @IsNotEmpty()
    @IsString()
    DNI: string;

    @IsNotEmpty()
    @IsString()
    PRIMER_NOMBRE: string;

    @IsNotEmpty()
    @IsString()
    SEGUNDO_NOMBRE: string;

    @IsNotEmpty()
    @IsString()
    PRIMER_APELLIDO: string;

    @IsNotEmpty()
    @IsString()
    SEGUNDO_APELLIDO: string;

    @IsNotEmpty()
    @IsString()
    ESTATUS: string;

    @IsNotEmpty()
    @IsNumber()
    LOTE: number;

    @IsNotEmpty()
    @IsString()
    TELEFONICO: string;
}
