import { IsString, IsNumber, IsNotEmpty, IsOptional, IsDate } from 'class-validator';

export class CrearMovimientoDTO {
    @IsNotEmpty()
    @IsString()
    numeroCuenta: string;

    @IsNotEmpty()
    @IsNumber()
    monto: number;

    @IsNotEmpty()
    @IsString()
    descripcion: string;

    @IsOptional()
    @IsDate()
    fechaMovimiento?: Date;

    @IsNotEmpty()
    @IsString()
    tipoMovimientoDescripcion: string;

    @IsNotEmpty()
      @IsNumber()
      ANO: number;
    
      @IsNotEmpty()
      @IsNumber()
      MES: number;
}
