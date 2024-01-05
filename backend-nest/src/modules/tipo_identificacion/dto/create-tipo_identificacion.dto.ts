import { IsString } from "class-validator";

export class CreateTipoIdentificacionDto {
    @IsString()
    tipo_identificacion : string;
}
