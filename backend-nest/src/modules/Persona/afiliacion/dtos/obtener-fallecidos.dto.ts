import { IsInt, IsNotEmpty, Min, Max } from 'class-validator';

export class ObtenerFallecidosDto {
    @IsInt({ message: 'mes debe ser un número entero' })
    @IsNotEmpty({ message: 'mes es obligatorio' })
    @Min(1, { message: 'mes no puede ser menor que 1' })
    @Max(12, { message: 'mes no puede ser mayor que 12' })
    mes: number;

    @IsInt({ message: 'anio debe ser un número entero' })
    @IsNotEmpty({ message: 'anio es obligatorio' })
    anio: number;
}
