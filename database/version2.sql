drop table "C##TEST"."NET_AFILIADOS_POR_BANCO" cascade constraints;
drop table "C##TEST"."NET_BANCO" cascade constraints;
drop table "C##TEST"."NET_BENEFICIO" cascade constraints;
drop table "C##TEST"."NET_CENTRO_TRABAJO" cascade constraints;
drop table "C##TEST"."net_deduccion_terceros" cascade constraints;
drop table "C##TEST"."NET_DETALLE_BENEFICIO_AFILIADO" cascade constraints;
drop table "C##TEST"."NET_DETALLE_DEDUCCION" cascade constraints;
drop table "C##TEST"."NET_DETALLE_PAGO_BENEFICIO" cascade constraints;
drop table "C##TEST"."NET_DETALLE_PERSONA" cascade constraints;
drop table "C##TEST"."NET_EMPLEADO" cascade constraints;
drop table "C##TEST"."NET_EMPLEADO_EMPRESA" cascade constraints;
drop table "C##TEST"."NET_EMPRESA" cascade constraints;
drop table "C##TEST"."NET_INSTITUCION" cascade constraints;
drop table "C##TEST"."NET_MUNICIPIO" cascade constraints;
drop table "C##TEST"."NET_PAIS" cascade constraints;
drop table "C##TEST"."NET_PERF_AFIL_CENT_TRAB" cascade constraints;
drop table "C##TEST"."NET_PERSONA" cascade constraints;
drop table "C##TEST"."NET_PLANILLA" cascade constraints;
drop table "C##TEST"."NET_PROVINCIA" cascade constraints;
drop table "C##TEST"."NET_REF_PER_AFIL" cascade constraints;
drop table "C##TEST"."NET_REFERENCIA_PERSONAL" cascade constraints;
drop table "C##TEST"."NET_ROL" cascade constraints;
drop table "C##TEST"."NET_TIPO_AFILIADO" cascade constraints;
drop table "C##TEST"."NET_TIPO_IDENTIFICACION" cascade constraints;
drop table "C##TEST"."NET_TIPO_PLANILLA" cascade constraints;
drop table "C##TEST"."NET_USUARIO" cascade constraints;
drop table "C##TEST"."NET_DEDUCCION" cascade constraints;
drop table "C##TEST"."NET_DEPARTAMENTO" cascade constraints;
drop table "C##TEST"."NET_CUENTA_PERSONA" cascade constraints;
drop table "C##TEST"."NET_DETALLE_PLANILLA_ING" cascade constraints;
drop table "C##TEST"."NET_ESTADO_AFILIADO" cascade constraints;
drop table "C##TEST"."NET_MOVIMIENTO_CUENTA" cascade constraints;
drop table "C##TEST"."NET_SALARIO_CONTABLE" cascade constraints;
drop table "C##TEST"."NET_TIPO_CUENTA" cascade constraints;
drop table "C##TEST"."NET_TIPO_PERSONA" cascade constraints;
drop table "C##TEST"."NET_USUARIO_PRIVADA" cascade constraints;
drop table "C##TEST"."NET_SALARIO_COTIZABLE" cascade constraints;
drop table "C##TEST"."NET_TIPO_MOVIMIENTO" cascade constraints;

DROP TABLE NET_PERSONA_POR_BANCO CASCADE CONSTRAINTS;
DROP TABLE NET_BANCO CASCADE CONSTRAINTS;
DROP TABLE NET_BENEFICIO CASCADE CONSTRAINTS;
DROP TABLE NET_CENTRO_TRABAJO CASCADE CONSTRAINTS;
DROP TABLE NET_COLEGIOS_MAGISTERIALES CASCADE CONSTRAINTS;
DROP TABLE NET_CUENTA_PERSONA CASCADE CONSTRAINTS;
DROP TABLE NET_DEDUCCION CASCADE CONSTRAINTS;
DROP TABLE NET_DEPARTAMENTO CASCADE CONSTRAINTS;
DROP TABLE NET_DETALLE_BENEFICIO_AFILIADO CASCADE CONSTRAINTS;
DROP TABLE NET_DETALLE_DEDUCCION CASCADE CONSTRAINTS;
DROP TABLE NET_DETALLE_PAGO_BENEFICIO CASCADE CONSTRAINTS;
DROP TABLE NET_DETALLE_PERSONA CASCADE CONSTRAINTS;
DROP TABLE NET_DETALLE_PLANILLA_ING CASCADE CONSTRAINTS;
DROP TABLE NET_EMPLEADO CASCADE CONSTRAINTS;
DROP TABLE NET_EMPLEADO_EMPRESA CASCADE CONSTRAINTS;
DROP TABLE NET_EMPRESA CASCADE CONSTRAINTS;
DROP TABLE NET_ESTADO_PERSONA CASCADE CONSTRAINTS;
DROP TABLE NET_INSTITUCION CASCADE CONSTRAINTS;
DROP TABLE NET_MOVIMIENTO_CUENTA CASCADE CONSTRAINTS;
DROP TABLE NET_MUNICIPIO CASCADE CONSTRAINTS;
DROP TABLE NET_PAIS CASCADE CONSTRAINTS;
DROP TABLE NET_PERF_PERS_CENT_TRAB CASCADE CONSTRAINTS;
DROP TABLE NET_PERSONA CASCADE CONSTRAINTS;
DROP TABLE NET_PERSONA_COLEGIOS CASCADE CONSTRAINTS;
DROP TABLE NET_PLANILLA CASCADE CONSTRAINTS;
DROP TABLE NET_REF_PER_AFIL CASCADE CONSTRAINTS;
DROP TABLE NET_REFERENCIA_PERSONAL CASCADE CONSTRAINTS;
DROP TABLE NET_ROL CASCADE CONSTRAINTS;
DROP TABLE NET_SALARIO_COTIZABLE CASCADE CONSTRAINTS;
DROP TABLE NET_SESION CASCADE CONSTRAINTS;
DROP TABLE NET_TIPO_CUENTA CASCADE CONSTRAINTS;
DROP TABLE NET_TIPO_IDENTIFICACION CASCADE CONSTRAINTS;
DROP TABLE NET_TIPO_MOVIMIENTO CASCADE CONSTRAINTS;
DROP TABLE NET_TIPO_PERSONA CASCADE CONSTRAINTS;
DROP TABLE NET_TIPO_PLANILLA CASCADE CONSTRAINTS;
DROP TABLE NET_USUARIO CASCADE CONSTRAINTS;
DROP TABLE NET_USUARIO_PRIVADA CASCADE CONSTRAINTS;
DROP TABLE NET_AFILIADOS_POR_BANCO CASCADE CONSTRAINTS;
DROP TABLE NET_ESTADO_AFILIADO CASCADE CONSTRAINTS;
DROP TABLE NET_PERF_AFIL_CENT_TRAB CASCADE CONSTRAINTS;

CREATE TABLE afiliado (
    id_afiliado            VARCHAR2(40 CHAR) NOT NULL,
    pais_id_pais           VARCHAR2(30 CHAR) NOT NULL,
    pais_id_pais2          VARCHAR2(30 CHAR) NOT NULL,
    tipo_identificacion_id VARCHAR2(40 CHAR) NOT NULL,
    dni   VARCHAR2(40 CHAR) NOT NULL,
    estado_civil   VARCHAR2(40 CHAR) NOT NULL,
    tipo_cotizante   VARCHAR2(40 CHAR) NOT NULL,
    afiliado_id_afiliado   VARCHAR2(40 CHAR) NOT NULL,
    primer_nombre          NVARCHAR2(40),
    segundo_nombre         NVARCHAR2(40),
    tercer_nombre          VARCHAR2(30 CHAR),
    primer_apellido        VARCHAR2(30 CHAR),
    segundo_apellido       VARCHAR2(30 CHAR),
    fecha_nacimiento       DATE,
    sexo                   CHAR(1 CHAR),
    cantidad_dependientes  INTEGER,
    cantidad_hijos         INTEGER,
    profesion              VARCHAR2(30 CHAR),
    representacion         VARCHAR2(30 CHAR),
    telefono_1             VARCHAR2(20 CHAR),
    telefono_2             VARCHAR2(20 CHAR),
    correo_1               VARCHAR2(40 CHAR),
    correo_2               VARCHAR2(40 CHAR),
    archivo_identificacion NVARCHAR2(300),
    direccion_residencia   NVARCHAR2(200),
    estado                 NVARCHAR2(100)
);

ALTER TABLE afiliado
    ADD CHECK ( sexo IN ( 'F', 'M' ) );

ALTER TABLE afiliado
    ADD CONSTRAINT tipo_representacion CHECK ( representacion IN ( 'POR CUENTA PROPIA', 'POR TERCEROS' ) );

CREATE UNIQUE INDEX afiliado__idx ON
    afiliado (
        id_afiliado
    ASC );



ALTER TABLE afiliado ADD CONSTRAINT afiliado_pk PRIMARY KEY ( id_afiliado );

CREATE TABLE afiliados_por_banco (
    id_af_por_banco      VARCHAR2(40 CHAR) NOT NULL,
    afiliado_id_afiliado VARCHAR2(40 CHAR) NOT NULL,
    banco_id_banco       VARCHAR2(40 CHAR) NOT NULL,
    num_cuenta           VARCHAR2(40 CHAR)
);

CREATE INDEX afiliados_por_banco_banco_fk ON
    afiliados_por_banco (
        banco_id_banco
    ASC );

ALTER TABLE afiliados_por_banco ADD CONSTRAINT afiliados_por_banco_pk PRIMARY KEY ( id_af_por_banco,
                                                                                    afiliado_id_afiliado );

CREATE TABLE banco (
    id_banco  VARCHAR2(40 CHAR) NOT NULL,
    nombre    VARCHAR2(30 CHAR),
    cod_banco INTEGER
);

ALTER TABLE banco ADD CONSTRAINT banco_pk PRIMARY KEY ( id_banco );

CREATE TABLE centro_trabajo (
    id_centro_trabajo   VARCHAR2(40 CHAR) NOT NULL,
    ciudad_id_ciudad    VARCHAR2(40 CHAR) NOT NULL,
    nombre              VARCHAR2(40 CHAR),
    telefono_1          VARCHAR2(30 CHAR),
    telefono_2          VARCHAR2(30 CHAR),
    correo_1            VARCHAR2(40 CHAR),
    correo_2            VARCHAR2(50 CHAR),
    apoderado_legal     NVARCHAR2(50),
    representante_legal NVARCHAR2(50),
    rtn                 NVARCHAR2(14),
    logo                NVARCHAR2(300)
);

ALTER TABLE centro_trabajo ADD CONSTRAINT centro_trabajo_pk PRIMARY KEY ( id_centro_trabajo );

CREATE TABLE ciudad (
    id_ciudad              VARCHAR2(40 CHAR) NOT NULL,
    provincia_id_provincia VARCHAR2(40 CHAR) NOT NULL,
    nombre                 VARCHAR2(40 CHAR)
);

ALTER TABLE ciudad ADD CONSTRAINT municipio_pk PRIMARY KEY ( id_ciudad );

CREATE TABLE empleado (
    id_empleado            NCHAR(36) NOT NULL,
    usuario_id_usuario     NVARCHAR2(36) NOT NULL,
    nombre_puesto          NVARCHAR2(50),
    numero_empleado        INTEGER,
    telefono_empleado      INTEGER,
    numero_identificacion  NVARCHAR2(50),
    archivo_identificacion NVARCHAR2(300)
);

CREATE UNIQUE INDEX empleado__idx ON
    empleado (
        usuario_id_usuario
    ASC );

ALTER TABLE empleado ADD CONSTRAINT empleado_pk PRIMARY KEY ( id_empleado );

CREATE TABLE empleado_empresa (
    empresa_id_empresa   VARCHAR2(40 CHAR) NOT NULL,
    empleado_id_empleado NCHAR(36) NOT NULL
);

CREATE TABLE empresa (
    id_empresa          VARCHAR2(40 CHAR) NOT NULL,
    razon_social        VARCHAR2(40 CHAR),
    rtn                 VARCHAR2(14 CHAR),
    apoderado_legal     VARCHAR2(30 CHAR),
    representante_legal VARCHAR2(30 CHAR),
    logo                VARCHAR2(30 CHAR),
    direccion           VARCHAR2(30 CHAR),
    telefono_1          CHAR(30 CHAR),
    telefono_2          CHAR(30 CHAR),
    correo_electronico  VARCHAR2(30 CHAR)
);

ALTER TABLE empresa ADD CONSTRAINT empresa_pk PRIMARY KEY ( id_empresa );

CREATE TABLE pais (
    id_pais      VARCHAR2(30 CHAR) NOT NULL,
    nombre       VARCHAR2(40 CHAR),
    nacionalidad VARCHAR2(40 CHAR)
);

ALTER TABLE pais ADD CONSTRAINT pais_pk PRIMARY KEY ( id_pais );

CREATE TABLE perf_afil_cent_trab (
    id_perf_afil_cent_trab VARCHAR2(40 CHAR) NOT NULL,
    centro_trabajo_id      VARCHAR2(40 CHAR) NOT NULL,
    afiliado_id_afiliado   VARCHAR2(40 CHAR) NOT NULL,
    colegio_magisterial    VARCHAR2(30 CHAR),
    numero_carnet          VARCHAR2(30 CHAR),
    cargo                  VARCHAR2(40 CHAR),
    sector_economico       VARCHAR2(40 CHAR),
    actividad_economica    VARCHAR2(40 CHAR),
    clase_cliente          VARCHAR2(40 CHAR),
    fecha_ingreso          DATE,
    fecha_pago             DATE,
    sector                 VARCHAR2(40 CHAR),
    numero_acuerdo         VARCHAR2(50 CHAR),
    salario_neto           NUMBER
);

ALTER TABLE perf_afil_cent_trab
    ADD CHECK ( sector IN ( 'JUBILADO', 'PEDAGOGICO', 'PRIVADO', 'PROHECO', 'PUBLICO' ) );

ALTER TABLE perf_afil_cent_trab ADD CONSTRAINT perf_afil_cent_trab_pk PRIMARY KEY ( id_perf_afil_cent_trab );

CREATE TABLE provincia (
    id_provincia VARCHAR2(40 CHAR) NOT NULL,
    pais_id_pais VARCHAR2(30 CHAR) NOT NULL,
    nombre       VARCHAR2(30 CHAR)
);

ALTER TABLE provincia ADD CONSTRAINT departamento_pk PRIMARY KEY ( id_provincia );

CREATE TABLE referencia_personal (
    id_ref_personal      VARCHAR2(40 CHAR) NOT NULL,
    afiliado_id_afiliado VARCHAR2(40 CHAR) NOT NULL,
    nombre               VARCHAR2(30 CHAR),
    direccion            VARCHAR2(50 CHAR),
    parentesco           VARCHAR2(30 CHAR),
    telefono_domicilio   VARCHAR2(20 CHAR),
    telefono_trabajo     VARCHAR2(20 CHAR),
    telefono_celular     VARCHAR2(20 CHAR)
);

ALTER TABLE referencia_personal ADD CONSTRAINT referencia_personal_pk PRIMARY KEY ( id_ref_personal );

CREATE TABLE rol (
    id_rol      NVARCHAR2(36) NOT NULL,
    nombre      VARCHAR2(20 CHAR),
    descripcion NVARCHAR2(200)
);

ALTER TABLE rol ADD CONSTRAINT rol_pk PRIMARY KEY ( id_rol );

CREATE TABLE tipo_identificacion (
    id_identificacion   VARCHAR2(40 CHAR) NOT NULL,
    tipo_identificacion VARCHAR2(40 CHAR)
);

ALTER TABLE tipo_identificacion
    ADD CHECK ( tipo_identificacion IN ( 'CARNET RESIDENCIA', 'DNI', 'NUMERO LICENCIA', 'PASAPORTE', 'RTN' ) );

ALTER TABLE tipo_identificacion ADD CONSTRAINT tipo_identificacion_pk PRIMARY KEY ( id_identificacion );

CREATE TABLE usuario (
    id_usuario             NVARCHAR2(36) NOT NULL,
    rol_id_rol             NVARCHAR2(36) NOT NULL,
    fk_id_ident            VARCHAR2(40 CHAR) NOT NULL,
    nombre                 VARCHAR2(30 CHAR),
    correo                 NVARCHAR2(200),
    contrasena             NVARCHAR2(200),
    fecha_creacion         NVARCHAR2(50),
    fecha_verificacion     DATE,
    fecha_modificacion     NVARCHAR2(50),
    estado                 NVARCHAR2(50) DEFAULT 'INACTIVO',
    archivo_id             NVARCHAR2(300),
    pregunta_de_usuario_1  NVARCHAR2(100),
    respuesta_de_usuario_1 NVARCHAR2(100),
    pregunta_de_usuario_2  NVARCHAR2(100),
    respuesta_de_usuario_2 NVARCHAR2(100),
    pregunta_de_usuario_3  NVARCHAR2(100),
    respuesta_de_usuario_3 NVARCHAR2(100)
);

ALTER TABLE usuario
    ADD CONSTRAINT estadouser CHECK ( estado IN ( 'ACTIVO', 'DESHABILITADO', 'INACTIVO' ) );

CREATE UNIQUE INDEX usuario__idx ON
    usuario (
        id_usuario
    ASC );

ALTER TABLE usuario ADD CONSTRAINT usuario_pk PRIMARY KEY ( id_usuario );

ALTER TABLE afiliado
    ADD CONSTRAINT afiliado_afiliado_fk FOREIGN KEY ( afiliado_id_afiliado )
        REFERENCES afiliado ( id_afiliado );

ALTER TABLE afiliado
    ADD CONSTRAINT afiliado_pais_fk FOREIGN KEY ( pais_id_pais2 )
        REFERENCES pais ( id_pais );

ALTER TABLE afiliado
    ADD CONSTRAINT afiliado_pais_fkv2 FOREIGN KEY ( pais_id_pais )
        REFERENCES pais ( id_pais );

ALTER TABLE afiliado
    ADD CONSTRAINT afiliado_tipo_id_fk FOREIGN KEY ( tipo_identificacion_id )
        REFERENCES tipo_identificacion ( id_identificacion );

ALTER TABLE afiliados_por_banco
    ADD CONSTRAINT afiliados_por_ban_afil_fk FOREIGN KEY ( afiliado_id_afiliado )
        REFERENCES afiliado ( id_afiliado );

ALTER TABLE afiliados_por_banco
    ADD CONSTRAINT afiliados_por_banco_banco_fk FOREIGN KEY ( banco_id_banco )
        REFERENCES banco ( id_banco );

ALTER TABLE centro_trabajo
    ADD CONSTRAINT centro_trabajo_ciudad_fk FOREIGN KEY ( ciudad_id_ciudad )
        REFERENCES ciudad ( id_ciudad );

ALTER TABLE ciudad
    ADD CONSTRAINT ciudad_provincia_fk FOREIGN KEY ( provincia_id_provincia )
        REFERENCES provincia ( id_provincia );

ALTER TABLE empleado_empresa
    ADD CONSTRAINT empleado_empresa_empleado_fk FOREIGN KEY ( empleado_id_empleado )
        REFERENCES empleado ( id_empleado );

ALTER TABLE empleado_empresa
    ADD CONSTRAINT empleado_empresa_empresa_fk FOREIGN KEY ( empresa_id_empresa )
        REFERENCES empresa ( id_empresa );

ALTER TABLE empleado
    ADD CONSTRAINT empleado_usuario_fk FOREIGN KEY ( usuario_id_usuario )
        REFERENCES usuario ( id_usuario );

ALTER TABLE perf_afil_cent_trab
    ADD CONSTRAINT perf_afil_cent_trab_fk FOREIGN KEY ( centro_trabajo_id )
        REFERENCES centro_trabajo ( id_centro_trabajo );

ALTER TABLE perf_afil_cent_trab
    ADD CONSTRAINT perf_afil_cent_trab_fkv2 FOREIGN KEY ( afiliado_id_afiliado )
        REFERENCES afiliado ( id_afiliado );

ALTER TABLE provincia
    ADD CONSTRAINT provincia_pais_fk FOREIGN KEY ( pais_id_pais )
        REFERENCES pais ( id_pais );

ALTER TABLE referencia_personal
    ADD CONSTRAINT referencia_per_afil_fk FOREIGN KEY ( afiliado_id_afiliado )
        REFERENCES afiliado ( id_afiliado );

ALTER TABLE usuario
    ADD CONSTRAINT usuario_rol_fk FOREIGN KEY ( rol_id_rol )
        REFERENCES rol ( id_rol );

ALTER TABLE usuario
    ADD CONSTRAINT usuario_tipo_identificacion_fk FOREIGN KEY ( fk_id_ident )
        REFERENCES tipo_identificacion ( id_identificacion );

        
INSERT INTO "SYSTEM"."TIPO_IDENTIFICACION" (ID_IDENTIFICACION, TIPO_IDENTIFICACION) VALUES ('1', 'CARNET RESIDENCIA');
INSERT INTO "SYSTEM"."TIPO_IDENTIFICACION" (ID_IDENTIFICACION, TIPO_IDENTIFICACION) VALUES ('2', 'DNI');
INSERT INTO "SYSTEM"."TIPO_IDENTIFICACION" (ID_IDENTIFICACION, TIPO_IDENTIFICACION) VALUES ('3', 'NUMERO LICENCIA');
INSERT INTO "SYSTEM"."TIPO_IDENTIFICACION" (ID_IDENTIFICACION, TIPO_IDENTIFICACION) VALUES ('4', 'PASAPORTE');
INSERT INTO "SYSTEM"."TIPO_IDENTIFICACION" (ID_IDENTIFICACION, TIPO_IDENTIFICACION) VALUES ('5', 'RTN');

INSERT INTO "SYSTEM"."ROL" (ID_ROL, NOMBRE) VALUES (N'1', 'Administrador');
INSERT INTO "SYSTEM"."ROL" (ID_ROL, NOMBRE) VALUES (N'2', 'Oficial de Operacion');
INSERT INTO "SYSTEM"."ROL" (ID_ROL, NOMBRE) VALUES (N'3', 'Contador');
INSERT INTO "SYSTEM"."ROL" (ID_ROL, NOMBRE) VALUES (N'4', 'Auxiliar');

--inserción de datos en la tabla pais
INSERT INTO pais (id_pais, nombre, nacionalidad) VALUES ('1', 'Honduras', 'Hondureña');
INSERT INTO pais (id_pais, nombre, nacionalidad) VALUES ('2', 'Estados Unidos', 'Estadounidense');
INSERT INTO pais (id_pais, nombre, nacionalidad) VALUES ('3', 'Canadá', 'Canadiense');
INSERT INTO pais (id_pais, nombre, nacionalidad) VALUES ('4', 'México', 'Mexicana');

--Inserts de provincia
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN001', '1', 'Atlántida');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN002', '1', 'Colón');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN003', '1', 'Comayagua');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN004', '1', 'Copán');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN005', '1', 'Cortés');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN006', '1', 'Choluteca');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN007', '1', 'El Paraíso');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN008', '1', 'Francisco Morazán');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN009', '1', 'Gracias a Dios');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN010', '1', 'Intibucá');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN011', '1', 'Islas de la Bahía');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN012', '1', 'La Paz');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN013', '1', 'Lempira');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN014', '1', 'Ocotepeque');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN015', '1', 'Olancho');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN016', '1', 'Santa Bárbara');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN017', '1', 'Valle');
INSERT INTO provincia (id_provincia, pais_id_pais, nombre) VALUES ('HN018', '1', 'Yoro');

--Ciudades
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C001', 'HN001', 'La Ceiba');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C002', 'HN002', 'Trujillo');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C003', 'HN003', 'Comayagua');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C004', 'HN004', 'Santa Rosa de Copán');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C005', 'HN005', 'San Pedro Sula');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C006', 'HN006', 'Choluteca');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C007', 'HN007', 'Yuscarán');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C008', 'HN008', 'Tegucigalpa');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C009', 'HN009', 'Puerto Lempira');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C011', 'HN011', 'Roatán');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C012', 'HN012', 'La Paz');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C013', 'HN013', 'Gracias');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C014', 'HN014', 'Santa Rosa de Ocotepeque');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C015', 'HN015', 'Juticalpa');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C016', 'HN016', 'Santa Bárbara');
INSERT INTO ciudad (id_ciudad, provincia_id_provincia, nombre) VALUES ('C018', 'HN018', 'Yoro');

--Centros de trabajo
INSERT INTO centro_trabajo (id_centro_trabajo, ciudad_id_ciudad, nombre, telefono_1, telefono_2, correo_1, correo_2, apoderado_legal, representante_legal, rtn, logo)
VALUES ('CT001', 'C001', 'Instituto La Ceiba', '555-1010', '555-1011', 'info@institutolaceiba.edu', 'contacto@institutolaceiba.edu', 'Juan Pérez', 'Ana Gómez', 'RTN001', 'logo1.jpg');
INSERT INTO centro_trabajo (id_centro_trabajo, ciudad_id_ciudad, nombre, telefono_1, telefono_2, correo_1, correo_2, apoderado_legal, representante_legal, rtn, logo)
VALUES ('CT002', 'C001', 'Colegio Básico Ceiba', '555-1020', '555-1021', 'info@colegiobasicoceiba.edu', 'contacto@colegiobasicoceiba.edu', 'Mario Rossi', 'Laura Díaz', 'RTN002', 'logo2.jpg');
INSERT INTO centro_trabajo (id_centro_trabajo, ciudad_id_ciudad, nombre, telefono_1, telefono_2, correo_1, correo_2, apoderado_legal, representante_legal, rtn, logo)
VALUES ('CT003', 'C001', 'Universidad Tecnológica de La Ceiba', '555-1030', '555-1031', 'info@utlaceiba.edu', 'contacto@utlaceiba.edu', 'Carlos López', 'Sofía Martínez', 'RTN003', 'logo3.jpg');
INSERT INTO centro_trabajo (id_centro_trabajo, ciudad_id_ciudad, nombre, telefono_1, telefono_2, correo_1, correo_2, apoderado_legal, representante_legal, rtn, logo)
VALUES ('CT004', 'C001', 'Escuela Internacional Ceiba', '555-1040', '555-1041', 'info@escuelaintceiba.edu', 'contacto@escuelaintceiba.edu', 'Pedro Álvarez', 'Carmen Ruiz', 'RTN004', 'logo4.jpg');
INSERT INTO centro_trabajo (id_centro_trabajo, ciudad_id_ciudad, nombre, telefono_1, telefono_2, correo_1, correo_2, apoderado_legal, representante_legal, rtn, logo)
VALUES ('CT005', 'C001', 'Centro Educativo Moderno', '555-1050', '555-1051', 'info@cemoderno.edu', 'contacto@cemoderno.edu', 'Luis Fernández', 'María González', 'RTN005', 'logo5.jpg');
INSERT INTO centro_trabajo (id_centro_trabajo, ciudad_id_ciudad, nombre, telefono_1, telefono_2, correo_1, correo_2, apoderado_legal, representante_legal, rtn, logo)
VALUES ('CT006', 'C001', 'Preparatoria Ceiba Norte', '555-1060', '555-1061', 'info@prepceibanorte.edu', 'contacto@prepceibanorte.edu', 'Jorge Mendoza', 'Diana Ortiz', 'RTN006', 'logo6.jpg');
INSERT INTO centro_trabajo (id_centro_trabajo, ciudad_id_ciudad, nombre, telefono_1, telefono_2, correo_1, correo_2, apoderado_legal, representante_legal, rtn, logo)
VALUES ('CT007', 'C001', 'Academia de Ciencias de La Ceiba', '555-1070', '555-1071', 'info@acadcienciaslc.edu', 'contacto@acadcienciaslc.edu', 'Omar Vargas', 'Beatriz Jiménez', 'RTN007', 'logo7.jpg');
INSERT INTO centro_trabajo (id_centro_trabajo, ciudad_id_ciudad, nombre, telefono_1, telefono_2, correo_1, correo_2, apoderado_legal, representante_legal, rtn, logo)
VALUES ('CT008', 'C001', 'Colegio Técnico Ceiba', '555-1080', '555-1081', 'info@colegiotecceiba.edu', 'contacto@colegiotecceiba.edu', 'Ricardo Soto', 'Elena Núñez', 'RTN008', 'logo8.jpg');
INSERT INTO centro_trabajo (id_centro_trabajo, ciudad_id_ciudad, nombre, telefono_1, telefono_2, correo_1, correo_2, apoderado_legal, representante_legal, rtn, logo)
VALUES ('CT009', 'C001', 'Instituto Superior Ceiba', '555-1090', '555-1091', 'info@isuperiorceiba.edu', 'contacto@isuperiorceiba.edu', 'Manuel Castro', 'Luisa Fernanda', 'RTN009', 'logo9.jpg');
INSERT INTO centro_trabajo (id_centro_trabajo, ciudad_id_ciudad, nombre, telefono_1, telefono_2, correo_1, correo_2, apoderado_legal, representante_legal, rtn, logo)
VALUES ('CT010', 'C001', 'Escuela de Artes de La Ceiba', '555-1100', '555-1101', 'info@eartesceiba.edu', 'contacto@eartesceiba.edu', 'Fernando Gutiérrez', 'Patricia Solís', 'RTN010', 'logo10.jpg');

--AFILIADO
INSERT INTO afiliado VALUES ('AF0001', '1', '1', '1', '0801199912341', 'Soltero','Afiliado', 'AF0001', 'Juan', 'Carlos', 'Eduardo', 'Fernandez', 'Diaz', TO_DATE('1990-03-21', 'YYYY-MM-DD'), 'M', 3, 2, 'Arquitecto', 'POR CUENTA PROPIA', '123-456-7890', '234-567-8901', 'juan.fernandez@email.com', 'carlos.fernandez@email.com', 'doc001.pdf', 'Calle Sol, No. 123, Ciudad', 'Activo');
INSERT INTO afiliado VALUES ('AF0002', '1', '1', '1', '0801199912342','Soltero','Beneficiario', 'AF0002', 'Maria', 'Luisa', NULL, 'Gonzalez', 'Reyes', TO_DATE('1985-07-10', 'YYYY-MM-DD'), 'F', 2, 1, 'Doctora', 'POR TERCEROS', '123-456-7891', '234-567-8902', 'maria.gonzalez@email.com', 'luisa.gonzalez@email.com', 'doc002.pdf', 'Av. Luna, No. 456, Ciudad', 'Activo');
INSERT INTO afiliado VALUES ('AF0003', '1', '1', '1', '0801199912343', 'Soltero','Afiliado','AF0003', 'Roberto', 'Jose', NULL, 'Martinez', 'Lopez', TO_DATE('1978-11-23', 'YYYY-MM-DD'), 'M', 1, 3, 'Ingeniero', 'POR CUENTA PROPIA', '123-456-7892', '234-567-8903', 'roberto.martinez@email.com', 'jose.martinez@email.com', 'doc003.pdf', 'Calle Estrella, No. 789, Ciudad', 'Activo');
INSERT INTO afiliado VALUES ('AF0004', '1', '1', '1', '0801199912344', 'Soltero','Beneficiario','AF0004', 'Laura', 'Patricia', NULL, 'Sánchez', 'Rodríguez', TO_DATE('1982-05-05', 'YYYY-MM-DD'), 'F', 0, 0, 'Empresaria', 'POR TERCEROS', '123-456-7893', '234-567-8904', 'laura.sanchez@email.com', 'patricia.sanchez@email.com', 'doc004.pdf', 'Calle Río, No. 101, Ciudad', 'Activo');
INSERT INTO afiliado VALUES ('AF0005', '1', '1', '1', '0801199912345', 'Soltero','Beneficiario','AF0005', 'Pedro', 'Andrés', NULL, 'Garcia', 'Quintana', TO_DATE('1972-02-28', 'YYYY-MM-DD'), 'M', 4, 2, 'Abogado', 'POR CUENTA PROPIA', '123-456-7894', '234-567-8905', 'pedro.garcia@email.com', 'andres.garcia@email.com', 'doc005.pdf', 'Calle Mar, No. 202, Ciudad', 'Activo');
INSERT INTO afiliado VALUES ('AF0006', '1', '1', '1', '0801199912346', 'Soltero','Beneficiario','AF0006', 'Sofia', 'Beatriz', NULL, 'Ruiz', 'Morales', TO_DATE('1993-08-15', 'YYYY-MM-DD'), 'F', 1, 0, 'Diseñadora', 'POR TERCEROS', '123-456-7895', '234-567-8906', 'sofia.ruiz@email.com', 'beatriz.ruiz@email.com', 'doc006.pdf', 'Calle Montaña, No. 303, Ciudad', 'Activo');
INSERT INTO afiliado VALUES ('AF0007', '1', '1', '1', '0801199912347','Soltero','Afiliado', 'AF0007', 'Diego', 'Alonso', NULL, 'Vega', 'Prieto', TO_DATE('1980-09-09', 'YYYY-MM-DD'), 'M', 2, 1, 'Contador', 'POR CUENTA PROPIA', '123-456-7896', '234-567-8907', 'diego.vega@email.com', 'alonso.vega@email.com', 'doc007.pdf', 'Calle Sol, No. 404, Ciudad', 'Activo');
INSERT INTO afiliado VALUES ('AF0008', '1', '1', '1', '0801199912348','Soltero','Beneficiario', 'AF0008', 'Carmen', 'Elena', NULL, 'Ortiz', 'Campos', TO_DATE('1995-12-30', 'YYYY-MM-DD'), 'F', 0, 1, 'Psicóloga', 'POR TERCEROS', '123-456-7897', '234-567-8908', 'carmen.ortiz@email.com', 'elena.ortiz@email.com', 'doc008.pdf', 'Calle Río, No. 505, Ciudad', 'Activo');
INSERT INTO afiliado VALUES ('AF0009', '1', '1', '1', '0801199912349','Soltero','Afiliado', 'AF0009', 'Francisco', 'Miguel', NULL, 'Navarro', 'Gutierrez', TO_DATE('1988-01-22', 'YYYY-MM-DD'), 'M', 3, 2, 'Profesor', 'POR CUENTA PROPIA', '123-456-7898', '234-567-8909', 'francisco.navarro@email.com', 'miguel.navarro@email.com', 'doc009.pdf', 'Calle Luna, No. 606, Ciudad', 'Activo');
INSERT INTO afiliado VALUES ('AF0010', '1', '1', '1', '0801199912312','Soltero','Afiliado', 'AF0010', 'Isabel', 'Teresa', NULL, 'Moreno', 'Jiménez', TO_DATE('1979-06-14', 'YYYY-MM-DD'), 'F', 2, 3, 'Bióloga', 'POR TERCEROS', '123-456-7899', '234-567-8910', 'isabel.moreno@email.com', 'teresa.moreno@email.com', 'doc010.pdf', 'Calle Estrella, No. 707, Ciudad', 'Activo');

--BANCOS
INSERT INTO "SYSTEM"."BANCO" (ID_BANCO, NOMBRE, COD_BANCO) VALUES ('1', 'ATLANTIDA', '1');

COMMIT;


SELECT * FROM AFILIADO INNER JOIN TIPO_IDENTIFICACION ON 
AFILIADO.TIPO_IDENTIFICACION_ID = TIPO_IDENTIFICACION.ID_IDENTIFICACION;

