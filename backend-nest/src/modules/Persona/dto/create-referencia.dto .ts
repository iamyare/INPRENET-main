import { IsNotEmpty, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator';

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

    @IsString()
    @IsOptional()
    @MaxLength(15)
    @Matches(/^[0-9]{13}$|^[0-9]{4}-[0-9]{4}-[0-9]{5}$/, {
        message: "El DNI debe contener 13 caracteres numéricos en formato continuo o en el formato NNNN-NNNN-NNNNN.",
    })
    dni?: string;
}