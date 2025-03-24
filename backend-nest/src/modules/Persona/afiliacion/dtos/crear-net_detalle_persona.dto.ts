import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CrearDetallePersonaDto {
    @IsNotEmpty()
    @IsString()
    eliminado: string;

    @IsNotEmpty()
    @IsString()
    tipo_persona: string;

    @IsNotEmpty()
    @IsString()
    nombre_estado: string;

    @IsOptional()
    @IsString()
    voluntario: string = 'NO';
}
