import { IsNotEmpty, IsOptional, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class CreateReferenciaPersonalDTO {
    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(50)
    nombre_completo: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(30)
    parentesco: string;
    
    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(200)
    direccion: string;

    @IsOptional()
    @IsString()
    @MinLength(8)
    @MaxLength(12)
    telefono_domicilio?: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(12)
    telefono_trabajo: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(12)
    telefono_personal: string;

    @IsOptional()
    @IsString()
    @Length(0, 15)
    n_identificacion?: string;
}