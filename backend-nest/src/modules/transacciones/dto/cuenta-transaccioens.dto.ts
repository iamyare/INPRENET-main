import { IsString, IsNotEmpty, Length } from 'class-validator';

export class crearCuentaDTO {
    @IsNotEmpty()
    @IsString()
    creado_por: string;

    @IsNotEmpty()
    @IsString()
    tipo_cuenta: string;
}
