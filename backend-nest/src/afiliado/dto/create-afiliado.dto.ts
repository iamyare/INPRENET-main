import { IsEmail, IsOptional, IsString, IsDateString, IsNumber, IsUUID } from "class-validator"

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
    
    @IsNumber()
    cantidad_dependientes : number;
    
    @IsNumber()
    cantidad_hijos : number;
    
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
    salario_neto : string;

    //datos de tabla de referencia personal
    @IsString()
    @IsOptional()
    nombre : string;
    
    @IsString()
    @IsOptional()
    direccion : string;
    
    @IsString()
    @IsOptional()
    parentesco : string;

    @IsOptional()
    @IsString()
    telefono_domicilio : string;

    @IsOptional()
    @IsString()
    telefono_trabajo : string;
    
    @IsString()
    @IsOptional()
    telefono_celular : string;

    @IsString()
    @IsOptional()
    tipo_identificacion?: string;

    @IsString()
    @IsOptional()
    nombre_pais?: string;

    @IsString()
    @IsOptional()
    nombre_provincia?: string;

    @IsString()
    @IsOptional()
    nombre_centroTrabajo?

}
