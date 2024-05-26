import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString, MinLength } from "class-validator"

export class CreateUsuarioDto {

    @IsString()
    @IsEmail()
    correo: string;

    @IsString()
    @IsOptional()
    nombre_empleado : string

    @IsOptional()
    @IsString()
    tipo_identificacion : string;

    @MinLength(1)
    @IsString()
    @IsOptional()
    numero_identificacion : string

    @IsOptional()
    @ApiPropertyOptional({ type: 'string', format: 'binary' })
    archivo_identificacion?: any;

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

    @IsNumber()
    @IsOptional()
    telefono_empleado? : string;

    @IsNumber()
    @IsOptional()
    numero_empleado? : string;

}
