--------------------------------------------------------
-- Archivo creado  - viernes-febrero-23-2024   
--------------------------------------------------------
--------------------------------------------------------
--  TABLES
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Table afiliado
--------------------------------------------------------

  CREATE TABLE net_afiliado 
   (	id_afiliado VARCHAR2(36 BYTE), 
	dni VARCHAR2(40 BYTE), 
	estado_civil VARCHAR2(40 BYTE), 
	primer_nombre VARCHAR2(40 BYTE), 
	segundo_nombre VARCHAR2(40 BYTE), 
	tercer_nombre VARCHAR2(40 BYTE), 
	primer_apellido VARCHAR2(40 BYTE), 
	segundo_apellido VARCHAR2(40 BYTE), 
	sexo CHAR(1 BYTE), 
	cantidad_dependientes NUMBER, 
	cantidad_hijos NUMBER, 
	profesion VARCHAR2(30 BYTE), 
	representacion VARCHAR2(40 BYTE), 
	telefono_1 VARCHAR2(12 BYTE), 
	telefono_2 VARCHAR2(12 BYTE), 
	correo_1 VARCHAR2(40 BYTE), 
	correo_2 VARCHAR2(40 BYTE), 
	colegio_magisterial VARCHAR2(40 BYTE), 
	numero_carnet VARCHAR2(40 BYTE), 
	direccion_residencia VARCHAR2(200 BYTE), 
	estado VARCHAR2(40 BYTE) DEFAULT 'ACTIVO', 
	salario_base NUMBER, 
	fecha_nacimiento DATE, 
	archivo_identificacion VARCHAR2(200 BYTE), 
	id_tipo_identificacion VARCHAR2(36 BYTE), 
	id_pais VARCHAR2(36 BYTE), 
	id_provincia VARCHAR2(36 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
COMMENT ON TABLE net_afiliado IS 'Esta tabla almacena los datos generales de los afiliados y beneficiarios.';
--------------------------------------------------------
--  DDL for Table afiliados_por_banco
--------------------------------------------------------

  CREATE TABLE net_afiliados_por_banco 
   (	id_af_banco VARCHAR2(36 BYTE), 
	num_cuenta VARCHAR2(20 BYTE), 
	id_banco VARCHAR2(36 BYTE), 
	id_afiliado VARCHAR2(36 BYTE)
   )  TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
COMMENT ON TABLE net_afiliados_por_banco IS 'Esta tabla almacena los datos bancarios por cada afiliado.';
--------------------------------------------------------
--  DDL for Table banco
--------------------------------------------------------

  CREATE TABLE net_banco 
   (	id_banco VARCHAR2(36 BYTE), 
	nombre_banco VARCHAR2(30 BYTE), 
	cod_banco VARCHAR2(10 BYTE)
   )  TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
COMMENT ON TABLE net_banco IS 'Esta tabla almacena los datos de cada uno de los bancos.';
--------------------------------------------------------
--  DDL for Table beneficio
--------------------------------------------------------

  CREATE TABLE net_beneficio 
   (	id_beneficio VARCHAR2(36 BYTE), 
	nombre_beneficio VARCHAR2(30 BYTE), 
	descripcion_beneficio VARCHAR2(200 BYTE), 
	periodicidad VARCHAR2(255 BYTE), 
	numero_rentas_max NUMBER DEFAULT 0
   )  TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
COMMENT ON TABLE net_beneficio IS 'Esta tabla almacena los datos de cada uno de los beneficios.';
--------------------------------------------------------
--  DDL for Table centro_trabajo
--------------------------------------------------------

  CREATE TABLE net_centro_trabajo 
   (	id_centro_trabajo VARCHAR2(36 BYTE), 
	nombre_Centro_Trabajo VARCHAR2(40 BYTE), 
	telefono_1 VARCHAR2(30 BYTE), 
	telefono_2 VARCHAR2(30 BYTE), 
	correo_1 VARCHAR2(40 BYTE), 
	correo_2 VARCHAR2(50 BYTE), 
	apoderado_legal NVARCHAR2(50), 
	representante_legal NVARCHAR2(50), 
	rtn NVARCHAR2(14), 
	logo NVARCHAR2(300), 
	UbicacionCompleta NVARCHAR2(200), 
	id_provincia VARCHAR2(36 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
COMMENT ON TABLE net_centro_trabajo IS 'Esta tabla almacena los datos de los centros de trabajo es decir centros educativos.';
      
--------------------------------------------------------
--  DDL for Table deduccion
--------------------------------------------------------

  CREATE TABLE net_deduccion 
   (	id_deduccion VARCHAR2(36 BYTE), 
	nombre_deduccion VARCHAR2(50 BYTE), 
	descripcion_deduccion VARCHAR2(100 BYTE), 
	codigo_deduccion NUMBER, 
	prioridad NUMBER, 
	id_tipo_deduccion VARCHAR2(36 BYTE)
   )  TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
COMMENT ON TABLE net_deduccion IS 'Esta tabla almacena los datos de los tipos de deducciones.';
--------------------------------------------------------
--  DDL for Table detalle_afiliado
--------------------------------------------------------

  CREATE TABLE net_detalle_afiliado 
   (	id_detalle_afiliado VARCHAR2(36 BYTE), 
	tipo_afiliado VARCHAR2(40 BYTE), 
	porcentaje NUMBER, 
	id_detalle_afiliado_padre VARCHAR2(36 BYTE), 
	id_afiliado VARCHAR2(36 BYTE)
   )  TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
COMMENT ON TABLE net_detalle_afiliado IS 'Esta tabla hace referencia si el docente tiene beneficiario o no.';
--------------------------------------------------------
--  DDL for Table detalle_beneficio_afiliado
--------------------------------------------------------

  CREATE TABLE net_detalle_beneficio_afiliado 
   (	id_detalle_ben_afil VARCHAR2(36 BYTE), 
	periodoInicio DATE, 
	periodoFinalizacion DATE, 
	num_rentas_aplicadas NUMBER DEFAULT 0, 
	monto_total NUMBER(10,2), 
	monto_por_periodo NUMBER(10,2), 
	id_afiliado VARCHAR2(36 BYTE), 
	id_beneficio VARCHAR2(36 BYTE)
   )  TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
COMMENT ON TABLE net_detalle_beneficio_afiliado IS 'Esta tabla almacena los datos de los beneficios por cada afiliado.';
--------------------------------------------------------
--  DDL for Table detalle_deduccion
--------------------------------------------------------

  CREATE TABLE net_detalle_deduccion 
   (	id_ded_deduccion VARCHAR2(36 BYTE), 
	monto_total NUMBER(10,2), 
	monto_aplicado NUMBER(10,2), 
	estado_aplicacion VARCHAR2(20 BYTE) DEFAULT 'NO COBRADA', 
	anio NUMBER, 
	mes NUMBER, 
	fecha_aplicado TIMESTAMP (6) DEFAULT CURRENT_TIMESTAMP, 
	id_deduccion VARCHAR2(36 BYTE), 
	id_afiliado VARCHAR2(36 BYTE), 
	id_institucion NUMBER, 
	id_planilla VARCHAR2(36 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
COMMENT ON TABLE net_detalle_deduccion IS 'Esta tabla almacena los datos de las deducciones que envian los terceros y tambien los que no son de terceros.';
--------------------------------------------------------
--  DDL for Table detalle_pago_beneficio
--------------------------------------------------------

  CREATE TABLE net_detalle_pago_beneficio 
   (	id_beneficio_planilla VARCHAR2(36 BYTE), 
	estado VARCHAR2(255 BYTE) DEFAULT 'NO PAGADA', 
	metodo_pago VARCHAR2(255 BYTE), 
	monto_a_pagar NUMBER(10,2), 
	id_planilla VARCHAR2(36 BYTE), 
	id_beneficio_afiliado VARCHAR2(36 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
      COMMENT ON TABLE net_detalle_pago_beneficio IS 'Esta tabla  almacena los datos de pago de los beneficios.';
--------------------------------------------------------
--  DDL for Table empleado
--------------------------------------------------------

  CREATE TABLE net_empleado 
   (	id_empleado VARCHAR2(36 BYTE), 
	nombre_empleado VARCHAR2(30 BYTE), 
	nombre_puesto VARCHAR2(40 BYTE), 
	numero_empleado VARCHAR2(255 BYTE), 
	telefono_empleado VARCHAR2(255 BYTE), 
	numero_identificacion VARCHAR2(255 BYTE), 
	archivo_identificacion VARCHAR2(255 BYTE), 
	id_usuario VARCHAR2(36 BYTE), 
	id_tipoIdentificacion VARCHAR2(36 BYTE)
   )  TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
COMMENT ON TABLE net_empleado IS 'Esta tabla almacena los datos de los empleados de INPREMA';
--------------------------------------------------------
--  DDL for Table empleado_empresa
--------------------------------------------------------

  CREATE TABLE net_empleado_empresa 
   (	id VARCHAR2(36 BYTE), 
	id_empresa VARCHAR2(36 BYTE), 
	id_empleado VARCHAR2(36 BYTE)
   )  TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
      COMMENT ON TABLE net_empleado_empresa IS 'Esta tabla a hace referencia a que empresa pertenece el empleado.';

--------------------------------------------------------
--  DDL for Table empresa
--------------------------------------------------------

  CREATE TABLE net_empresa 
   (	id_empresa VARCHAR2(36 BYTE), 
	razon_social VARCHAR2(255 BYTE), 
	rtn VARCHAR2(255 BYTE), 
	apoderado_legal VARCHAR2(255 BYTE), 
	representante_legal VARCHAR2(255 BYTE), 
	logo VARCHAR2(255 BYTE), 
	direccion VARCHAR2(255 BYTE), 
	telefono_1 CHAR(1 BYTE), 
	telefono_2 CHAR(1 BYTE), 
	correo_electronico VARCHAR2(255 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
      COMMENT ON TABLE net_detalle_afiliado IS 'Esta tabla almacena hace referencia si el docente tiene beneficiario o no.';
--------------------------------------------------------
--  DDL for Table institucion
--------------------------------------------------------

 CREATE TABLE net_institucion (    
    id_institucion NUMBER ,
    nombre_institucion VARCHAR2(40 BYTE), 
    tipo_institucion VARCHAR2(40 BYTE)
) 
TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
COMMENT ON TABLE net_institucion IS 'Esta tabla almacena los datos de las instituciones que aplican deducciones.';
--------------------------------------------------------
--  DDL for Table municipio
--------------------------------------------------------

  CREATE TABLE net_municipio 
   (	id_municipio VARCHAR2(36 BYTE), 
	nombre_municipio VARCHAR2(30 BYTE), 
	provinciaIdProvincia VARCHAR2(36 BYTE)
   )  TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
--------------------------------------------------------
--  DDL for Table pais
--------------------------------------------------------

  CREATE TABLE net_pais 
   (	id_pais VARCHAR2(36 BYTE), 
	nombre_pais VARCHAR2(20 BYTE), 
	nacionalidad VARCHAR2(20 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
--------------------------------------------------------
--  DDL for Table perf_afil_cent_trab
--------------------------------------------------------

  CREATE TABLE net_perf_afil_cent_trab 
   (	id_perf_afil_cent_trab VARCHAR2(36 BYTE), 
	cargo VARCHAR2(40 BYTE), 
	sector_economico VARCHAR2(40 BYTE), 
	actividad_economica VARCHAR2(40 BYTE), 
	clase_cliente VARCHAR2(40 BYTE), 
	fecha_ingreso DATE, 
	fecha_pago DATE, 
	numero_acuerdo VARCHAR2(40 BYTE), 
	id_detalle_afiliado VARCHAR2(36 BYTE), 
	id_centroTrabajo VARCHAR2(36 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
--------------------------------------------------------
--  DDL for Table planilla
--------------------------------------------------------

  CREATE TABLE net_planilla 
   (	id_planilla VARCHAR2(36 BYTE), 
	codigo_planilla VARCHAR2(255 BYTE), 
	fecha_apertura DATE DEFAULT SYSDATE, 
	fecha_cierre DATE DEFAULT NULL, 
	secuencia NUMBER, 
	estado VARCHAR2(255 BYTE) DEFAULT 'ACTIVA', 
	periodoInicio VARCHAR2(255 BYTE), 
	periodoFinalizacion VARCHAR2(255 BYTE), 
	id_tipo_planilla VARCHAR2(36 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
      COMMENT ON TABLE net_planilla IS 'Esta tabla almacena los datos de las planillas';
--------------------------------------------------------
--  DDL for Table provincia
--------------------------------------------------------

  CREATE TABLE net_provincia 
   (	id_provincia VARCHAR2(36 BYTE), 
	nombre_provincia VARCHAR2(30 BYTE), 
	paisIdPais VARCHAR2(36 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;

--------------------------------------------------------
--  DDL for Table referencia_personal
--------------------------------------------------------

  CREATE TABLE net_referencia_personal 
   (	id_ref_personal VARCHAR2(36 BYTE), 
	nombre VARCHAR2(50 BYTE), 
	direccion VARCHAR2(200 BYTE), 
	parentesco VARCHAR2(30 BYTE), 
	telefono_domicilio VARCHAR2(40 BYTE), 
	telefono_trabajo VARCHAR2(12 BYTE), 
	telefono_celular VARCHAR2(12 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
      COMMENT ON TABLE net_referencia_personal IS 'Esta tabla almacena almacena los datos de las referencias personales';
--------------------------------------------------------
--  DDL for Table ref_personal_afiliado
--------------------------------------------------------

  CREATE TABLE net_ref_personal_afiliado 
   (	id_ReferPersAfil VARCHAR2(36 BYTE), 
	id_afiliado VARCHAR2(36 BYTE), 
	refPersonalIdRefPersonal VARCHAR2(36 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
      COMMENT ON TABLE net_ref_personal_afiliado IS 'Esta tabla hace referencia de quien es la referencia personal.';
--------------------------------------------------------
--  DDL for Table rol
--------------------------------------------------------

  CREATE TABLE net_rol 
   (	id_rol VARCHAR2(36 BYTE), 
	nombre_rol VARCHAR2(20 BYTE), 
	descripcion VARCHAR2(200 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;

      COMMENT ON TABLE net_rol IS 'Esta tabla almacena los tipos de roles de los usuarios en el sistema.';
--------------------------------------------------------
--  DDL for Table tipo_deduccion
--------------------------------------------------------

  CREATE TABLE net_tipo_deduccion 
   (	id_tipo_deduccion VARCHAR2(36 BYTE), 
	nombre_tipo_deduccion VARCHAR2(100 BYTE)
   )  TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
      COMMENT ON TABLE net_tipo_deduccion IS 'Esta tabla almacena los datos de los tipos de deduccion.';
--------------------------------------------------------
--  DDL for Table tipo_identificacion
--------------------------------------------------------

  CREATE TABLE net_tipo_identificacion 
   (	id_identificacion VARCHAR2(36 BYTE), 
	net_tipo_identificacion VARCHAR2(40 BYTE)
   )  TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
      COMMENT ON TABLE net_tipo_identificacion IS 'Esta tabla almacena los datos de los tipos de identificacion.';
--------------------------------------------------------
--  DDL for Table tipo_planilla
--------------------------------------------------------

  CREATE TABLE net_tipo_planilla 
   (	id_tipo_planilla VARCHAR2(36 BYTE), 
	nombre_planilla VARCHAR2(100 BYTE), 
	descripcion VARCHAR2(200 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
      COMMENT ON TABLE net_tipo_planilla IS 'Esta tabla almacena los datos de los tipos de planilla';
--------------------------------------------------------
--  DDL for Table usuario
--------------------------------------------------------

  CREATE TABLE net_usuario 
   (	id_usuario VARCHAR2(36 BYTE), 
	correo VARCHAR2(200 BYTE), 
	contrasena VARCHAR2(200 BYTE), 
	fecha_creacion TIMESTAMP (6) DEFAULT CURRENT_TIMESTAMP, 
	fecha_verificacion DATE, 
	fecha_modificacion VARCHAR2(50 BYTE), 
	estado VARCHAR2(50 BYTE) DEFAULT 'INACTIVO', 
	pregunta_de_usuario_1 VARCHAR2(100 BYTE), 
	respuesta_de_usuario_1 VARCHAR2(100 BYTE), 
	pregunta_de_usuario_2 VARCHAR2(100 BYTE), 
	respuesta_de_usuario_2 VARCHAR2(100 BYTE), 
	pregunta_de_usuario_3 VARCHAR2(100 BYTE), 
	respuesta_de_usuario_3 VARCHAR2(100 BYTE), 
	id_rol VARCHAR2(36 BYTE)
   ) TABLESPACE INPRENET_DATA
      PCTUSED    0
      PCTFREE    10
      INITRANS   1
      MAXTRANS   255
      STORAGE    (
        INITIAL          64K
        NEXT             1M
        MINEXTENTS       1
        MAXEXTENTS       UNLIMITED
        PCTINCREASE      0
        BUFFER_POOL      DEFAULT
      )
      LOGGING 
      NOCOMPRESS 
      NOCACHE
      NOPARALLEL
      MONITORING;
      COMMENT ON TABLE net_usuario IS 'Esta tabla almacena los datos de los usuarios';


--------------------------------------------------------
--  INDEXES
--------------------------------------------------------

--------------------------------------------------------
--  DDL for Index UQ_DNI_net_afiliado
--------------------------------------------------------

    CREATE UNIQUE INDEX UQ_DNI_net_afiliado ON net_afiliado (dni) 
    LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
 ;
--------------------------------------------------------
--  DDL for Index UQ_id_afiliado_net_afiliado
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_id_afiliado_net_afiliado ON net_afiliado (id_afiliado)
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL 
   ;
--------------------------------------------------------
--  DDL for Index UQ_idAfilBan_netAfilBanco
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idAfilBan_netAfilBanco ON net_afiliados_por_banco (id_af_banco) 
  LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
  ;
--------------------------------------------------------
--  DDL for Index UQ_numCuen_netAfilBanco
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_numCuen_netAfilBanco ON net_afiliados_por_banco (num_cuenta) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idBanco_netBanco
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idBanco_netBanco ON net_banco (id_banco) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_nomBanc_netBanco
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_nomBanc_netBanco ON net_banco (nombre_banco) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_net_banco_cod_banco
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_net_banco_cod_banco ON net_banco (cod_banco) 
  LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
  ;
--------------------------------------------------------
--  DDL for Index UQ_idBen_netBen
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idBen_netBen ON net_beneficio (id_beneficio) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idCenTrab_netCenTrab
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idCenTrab_netCenTrab ON net_centro_trabajo (id_centro_trabajo) 
  LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
  ;
--------------------------------------------------------
--  DDL for Index UQ_corr1_netCenTrab
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_corr1_netCenTrab ON net_centro_trabajo (correo_1) 
  LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
  ;
--------------------------------------------------------
--  DDL for Index UQ_rtn_netCenTrab
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_rtn_netCenTrab ON net_centro_trabajo (rtn) 
  LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
  ;
--------------------------------------------------------
--  DDL for Index UQ_idDed_netDed
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idDed_netDed ON net_deduccion (id_deduccion) 
  LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
  ;
--------------------------------------------------------
--  DDL for Index UQ_codDed_netDed
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_codDed_netDed ON net_deduccion (codigo_deduccion) 
 LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
 ;
--------------------------------------------------------
--  DDL for Index UQ_idDetAfil_netDetAfi
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idDetAfil_netDetAfi ON net_detalle_afiliado (id_detalle_afiliado) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idDetBenAfil_netDetDenAfil
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idDetBenAfil_netDetDenAfil ON net_detalle_beneficio_afiliado (id_detalle_ben_afil) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idDetDed_netDetDed
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idDetDed_netDetDed ON net_detalle_deduccion (id_ded_deduccion) 
  LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
  ;
--------------------------------------------------------
--  DDL for Index UQ_idBenPlan_netDetPagoBen
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idBenPlan_netDetPagoBen ON net_detalle_pago_beneficio (id_beneficio_planilla) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idEmple_netEmpl
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idEmple_netEmpl ON net_empleado (id_empleado) 
 LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
 ;
--------------------------------------------------------
--  DDL for Index UQ_numIdent_netEmpl
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_numIdent_netEmpl ON net_empleado (numero_identificacion)
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idUsu_netEmpl
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idUsu_netEmpl ON net_empleado (id_usuario) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idTipoId_netEmpl
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idTipoId_netEmpl ON net_empleado (id_tipoIdentificacion) 
  LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
  ;
--------------------------------------------------------
--  DDL for Index UQ_id_netEmplEmpr
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_id_netEmplEmpr ON net_empleado_empresa (id) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idEmpr_netEmpr
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idEmpr_netEmpr ON net_empresa (id_empresa) 
  LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
  ;
--------------------------------------------------------
--  DDL for Index UQ_razonSoc_netEmpr
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_razonSoc_netEmpr ON net_empresa (razon_social) 
  LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   
   ;
--------------------------------------------------------
--  DDL for Index UQ_rtn_netEmpr
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_rtn_netEmpr ON net_empresa (rtn) 
  LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   
   ;
--------------------------------------------------------
--  DDL for Index UQ_idInst_netInst (ERROR COLUMNA YA INDEXADA)
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idInst_netInst ON net_institucion (id_institucion)  
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idMuni_netMuni
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idMuni_netMuni ON net_municipio (id_municipio) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idPais_netPais
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idPais_netPais ON net_pais (id_pais) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idPAfCTrab_netPAfCTrab
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idPAfCTrab_netPAfCTrab ON net_perf_afil_cent_trab (id_perf_afil_cent_trab) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idPlan_netPlan
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idPlan_netPlan ON net_planilla (id_planilla)  
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_codPlanilla_netPlan
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_codPlanilla_netPlan ON net_planilla (codigo_planilla) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idProvi_netProvi
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idProvi_netProvi ON net_provincia (id_provincia) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idRefPer_netRefPers
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idRefPer_netRefPers ON net_referencia_personal (id_ref_personal) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idRefPAfil_RefPAfil 
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idRefPAfil_RefPAfil ON net_ref_personal_afiliado (id_ReferPersAfil) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idRol_netRol
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idRol_netRol ON net_rol (id_rol) 
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idTipoDed_netTipoDed
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idTipoDed_netTipoDed ON net_tipo_deduccion (id_tipo_deduccion)
   LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
   ;
--------------------------------------------------------
--  DDL for Index UQ_idIden_netTipoIden
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idIden_netTipoIden ON net_tipo_identificacion (id_identificacion) 
LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
;
--------------------------------------------------------
--  DDL for Index UQ_idTipoPlan_netTipoPla
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idTipoPlan_netTipoPla ON net_tipo_planilla (id_tipo_planilla) 
LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
;
--------------------------------------------------------
--  DDL for Index UQ_idUsu_netUsu
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_idUsu_netUsu ON net_usuario (id_usuario) 
LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
;
--------------------------------------------------------
--  DDL for Index UQ_correo_netUsu
--------------------------------------------------------

  CREATE UNIQUE INDEX UQ_correo_netUsu ON net_usuario (correo) 
LOGGING
    TABLESPACE INPRENET_INDEX
    PCTFREE    10
    INITRANS   2
    MAXTRANS   255
    STORAGE    (
                INITIAL          64K
                NEXT             1M
                MINEXTENTS       1
                MAXEXTENTS       UNLIMITED
                PCTINCREASE      0
                BUFFER_POOL      DEFAULT
              )
    NOPARALLEL
;
--------------------------------------------------------
--  Constraints for Table afiliado
--------------------------------------------------------

  ALTER TABLE net_afiliado MODIFY (estado NOT NULL ENABLE);
  ALTER TABLE net_afiliado ADD CONSTRAINT UQ_id_afiliado_net_afiliado PRIMARY KEY (id_afiliado)
  USING INDEX  

  ENABLE;
  ALTER TABLE net_afiliado ADD CONSTRAINT UQ_DNI_net_afiliado UNIQUE (dni)
  USING INDEX  
ENABLE;
--------------------------------------------------------
--  Constraints for Table afiliados_por_banco
--------------------------------------------------------

  ALTER TABLE net_afiliados_por_banco MODIFY (num_cuenta NOT NULL ENABLE);
  ALTER TABLE net_afiliados_por_banco ADD CONSTRAINT UQ_idAfilBan_netAfilBanco PRIMARY KEY (id_af_banco)
  USING INDEX  
    ENABLE;
  ALTER TABLE net_afiliados_por_banco ADD CONSTRAINT UQ_numCuen_netAfilBanco UNIQUE (num_cuenta)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Constraints for Table banco
--------------------------------------------------------

  ALTER TABLE net_banco MODIFY (nombre_banco NOT NULL ENABLE);
  ALTER TABLE net_banco MODIFY (cod_banco NOT NULL ENABLE);
  ALTER TABLE net_banco ADD CONSTRAINT UQ_idBanco_netBanco PRIMARY KEY (id_banco)
  USING INDEX  
    ENABLE;
  ALTER TABLE net_banco ADD CONSTRAINT UQ_nomBanc_netBanco UNIQUE (nombre_banco)
  USING INDEX  
    ENABLE;
  ALTER TABLE net_banco ADD CONSTRAINT UQ_net_banco UNIQUE (cod_banco)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Constraints for Table beneficio
--------------------------------------------------------

  ALTER TABLE net_beneficio MODIFY (nombre_beneficio NOT NULL ENABLE);
  ALTER TABLE net_beneficio MODIFY (descripcion_beneficio NOT NULL ENABLE);
  ALTER TABLE net_beneficio MODIFY (periodicidad NOT NULL ENABLE);
  ALTER TABLE net_beneficio MODIFY (numero_rentas_max NOT NULL ENABLE);
  ALTER TABLE net_beneficio ADD CONSTRAINT UQ_idBen_netBen PRIMARY KEY (id_beneficio)
  USING INDEX  
ENABLE;
--------------------------------------------------------
--  Constraints for Table centro_trabajo
--------------------------------------------------------

  ALTER TABLE net_centro_trabajo MODIFY (nombre_Centro_Trabajo NOT NULL ENABLE);
  ALTER TABLE net_centro_trabajo MODIFY (telefono_1 NOT NULL ENABLE);
  ALTER TABLE net_centro_trabajo MODIFY (correo_1 NOT NULL ENABLE);
  ALTER TABLE net_centro_trabajo MODIFY (apoderado_legal NOT NULL ENABLE);
  ALTER TABLE net_centro_trabajo MODIFY (representante_legal NOT NULL ENABLE);
  ALTER TABLE net_centro_trabajo MODIFY (rtn NOT NULL ENABLE);
  ALTER TABLE net_centro_trabajo MODIFY (logo NOT NULL ENABLE);
  ALTER TABLE net_centro_trabajo MODIFY (UbicacionCompleta NOT NULL ENABLE);
  ALTER TABLE net_centro_trabajo ADD CONSTRAINT UQ_idCenTrab_netCenTrab PRIMARY KEY (id_centro_trabajo)
  USING INDEX  
    ENABLE;
  ALTER TABLE net_centro_trabajo ADD CONSTRAINT UQ_corr1_netCenTrab UNIQUE (correo_1)
  USING INDEX  
    ENABLE;
  ALTER TABLE net_centro_trabajo ADD CONSTRAINT UQ_rtn_netCenTrab UNIQUE (rtn)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Constraints for Table deduccion
--------------------------------------------------------

  ALTER TABLE net_deduccion MODIFY (nombre_deduccion NOT NULL ENABLE);
  ALTER TABLE net_deduccion ADD CONSTRAINT UQ_idDed_netDed PRIMARY KEY (id_deduccion)
  USING INDEX  
ENABLE;
  ALTER TABLE net_deduccion ADD CONSTRAINT UQ_codDed_netDed UNIQUE (codigo_deduccion)
  USING INDEX  
ENABLE;
--------------------------------------------------------
--  Constraints for Table detalle_afiliado
--------------------------------------------------------

  ALTER TABLE net_detalle_afiliado ADD CONSTRAINT UQ_idDetAfil_netDetAfi PRIMARY KEY (id_detalle_afiliado)
  USING INDEX  
ENABLE;
--------------------------------------------------------
--  Constraints for Table detalle_beneficio_afiliado
--------------------------------------------------------

  ALTER TABLE net_detalle_beneficio_afiliado MODIFY (periodoInicio NOT NULL ENABLE);
  ALTER TABLE net_detalle_beneficio_afiliado MODIFY (periodoFinalizacion NOT NULL ENABLE);
  ALTER TABLE net_detalle_beneficio_afiliado ADD CONSTRAINT UQ_idDetBenAfil_netDetDenAfil PRIMARY KEY (id_detalle_ben_afil)
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 
ENABLE;
--------------------------------------------------------
--  Constraints for Table detalle_deduccion
--------------------------------------------------------

  ALTER TABLE net_detalle_deduccion MODIFY (fecha_aplicado NOT NULL ENABLE);
  ALTER TABLE net_detalle_deduccion ADD CONSTRAINT UQ_idDetDed_netDetDed PRIMARY KEY (id_ded_deduccion)
  USING INDEX  
ENABLE;
--------------------------------------------------------
--  Constraints for Table detalle_pago_beneficio
--------------------------------------------------------

  ALTER TABLE net_detalle_pago_beneficio MODIFY (estado NOT NULL ENABLE);
  ALTER TABLE net_detalle_pago_beneficio ADD CONSTRAINT UQ_idBenPlan_netDetPagoBen PRIMARY KEY (id_beneficio_planilla)
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 
 ENABLE;
--------------------------------------------------------
--  Constraints for Table empleado
--------------------------------------------------------

  ALTER TABLE net_empleado MODIFY (numero_identificacion NOT NULL ENABLE);
  ALTER TABLE net_empleado MODIFY (archivo_identificacion NOT NULL ENABLE);
  ALTER TABLE net_empleado ADD CONSTRAINT UQ_idEmple_netEmpl PRIMARY KEY (id_empleado)
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 
    ENABLE;
  ALTER TABLE net_empleado ADD CONSTRAINT UQ_numIdent_netEmpl UNIQUE (numero_identificacion)
  USING INDEX
    ENABLE;
  ALTER TABLE net_empleado ADD CONSTRAINT UQ_idUsu_netEmpl UNIQUE (id_usuario)
  USING INDEX  
    ENABLE;
  ALTER TABLE net_empleado ADD CONSTRAINT UQ_idTipoId_netEmpl UNIQUE (id_tipoIdentificacion)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Constraints for Table empleado_empresa
--------------------------------------------------------

  ALTER TABLE net_empleado_empresa ADD CONSTRAINT UQ_id_netEmplEmpr PRIMARY KEY (id)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Constraints for Table empresa
--------------------------------------------------------

  ALTER TABLE net_empresa MODIFY (razon_social NOT NULL ENABLE);
  ALTER TABLE net_empresa MODIFY (rtn NOT NULL ENABLE);
  ALTER TABLE net_empresa MODIFY (apoderado_legal NOT NULL ENABLE);
  ALTER TABLE net_empresa MODIFY (representante_legal NOT NULL ENABLE);
  ALTER TABLE net_empresa MODIFY (logo NOT NULL ENABLE);
  ALTER TABLE net_empresa MODIFY (direccion NOT NULL ENABLE);
  ALTER TABLE net_empresa MODIFY (telefono_1 NOT NULL ENABLE);
  ALTER TABLE net_empresa MODIFY (telefono_2 NOT NULL ENABLE);
  ALTER TABLE net_empresa MODIFY (correo_electronico NOT NULL ENABLE);
  ALTER TABLE net_empresa ADD CONSTRAINT UQ_idEmpr_netEmpr PRIMARY KEY (id_empresa)
  USING INDEX  
    ENABLE;
  ALTER TABLE net_empresa ADD CONSTRAINT UQ_razonSoc_netEmpr UNIQUE (razon_social)
  USING INDEX  
    ENABLE;
  ALTER TABLE net_empresa ADD CONSTRAINT UQ_rtn_netEmpr UNIQUE (rtn)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Constraints for Table institucion
--------------------------------------------------------

  --ALTER TABLE net_institucion MODIFY (id_institucion NOT NULL ENABLE);
  ALTER TABLE net_institucion MODIFY (nombre_institucion NOT NULL ENABLE);
  ALTER TABLE net_institucion MODIFY (tipo_institucion NOT NULL ENABLE); /* (ERROR solo puede tener una clave primaria) */
  ALTER TABLE net_institucion ADD CONSTRAINT UQ_idInst_netInst PRIMARY KEY (id_institucion)
  USING INDEX  
   ENABLE;
--------------------------------------------------------
--  Constraints for Table municipio
--------------------------------------------------------

  ALTER TABLE net_municipio MODIFY (nombre_municipio NOT NULL ENABLE);
  ALTER TABLE net_municipio ADD CONSTRAINT UQ_idMuni_netMuni PRIMARY KEY (id_municipio)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Constraints for Table pais
--------------------------------------------------------

  ALTER TABLE net_pais MODIFY (nombre_pais NOT NULL ENABLE);
  ALTER TABLE net_pais MODIFY (nacionalidad NOT NULL ENABLE);
  ALTER TABLE net_pais ADD CONSTRAINT UQ_idPais_netPais PRIMARY KEY (id_pais)
  USING INDEX  
ENABLE;
--------------------------------------------------------
--  Constraints for Table perf_afil_cent_trab
--------------------------------------------------------

  ALTER TABLE net_perf_afil_cent_trab MODIFY (cargo NOT NULL ENABLE);
  ALTER TABLE net_perf_afil_cent_trab MODIFY (sector_economico NOT NULL ENABLE);
  ALTER TABLE net_perf_afil_cent_trab MODIFY (actividad_economica NOT NULL ENABLE);
  ALTER TABLE net_perf_afil_cent_trab MODIFY (clase_cliente NOT NULL ENABLE);
  ALTER TABLE net_perf_afil_cent_trab MODIFY (fecha_ingreso NOT NULL ENABLE);
  ALTER TABLE net_perf_afil_cent_trab MODIFY (fecha_pago NOT NULL ENABLE);
  ALTER TABLE net_perf_afil_cent_trab MODIFY (numero_acuerdo NOT NULL ENABLE);
  ALTER TABLE net_perf_afil_cent_trab ADD CONSTRAINT UQ_idPAfCTrab_netPAfCTrab PRIMARY KEY (id_perf_afil_cent_trab)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Constraints for Table planilla
--------------------------------------------------------

  ALTER TABLE net_planilla MODIFY (codigo_planilla NOT NULL ENABLE);
  ALTER TABLE net_planilla MODIFY (fecha_apertura NOT NULL ENABLE);
  ALTER TABLE net_planilla MODIFY (secuencia NOT NULL ENABLE);
  ALTER TABLE net_planilla MODIFY (periodoInicio NOT NULL ENABLE);
  ALTER TABLE net_planilla MODIFY (periodoFinalizacion NOT NULL ENABLE);
  ALTER TABLE net_planilla ADD CONSTRAINT UQ_idPlan_netPlan PRIMARY KEY (id_planilla)
  USING INDEX  
ENABLE;
  ALTER TABLE net_planilla ADD CONSTRAINT UQ_codPlanilla_netPlan UNIQUE (codigo_planilla)
  USING INDEX  
 ENABLE;
--------------------------------------------------------
--  Constraints for Table provincia
--------------------------------------------------------

  ALTER TABLE net_provincia MODIFY (nombre_provincia NOT NULL ENABLE);
  ALTER TABLE net_provincia ADD CONSTRAINT UQ_idProvi_netProvi PRIMARY KEY (id_provincia)
  USING INDEX  
 ENABLE;
--------------------------------------------------------
--  Constraints for Table referencia_personal
--------------------------------------------------------

  ALTER TABLE net_referencia_personal MODIFY (nombre NOT NULL ENABLE);
  ALTER TABLE net_referencia_personal MODIFY (direccion NOT NULL ENABLE);
  ALTER TABLE net_referencia_personal MODIFY (parentesco NOT NULL ENABLE);
  ALTER TABLE net_referencia_personal MODIFY (telefono_trabajo NOT NULL ENABLE);
  ALTER TABLE net_referencia_personal MODIFY (telefono_celular NOT NULL ENABLE);
  ALTER TABLE net_referencia_personal ADD CONSTRAINT UQ_idRefPer_netRefPers PRIMARY KEY (id_ref_personal)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Constraints for Table referencia_personal_afiliado
--------------------------------------------------------

  ALTER TABLE net_ref_personal_afiliado ADD CONSTRAINT UQ_idRefPAfil_RefPAfil PRIMARY KEY (id_ReferPersAfil)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Constraints for Table rol
--------------------------------------------------------

  ALTER TABLE net_rol ADD CONSTRAINT UQ_idRol_netRol PRIMARY KEY (id_rol)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Constraints for Table tipo_deduccion
--------------------------------------------------------

  ALTER TABLE net_tipo_deduccion MODIFY (nombre_tipo_deduccion NOT NULL ENABLE);
  ALTER TABLE net_tipo_deduccion ADD CONSTRAINT UQ_idTipoDed_netTipoDed PRIMARY KEY (id_tipo_deduccion)
  USING INDEX PCTFREE 10 INITRANS 2 MAXTRANS 255 
    ENABLE;
--------------------------------------------------------
--  Constraints for Table tipo_identificacion
--------------------------------------------------------

  ALTER TABLE net_tipo_identificacion ADD CONSTRAINT UQ_idIden_netTipoIden PRIMARY KEY (id_identificacion)
  USING INDEX  
ENABLE;
--------------------------------------------------------
--  Constraints for Table tipo_planilla
--------------------------------------------------------

  ALTER TABLE net_tipo_planilla MODIFY (nombre_planilla NOT NULL ENABLE);
  ALTER TABLE net_tipo_planilla ADD CONSTRAINT UQ_idTipoPlan_netTipoPla PRIMARY KEY (id_tipo_planilla)
  USING INDEX  
 ENABLE;
--------------------------------------------------------
--  Constraints for Table usuario
--------------------------------------------------------

  ALTER TABLE net_usuario MODIFY (fecha_creacion NOT NULL ENABLE);
  ALTER TABLE net_usuario MODIFY (estado NOT NULL ENABLE);
  ALTER TABLE net_usuario ADD CONSTRAINT UQ_idUsu_netUsu PRIMARY KEY (id_usuario)
  USING INDEX  
    ENABLE;
  ALTER TABLE net_usuario ADD CONSTRAINT UQ_correo_netUsu UNIQUE (correo)
  USING INDEX  
    ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table afiliado
--------------------------------------------------------  
  ALTER TABLE net_afiliado ADD CONSTRAINT FK_netAfil_NetTipoId FOREIGN KEY (id_tipo_identificacion)
	  REFERENCES net_tipo_identificacion (id_identificacion) ENABLE;
  ALTER TABLE net_afiliado ADD CONSTRAINT FK_netAfil_netPais FOREIGN KEY (id_pais)
	  REFERENCES net_pais (id_pais) ENABLE;
  ALTER TABLE net_afiliado ADD CONSTRAINT FK_netAfil_netProv FOREIGN KEY (id_provincia)
	  REFERENCES net_provincia (id_provincia) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table afiliados_por_banco
--------------------------------------------------------

  ALTER TABLE net_afiliados_por_banco ADD CONSTRAINT FK_netAfilBan_netBanc FOREIGN KEY (id_banco)
	  REFERENCES net_banco (id_banco) ENABLE;
  ALTER TABLE net_afiliados_por_banco ADD CONSTRAINT FK_netAfilBan_netAfil FOREIGN KEY (id_afiliado)
	  REFERENCES net_afiliado (id_afiliado) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table centro_trabajo
--------------------------------------------------------

  ALTER TABLE net_centro_trabajo ADD CONSTRAINT FK_netCentTrab_netProv FOREIGN KEY (id_provincia)
	  REFERENCES net_provincia (id_provincia) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table deduccion
--------------------------------------------------------

  ALTER TABLE net_deduccion ADD CONSTRAINT FK_netDed_netTipoDed FOREIGN KEY (id_tipo_deduccion)
	  REFERENCES net_tipo_deduccion (id_tipo_deduccion) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table detalle_afiliado
--------------------------------------------------------

  ALTER TABLE net_detalle_afiliado ADD CONSTRAINT FK_netDetAfil_netDetAfilP FOREIGN KEY (id_detalle_afiliado_padre)
	  REFERENCES net_detalle_afiliado (id_detalle_afiliado) ENABLE;
  ALTER TABLE net_detalle_afiliado ADD CONSTRAINT FK_netDetAfil_netAfil FOREIGN KEY (id_afiliado)
	  REFERENCES net_afiliado (id_afiliado) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table detalle_beneficio_afiliado
--------------------------------------------------------

  ALTER TABLE net_detalle_beneficio_afiliado ADD CONSTRAINT FK_netDetBenAfil_netAafil FOREIGN KEY (id_afiliado)
	  REFERENCES net_afiliado (id_afiliado) ENABLE;
  ALTER TABLE net_detalle_beneficio_afiliado ADD CONSTRAINT FK_netDetBenAfil_netBen FOREIGN KEY (id_beneficio)
	  REFERENCES net_beneficio (id_beneficio) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table detalle_deduccion
--------------------------------------------------------

  ALTER TABLE net_detalle_deduccion ADD CONSTRAINT FK_netDetDed_netDed FOREIGN KEY (id_deduccion)
	  REFERENCES net_deduccion (id_deduccion) ENABLE;
  ALTER TABLE net_detalle_deduccion ADD CONSTRAINT FK_netDetDed_netAfil FOREIGN KEY (id_afiliado)
	  REFERENCES net_afiliado (id_afiliado) ENABLE;
  ALTER TABLE net_detalle_deduccion ADD CONSTRAINT FK_netDetDed_netInsti FOREIGN KEY (id_institucion)
	  REFERENCES net_institucion (id_institucion) ENABLE;
  ALTER TABLE net_detalle_deduccion ADD CONSTRAINT FK_netDetDed_netPlan FOREIGN KEY (id_planilla)
	  REFERENCES net_planilla (id_planilla) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table detalle_pago_beneficio
--------------------------------------------------------

  ALTER TABLE net_detalle_pago_beneficio ADD CONSTRAINT FK_detpag_planila FOREIGN KEY (id_planilla)
	  REFERENCES net_planilla (id_planilla) ENABLE;
  ALTER TABLE net_detalle_pago_beneficio ADD CONSTRAINT FK_detpag_beneAfil FOREIGN KEY (id_beneficio_afiliado)
	  REFERENCES net_detalle_beneficio_afiliado (id_detalle_ben_afil) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table empleado
--------------------------------------------------------

  ALTER TABLE net_empleado ADD CONSTRAINT FK_empleado_usuario FOREIGN KEY (id_usuario)
	  REFERENCES net_usuario (id_usuario) ENABLE;
  ALTER TABLE net_empleado ADD CONSTRAINT FK_empleado_tipoIdent FOREIGN KEY (id_tipoIdentificacion)
	  REFERENCES net_tipo_identificacion (id_identificacion) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table empleado_empresa
--------------------------------------------------------

  ALTER TABLE net_empleado_empresa ADD CONSTRAINT FK_empleadoempre_empresa FOREIGN KEY (id_empresa)
	  REFERENCES net_empresa (id_empresa) ENABLE;
  ALTER TABLE net_empleado_empresa ADD CONSTRAINT FK_FK_empleadoempre_empleado FOREIGN KEY (id_empleado)
	  REFERENCES net_empleado (id_empleado) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table municipio
--------------------------------------------------------

  ALTER TABLE net_municipio ADD CONSTRAINT FK_munici_provinc FOREIGN KEY (provinciaIdProvincia)
	  REFERENCES net_provincia (id_provincia) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table perf_afil_cent_trab
--------------------------------------------------------

  ALTER TABLE net_perf_afil_cent_trab ADD CONSTRAINT FK_perAfilCent_CentroTrab_afil FOREIGN KEY (id_detalle_afiliado)
	  REFERENCES net_afiliado (id_afiliado) ENABLE;
  ALTER TABLE net_perf_afil_cent_trab ADD CONSTRAINT FK_perAfilCent_CentroTrab FOREIGN KEY (id_centroTrabajo)
	  REFERENCES net_centro_trabajo (id_centro_trabajo) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table planilla
--------------------------------------------------------

  ALTER TABLE net_planilla ADD CONSTRAINT FK_planilla_tipoPlan FOREIGN KEY (id_tipo_planilla)
	  REFERENCES net_tipo_planilla (id_tipo_planilla) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table provincia
--------------------------------------------------------

  ALTER TABLE net_provincia ADD CONSTRAINT FK_prov_pais FOREIGN KEY (paisIdPais)
	  REFERENCES net_pais (id_pais) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table referencia_personal_afiliado
--------------------------------------------------------

    ALTER TABLE net_ref_personal_afiliado ADD CONSTRAINT FK_refper_afiliado FOREIGN KEY (id_afiliado)
      REFERENCES net_afiliado (id_afiliado) ENABLE;
  ALTER TABLE net_ref_personal_afiliado ADD CONSTRAINT FK_refperafil_refper FOREIGN KEY (refPersonalIdRefPersonal)
        REFERENCES net_referencia_personal (id_ref_personal) ENABLE;
--------------------------------------------------------
--  Ref Constraints for Table usuario
--------------------------------------------------------

  ALTER TABLE net_usuario ADD CONSTRAINT FK_usuario_rol FOREIGN KEY (id_rol)
	  REFERENCES net_rol (id_rol) ENABLE;