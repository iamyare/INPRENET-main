import { IsNotEmpty, IsString, IsEmail } from 'class-validator'; // Asegúrate de tener class-validator y class-transformer instalados

export class LoginDto {
  @IsNotEmpty({ message: 'El nombre de usuario (email) no puede estar vacío.' })
  @IsEmail({}, { message: 'Debe proporcionar un email válido.' }) // Asumiendo que el username es un email
  readonly username: string;

  @IsNotEmpty({ message: 'La contraseña no puede estar vacía.' })
  @IsString()
  readonly password: string;
}
