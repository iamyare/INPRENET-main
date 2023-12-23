import { IsEmail, IsNumberString, IsOptional, IsString, isNumberString } from "class-validator";

export class CreateCentroTrabajoDto {

    @IsString()
    nombre_Centro_Trabajo : string;

    @IsNumberString()
    telefono_1 : string;

    @IsOptional()
    @IsNumberString()
    telefono_2 : string;

    @IsString()
    @IsEmail()
    correo_1 : string;

    @IsOptional()
    @IsString()
    @IsEmail()
    correo_2 : string;

    @IsString()
    apoderado_legal : string;

    @IsString()
    representante_legal : string;

    @IsString()
    @IsNumberString()
    rtn : string;

    @IsString()
    logo : string;

    @IsString()
    UbicacionCompleta : string;

    @IsString()
    @IsOptional()
    nombre_provincia? : string;
}
