import { IsEmail, IsOptional, IsString, MinLength } from "class-validator"

export class CreateUsuarioDto {

    @IsString()
    @IsEmail()
    correo: string;

    @IsString()
    @IsOptional()
    nombre_empleado : string

    @IsString()
    @IsOptional()
    tipo_identificacion : string

    @MinLength(1)
    @IsString()
    @IsOptional()
    numero_identificacion

    @MinLength(1)
    @IsString()
    @IsOptional()
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

    @IsString()
    @IsOptional()
    nombre_rol?: string;

    @IsString()
    @IsOptional()
    nombre_puesto? : string;

    @IsString()
    @IsOptional()
    telefono_empleado? : string;

    @IsString()
    @IsOptional()
    numero_empleado? : string;

}
