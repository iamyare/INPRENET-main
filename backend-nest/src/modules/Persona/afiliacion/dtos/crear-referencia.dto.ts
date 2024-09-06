import { IsNotEmpty, IsOptional, IsString, Length, Matches } from 'class-validator';
import { CrearPersonaDto } from './crear-persona.dto';

export class CrearPersonaReferenciaDto extends CrearPersonaDto {}

export class CrearReferenciaDto {
    @IsString()
    @Length(1, 50)
    @Matches(/^[^0-9]*$/, { message: 'El primer nombre no debe contener números' })
    primer_nombre: string;
  
    @IsOptional()
    @IsString()
    @Length(0, 50)
    @Matches(/^[^0-9]*$/, { message: 'El segundo nombre no debe contener números' })
    segundo_nombre?: string;
  
    @IsOptional()
    @IsString()
    @Length(0, 50)
    @Matches(/^[^0-9]*$/, { message: 'El tercer nombre no debe contener números' })
    tercer_nombre?: string;
  
    @IsString()
    @Length(1, 50)
    @Matches(/^[^0-9]*$/, { message: 'El primer apellido no debe contener números' })
    primer_apellido: string;
  
    @IsOptional()
    @IsString()
    @Length(0, 50)
    @Matches(/^[^0-9]*$/, { message: 'El segundo apellido no debe contener números' })
    segundo_apellido?: string;
  
    @IsOptional()
    @IsString()
    @Length(0, 200)
    direccion?: string;
  
    @IsOptional()
    @Matches(/^[0-9]*$/, { message: 'El teléfono de domicilio solo debe contener números' })
    @Length(0, 12)
    telefono_domicilio?: string;
  
    @Matches(/^[0-9]*$/, { message: 'El teléfono de trabajo solo debe contener números' })
    @Length(0, 12)
    telefono_trabajo: string;
  
    @Matches(/^[0-9]*$/, { message: 'El teléfono personal solo debe contener números' })
    @Length(0, 12)
    telefono_personal: string;
  
    @IsOptional()
    @IsString()
    @Length(0, 15)
    n_identificacion?: string;

    @IsNotEmpty()
    @IsString()
    parentesco: string;

    @IsNotEmpty()
    @IsString()
    tipo_referencia: string;

    @IsString()
    @Matches(/^(ACTIVO|INACTIVO)$/, { message: 'El estado debe ser ACTIVO o INACTIVO' })
    estado: string;
}
