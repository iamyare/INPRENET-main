// complete-registration.dto.ts
import { IsString, IsEmail, IsNotEmpty, Length, Matches } from 'class-validator';

export class CompleteRegistrationDto {
  @IsEmail()
  @IsNotEmpty()
  correo: string;

  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$/, {
    message: 'Password too weak',
  })
  contrasena: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  pregunta_de_usuario_1: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  respuesta_de_usuario_1: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  pregunta_de_usuario_2: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  respuesta_de_usuario_2: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  pregunta_de_usuario_3: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100)
  respuesta_de_usuario_3: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  telefonoEmpleado: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 255)
  numero_identificacion: string;

  @IsString()
  @IsNotEmpty()
  foto_empleado: Buffer;
}
