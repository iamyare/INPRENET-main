import { IsDateString, IsOptional, IsString } from "class-validator";

export class CreatePerfAfilCentTrabDto { 

    @IsString()
    @IsOptional()
    cargo : string;
    
    @IsString()
    @IsOptional()
    sector_economico : string;
    
    @IsString()
    @IsOptional()
    actividad_economica : string;

    @IsString()
    @IsOptional()
    clase_cliente : string;
    
    @IsDateString()
    @IsOptional()
    fecha_ingreso : string;

    @IsDateString()
    @IsOptional()
    fecha_pago : string;
    
    @IsString()
    @IsOptional()
    numero_acuerdo : string;

    @IsString()
    @IsOptional()
    nombre_centroTrabajo? : string;

}