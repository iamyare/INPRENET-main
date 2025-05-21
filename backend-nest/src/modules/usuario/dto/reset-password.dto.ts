import { IsString, IsNotEmpty, Length, Matches } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @Length(8, 20)
  @Matches(/^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).+$/, {
    message: 'La contraseña debe tener al menos una letra mayúscula, una minúscula y un número',
  })
  nuevaContrasena: string;
}