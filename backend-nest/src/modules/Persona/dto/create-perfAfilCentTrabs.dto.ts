import { IsInt, IsOptional, IsString, MaxLength, MinLength, IsNumber, IsDate, IsDateString, Min, Matches } from 'class-validator';

export class CentroTrabajoDTO {
    @IsInt()
    idCentroTrabajo: number;

    @IsString()
    @MaxLength(40)
    cargo: string;

    @IsString()
    @MaxLength(40)
    @IsOptional()
    numeroAcuerdo?: string;

    @IsNumber()
    @Min(0) 
    salarioBase: number;

    @IsString()
    @Matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/, {
        message: "Fecha de ingreso debe estar en el formato d/m/aaaa.",
    })
    fechaIngreso: string;
    
    @IsOptional()
    @IsString()
    @Matches(/^\d{1,2}\/\d{1,2}\/\d{4}$/, {
        message: "Fecha de egreso debe estar en el formato d/m/aaaa.",
    })
    fechaEgreso?: string;

    @IsString()
    @MaxLength(40)
    @IsOptional()
    estado?:string
}
