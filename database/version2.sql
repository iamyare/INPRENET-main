DROP TABLE afiliados_por_banco CASCADE CONSTRAINTS;
DROP TABLE afiliado CASCADE CONSTRAINTS;
DROP TABLE banco CASCADE CONSTRAINTS;
DROP TABLE centro_trabajo CASCADE CONSTRAINTS;
DROP TABLE ciudad CASCADE CONSTRAINTS;
DROP TABLE empleado CASCADE CONSTRAINTS;
DROP TABLE empleado_empresa CASCADE CONSTRAINTS;
DROP TABLE empresa CASCADE CONSTRAINTS;
DROP TABLE pais CASCADE CONSTRAINTS;
DROP TABLE perf_afil_cent_trab CASCADE CONSTRAINTS;
DROP TABLE provincia CASCADE CONSTRAINTS;
DROP TABLE referencia_personal CASCADE CONSTRAINTS;
DROP TABLE rol CASCADE CONSTRAINTS;
DROP TABLE tipo_identificacion CASCADE CONSTRAINTS;
DROP TABLE usuario CASCADE CONSTRAINTS;

CREATE TABLE afiliado (
    id_afiliado            VARCHAR2(40 CHAR) NOT NULL,
    pais_id_pais2          VARCHAR2(30 CHAR) NOT NULL,
    fecha_nacimiento       DATE,
    primer_nombre          NVARCHAR2(40),
    segundo_nombre         NVARCHAR2(40),
    tercer_nombre          VARCHAR2(30 CHAR),
    primer_apellido        VARCHAR2(30 CHAR),
    segundo_apellido       VARCHAR2(30 CHAR),
    sexo                   CHAR(1 CHAR),
    cantidad_dependientes  INTEGER,
    cantidad_hijos         INTEGER,
    profesion              VARCHAR2(30 CHAR),
    representacion         VARCHAR2(30 CHAR),
    telefono_1             VARCHAR2(20 CHAR),
    telefono_2             VARCHAR2(20 CHAR),
    correo_1               VARCHAR2(40 CHAR),
    correo_2               VARCHAR2(40 CHAR),
    tipo_id_identificacion VARCHAR2(40 CHAR) NOT NULL,
    afiliado_id_afiliado   VARCHAR2(40 CHAR) NOT NULL,
    archivo_identificacion NVARCHAR2(300),
    direccion_residencia   NVARCHAR2(200),
    estado                 NVARCHAR2(100),
    pais_id_pais           VARCHAR2(30 CHAR) NOT NULL
);

ALTER TABLE afiliado
    ADD CHECK ( sexo IN ( 'F', 'M' ) );

ALTER TABLE afiliado
    ADD CONSTRAINT tipo_representacion CHECK ( representacion IN ( 'POR CUENTA PROPIA', 'POR TERCEROS' ) );

CREATE UNIQUE INDEX afiliado__idx ON
    afiliado (
        id_afiliado
    ASC );

CREATE INDEX afiliado__idxv3 ON
    afiliado (
        afiliado_id_afiliado
    ASC );

CREATE UNIQUE INDEX afiliado__idxv1 ON
    afiliado (
        pais_id_pais2
    ASC );

CREATE UNIQUE INDEX afiliado__idxv4 ON
    afiliado (
        tipo_id_identificacion
    ASC );

CREATE UNIQUE INDEX afiliado__idxv2 ON
    afiliado (
        pais_id_pais
    ASC );

ALTER TABLE afiliado ADD CONSTRAINT afiliado_pk PRIMARY KEY ( id_afiliado );

CREATE TABLE afiliados_por_banco (
    id_af_por_banco      VARCHAR2(30 CHAR) NOT NULL,
    id_afiliado1         VARCHAR2(40 CHAR),
    id_banco             VARCHAR2(40 CHAR),
    num_cuenta           VARCHAR2(40 CHAR),
    afiliado_id_afiliado VARCHAR2(40 CHAR) NOT NULL,
    id_afiliado          VARCHAR2(40 CHAR) NOT NULL,
    banco_id_banco       VARCHAR2(40 CHAR) NOT NULL,
    banco_id_banco3      VARCHAR2(40 CHAR) NOT NULL,
    banco_id_banco2      VARCHAR2(40 CHAR) NOT NULL
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
    nombre              VARCHAR2(40 CHAR),
    id_municipio        VARCHAR2(30 CHAR),
    nombre_1            VARCHAR2(40 CHAR),
    telefono_1          VARCHAR2(30 CHAR),
    telefono_2          VARCHAR2(30 CHAR),
    correo_1            VARCHAR2(40 CHAR),
    correo_2            VARCHAR2(50 CHAR),
    ciudad_id_ciudad    VARCHAR2(40 CHAR) NOT NULL,
    telefono            NVARCHAR2(10),
    apoderado_legal     NVARCHAR2(50),
    representante_legal NVARCHAR2(50),
    rtn                 NVARCHAR2(14),
    logo                NVARCHAR2(300)
);

ALTER TABLE centro_trabajo ADD CONSTRAINT centro_trabajo_pk PRIMARY KEY ( id_centro_trabajo );

CREATE TABLE ciudad (
    id_ciudad              VARCHAR2(40 CHAR) NOT NULL,
    nombre                 VARCHAR2(40 CHAR),
    provincia_id_provincia VARCHAR2(40 CHAR) NOT NULL
);

ALTER TABLE ciudad ADD CONSTRAINT municipio_pk PRIMARY KEY ( id_ciudad );

CREATE TABLE empleado (
    id_empleado            NCHAR(36) NOT NULL,
    nombre_puesto          NVARCHAR2(50),
    numero_empleado        INTEGER,
    telefono_empleado      INTEGER,
    usuario_id_usuario     NVARCHAR2(36) NOT NULL,
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
    id_centro_trabajo1     VARCHAR2(40 CHAR),
    id_afiliado1           VARCHAR2(40 CHAR),
    cargo                  VARCHAR2(40 CHAR),
    sector_economico       VARCHAR2(40 CHAR),
    actividad_economica    VARCHAR2(40 CHAR),
    clase_cliente          VARCHAR2(40 CHAR),
    fecha_ingreso          DATE,
    fecha_pago             DATE,
    sector                 VARCHAR2(40 CHAR),
    numero_acuerdo         VARCHAR2(50 CHAR),
    salario_neto           NUMBER,
    id_centro_trabajo      VARCHAR2(40 CHAR) NOT NULL,
    afiliado_id_afiliado   VARCHAR2(40 CHAR) NOT NULL,
    id_afiliado            VARCHAR2(40 CHAR) NOT NULL
);

ALTER TABLE perf_afil_cent_trab
    ADD CHECK ( sector IN ( 'JUBILADO', 'PEDAGOGICO', 'PRIVADO', 'PROHECO', 'PUBLICO' ) );

ALTER TABLE perf_afil_cent_trab ADD CONSTRAINT perf_afil_cent_trab_pk PRIMARY KEY ( id_perf_afil_cent_trab );

CREATE TABLE provincia (
    id_provincia VARCHAR2(40 CHAR) NOT NULL,
    nombre       VARCHAR2(30 CHAR),
    pais_id_pais VARCHAR2(30 CHAR) NOT NULL
);

ALTER TABLE provincia ADD CONSTRAINT departamento_pk PRIMARY KEY ( id_provincia );

CREATE TABLE referencia_personal (
    id_ref_personal      VARCHAR2(40 CHAR) NOT NULL,
    nombre               VARCHAR2(30 CHAR),
    direccion            VARCHAR2(50 CHAR),
    parentesco           VARCHAR2(30 CHAR),
    telefono_domicilio   VARCHAR2(20 CHAR),
    telefono_trabajo     VARCHAR2(20 CHAR),
    telefono_celular     VARCHAR2(20 CHAR),
    afiliado_id_afiliado VARCHAR2(40 CHAR) NOT NULL,
    id_afiliado          VARCHAR2(40 CHAR) NOT NULL
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
    nombre                 VARCHAR2(30 CHAR),
    pregunta_de_usuario_1  NVARCHAR2(100),
    respuesta_de_usuario_1 NVARCHAR2(100),
    pregunta_de_usuario_2  NVARCHAR2(100),
    respuesta_de_usuario_2 NVARCHAR2(100),
    pregunta_de_usuario_3  NVARCHAR2(100),
    respuesta_de_usuario_3 NVARCHAR2(100),
    estado                 NVARCHAR2(50) DEFAULT 'INACTIVO',
    fecha_creacion         NVARCHAR2(50),
    fecha_verificacion     DATE,
    fecha_modificacion     NVARCHAR2(50),
    correo                 NVARCHAR2(200),
    contraseña             NVARCHAR2(200),
    rol_id_rol             NVARCHAR2(36) NOT NULL,
    fk_id_ident            VARCHAR2(40 CHAR) NOT NULL
);

ALTER TABLE usuario
    ADD CONSTRAINT estadouser CHECK ( estado IN ( 'ACTIVO', 'DESHABILITADO', 'INACTIVO' ) );

CREATE UNIQUE INDEX usuario__idx ON
    usuario (
        id_usuario
    ASC );

CREATE UNIQUE INDEX usuario__idxv1 ON
    usuario (
        rol_id_rol
    ASC );

CREATE UNIQUE INDEX usuario__idxv5 ON
    usuario (
        fk_id_ident
    ASC );

ALTER TABLE usuario ADD CONSTRAINT usuario_pk PRIMARY KEY ( id_usuario );

ALTER TABLE afiliados_por_banco
    ADD CONSTRAINT afil_por_banco_fk FOREIGN KEY ( afiliado_id_afiliado )
        REFERENCES afiliado ( id_afiliado );

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
    ADD CONSTRAINT afiliado_tipo_id_fk FOREIGN KEY ( tipo_id_identificacion )
        REFERENCES tipo_identificacion ( id_identificacion );

ALTER TABLE afiliados_por_banco
    ADD CONSTRAINT afiliados_por_banco_banco_fk FOREIGN KEY ( banco_id_banco )
        REFERENCES banco ( id_banco );

ALTER TABLE afiliados_por_banco
    ADD CONSTRAINT afiliados_por_banco_banco_fkv1 FOREIGN KEY ( banco_id_banco3 )
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
    ADD CONSTRAINT perf_afil_cent_trab_fk FOREIGN KEY ( afiliado_id_afiliado )
        REFERENCES afiliado ( id_afiliado );

ALTER TABLE provincia
    ADD CONSTRAINT provincia_pais_fk FOREIGN KEY ( pais_id_pais )
        REFERENCES pais ( id_pais );

ALTER TABLE referencia_personal
    ADD CONSTRAINT ref_per_afili_fk FOREIGN KEY ( afiliado_id_afiliado )
        REFERENCES afiliado ( id_afiliado );

ALTER TABLE perf_afil_cent_trab
    ADD CONSTRAINT trab_cent_trab_fk FOREIGN KEY ( id_centro_trabajo )
        REFERENCES centro_trabajo ( id_centro_trabajo );

ALTER TABLE usuario
    ADD CONSTRAINT usuario_rol_fk FOREIGN KEY ( rol_id_rol )
        REFERENCES rol ( id_rol );

ALTER TABLE usuario
    ADD CONSTRAINT usuario_tipo_id_fkv1 FOREIGN KEY ( fk_id_ident )
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