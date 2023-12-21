import { IsEmail, IsOptional, IsString, IsDateString } from "class-validator"

export class CreateAfiliadoDto {

    //Datos de tabla Afiliado
    @IsString()
    dni : string;

    @IsString()
    estado_civil : string;
    
    @IsString()
    tipo_cotizante : string;
    
    @IsString()
    primer_nombre : string;
    
    @IsOptional()
    @IsString()
    segundo_nombre : string;
   
    @IsOptional()
    @IsString()
    tercer_nombre : string;

    @IsString()
    primer_apellido : string;
    
    @IsOptional()
    @IsString()
    segundo_apellido : string;

    @IsDateString()
    fecha_nacimiento : string;

    @IsString()
    sexo : string;
    
    @IsString()
    cantidad_dependientes : string;
    
    @IsString()
    cantidad_hijos : string;
    
    @IsString()
    profesion : string;
    
    @IsString()
    representacion : string;
    
    @IsString()
    telefono_1 : string;

    @IsOptional()
    @IsString()
    telefono_2 : string;
    
    @IsString()
    @IsEmail()
    correo_1 : string;

    @IsOptional()
    @IsString()
    @IsEmail()
    correo_2 : string;
    
    @IsString()
    archivo_identificacion : string;
    
    @IsString()
    direccion_residencia : string;
    
    @IsString()
    estado : string;

    //datos de tabla perfil-afil-centro-trab
    @IsString()
    colegio_magisterial : string;
    
    @IsString()
    numero_carnet : string;
    
    @IsString()
    cargo : string;
    
    @IsString()
    sector_economico : string;
    
    @IsString()
    actividad_economica : string;
    
    @IsDateString()
    fecha_ingreso : string;

    @IsDateString()
    fecha_pago : string;
    
    @IsString()
    numero_acuerdo : string;
    
    @IsString()
    salario_neto : string;

    //datos de tabla de referencia personal
    @IsString()
    nombre : string;
    
    @IsString()
    direccion : string;
    
    @IsString()
    parentesco : string;

    @IsOptional()
    @IsString()
    telefono_domicilio : string;

    @IsOptional()
    @IsString()
    telefono_trabajo : string;
    
    @IsString()
    telefono_celular : string;

    paisIdPais : string;
    tipoIdentificacionIdIdentificacion : string;
    provinciaIdProvincia : string;
    padreIdAfiliado : string;
}
