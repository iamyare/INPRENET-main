import { IsEmail, IsOptional, IsString, MinLength } from "class-validator"

export class CreateUsuarioDto {

    @IsString()
    @IsEmail()
    correo: string;

    @IsString()
    @MinLength(1)
    nombre : string

    @MinLength(1)
    @IsString()
    tipoIdentificacionIdIdentificacion

    @MinLength(1)
    @IsString()
    numero_identificacion

    @MinLength(1)
    @IsString()
    rolIdRol

    @MinLength(1)
    @IsString()
    archivo_identificacion

    @IsOptional()
    @IsString()
    contrasena?

    @IsOptional()
    @IsString()
    pregunta_de_usuario_1?

    @IsOptional()
    @IsString()
    respuesta_de_usuario_1?

    @IsOptional()
    @IsString()
    pregunta_de_usuario_2?

    @IsOptional()
    @IsString()
    respuesta_de_usuario_2?

    @IsOptional()
    @IsString()
    pregunta_de_usuario_3?

    @IsOptional()
    @IsString()
    respuesta_de_usuario_3?

    @IsOptional()
    @IsString()
    token?
}
