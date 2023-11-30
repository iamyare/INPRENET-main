CREATE TABLE Identificacion (
  id_identificacion NUMBER PRIMARY KEY,
  tipo_identificacion VARCHAR2(50) NOT NULL CHECK (tipo_identificacion IN ('NUMERO DE IDENTIDAD', 'RTN', 'CARNET DE RESIDENCIA', 'NUMERO DE LICENCIA', 'PASAPORTE'))
);


CREATE TABLE Empresa (
  id VARCHAR2(36) PRIMARY KEY,
  RTN NUMBER,
  nombre VARCHAR2(255) NOT NULL,
  representante_legal VARCHAR2(255),
  apoderado_legal VARCHAR2(255),
  telefono VARCHAR2(20),
  correo VARCHAR2(255),
  logo VARCHAR2(255)
);


CREATE TABLE Rol (
  id NUMBER PRIMARY KEY,
  nombre_rol VARCHAR2(50) NOT NULL
);

CREATE TABLE Usuario (
  id VARCHAR2(36) PRIMARY KEY,
  nombre VARCHAR2(255) NOT NULL,
  correo VARCHAR2(255) NOT NULL,
  contrasena VARCHAR2(255),
  tipoDeUsuario VARCHAR2(255),
  pregunta_seguridad_1 VARCHAR2(255),
  respuesta_seguridad_1 VARCHAR2(255),
  pregunta_seguridad_2 VARCHAR2(255),
  respuesta_seguridad_2 VARCHAR2(255),
  pregunta_seguridad_3 VARCHAR2(255),
  respuesta_seguridad_3 VARCHAR2(255),
  rol_id NUMBER,
  estado VARCHAR2(50) DEFAULT 'sin verificar' NOT NULL,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_modificacion TIMESTAMP,
  CONSTRAINT fk_rol FOREIGN KEY (rol_id) REFERENCES Rol(id)
);

CREATE TABLE Empleado (
  id VARCHAR2(36) PRIMARY KEY,
  puesto VARCHAR2(255),
  numero_empleado NUMBER UNIQUE,
  telefono VARCHAR2(20),
  id_identificacion NUMBER UNIQUE,
  usuario_id VARCHAR2(36) UNIQUE,
  CONSTRAINT fk_id_identificacion FOREIGN KEY (id_identificacion) REFERENCES Identificacion(id_identificacion),
  CONSTRAINT fk_usuario_empleado FOREIGN KEY (usuario_id) REFERENCES Usuario(id)
);

CREATE TABLE Empleado_Empresa (
  empleado_id VARCHAR2(36) PRIMARY KEY,
  empresa_id VARCHAR2(36) UNIQUE,
  CONSTRAINT fk_empleado FOREIGN KEY (empleado_id) REFERENCES Empleado(id),
  CONSTRAINT fk_empresa FOREIGN KEY (empresa_id) REFERENCES Empresa(id)
);