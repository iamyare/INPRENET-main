import { IsString } from "class-validator";

export class CreateBancoDto {

    @IsString()
    nombreBanco? : string;

    @IsString()
    numeroCuenta? : string;
}
