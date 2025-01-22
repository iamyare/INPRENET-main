import { IsNotEmpty, IsString } from "class-validator";

export class EmpleadoDto {
    @IsNotEmpty()
    @IsString()
    correo: string;
  
    @IsNotEmpty()
    @IsString()
    numero_empleado: string;
  
    @IsNotEmpty()
    @IsString()
    departamento: string;
  
    @IsNotEmpty()
    @IsString()
    municipio: string;
  
    @IsNotEmpty()
    @IsString()
    nombrePuesto: string;

    @IsNotEmpty()
    @IsString()
    nombreEmpleado: string;
  }
  