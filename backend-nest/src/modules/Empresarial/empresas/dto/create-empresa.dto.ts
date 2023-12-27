import { IsString } from "class-validator";

export class CreateEmpresaDto {

    @IsString()
    razon_social : string;

    @IsString()
    rtn : string;

    @IsString()
    apoderado_legal : string;

    @IsString()
    representante_legal : string;

    @IsString()
    logo : string;

    @IsString()
    direccion: string;

    @IsString()
    telefono_1 : string;

    @IsString()
    telefono_2 : string;

    @IsString()
    correo_electronico: string;

}
