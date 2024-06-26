import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateEmpleadoDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nombre del empleado' })
  nombreEmpleado: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Estado del empleado' })
  estado: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Correo del empleado' })
  correo_1: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({ description: 'Nombre del puesto del empleado' })
  nombrePuesto: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Teléfono 1 del empleado' })
  telefono_1?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Teléfono 2 del empleado' })
  telefono_2?: string;

  @IsString()
  @IsOptional()
  @ApiProperty({ description: 'Número de identificación del empleado' })
  numero_identificacion?: string;
}
