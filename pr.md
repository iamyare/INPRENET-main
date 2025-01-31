
# Documentación de API - Versión 1.4

## **Base URL:**  

`http://10.100.0.84:3000/api/conasa`

---

## Requisitos de Seguridad

Todos los endpoints requieren autenticación utilizando **Basic Auth**. El cliente debe enviar la cabecera `Authorization` con el siguiente formato:

---

## Errores Comunes de Autenticación

Los siguientes errores aplican a todos los endpoints que requieren autenticación:

| Código HTTP | Error                               | Descripción                                     |
|-------------|-------------------------------------|------------------------------------------------|
| 401         | No authorization header present     | La cabecera `Authorization` no fue enviada.    |
| 401         | Invalid authorization format        | El formato de la cabecera es incorrecto.       |
| 401         | Failed to decode or validate authorization | Error al decodificar las credenciales.    |
| 401         | Invalid password                    | La contraseña proporcionada es incorrecta.     |

---

## Endpoints

### 1. Buscar Afiliado

**URL:** `/buscar-afiliado`  
**Método:** `GET`  
**Descripción:** Busca afiliados en la base de datos mediante **DNI** o **nombres y apellidos**.

#### Parámetros de Consulta

| Nombre   | Tipo   | Requerido | Descripción                                   |
|----------|--------|-----------|-----------------------------------------------|
| tipo     | string | Sí        | Tipo de búsqueda: `1` para DNI o `2` para nombres/apellidos. |
| terminos | string | Sí        | El término de búsqueda.                       |

#### Validaciones y Reglas

- La cabecera `Authorization` es obligatoria y debe estar en formato `Basic`.
- `tipo` debe ser `1` (DNI) o `2` (Nombres y Apellidos).
- `terminos` es obligatorio:
  - Si `tipo` es `1`, debe ser un DNI válido.
  - Si `tipo` es `2`, debe contener exactamente dos palabras (nombres o apellidos).

#### Ejemplo de Solicitud  

**Tipo 1 - Búsqueda por DNI:**  

**GET** /api/conasa/buscar-afiliado?tipo=1&terminos=0801199001234

**Authorization: Basic** <Base64(email:password)>

**Tipo 2 - Búsqueda por Nombres y Apellidos:**

**GET** /api/conasa/buscar-afiliado?tipo=2&terminos=Juan%20Perez

**Authorization: Basic** <Base64(email:password)>


#### Respuesta Exitosa

**Tipo 1 - Búsqueda por DNI:**  
```json
{
  "message": "Consulta realizada exitosamente",
  "data": {
    "N_IDENTIFICACION": "1401197400858",
    "PRIMER_NOMBRE": "JUAN",
    "SEGUNDO_NOMBRE": "RAMON",
    "TERCER_NOMBRE": null,
    "PRIMER_APELLIDO": "JIMENEZ",
    "SEGUNDO_APELLIDO": "HERNANDEZ",
    "SEXO": "M",
    "DIRECCION_RESIDENCIA": "BARRIO SAN ANDRES,ANTIGUA OCOTEPEQUE",
    "FECHA_NACIMIENTO": "1959-03-15",
    "TELEFONO_1": null,
    "TELEFONO_2": null,
    "CORREO_1": null,
    "DEPARTAMENTO_RESIDENCIA": "OCOTEPEQUE",
    "MUNICIPIO_RESIDENCIA": "OCOTEPEQUE",
    "ESTADO": "VIVO",
    "TIPOS_PERSONA": [
      "AFILIADO"
    ]
  }
}
```

**Tipo 2 - Búsqueda por Nombres y Apellidos:**
```json
{
  "message": "Consulta realizada exitosamente",
  "data": [
    {
      "N_IDENTIFICACION": "",
      "PRIMER_NOMBRE": "",
      "SEGUNDO_NOMBRE": "",
      "TERCER_NOMBRE": null,
      "PRIMER_APELLIDO": "",
      "SEGUNDO_APELLIDO": "",
      "SEXO": "",
      "DIRECCION_RESIDENCIA": "",
      "FECHA_NACIMIENTO": "",
      "TELEFONO_1": "",
      "TELEFONO_2": null,
      "CORREO_1": "",
      "DEPARTAMENTO_RESIDENCIA": "",
      "MUNICIPIO_RESIDENCIA": "",
      "MUNICIPIO_NACIMIENTO": "",
      "DEPARTAMENTO_NACIMIENTO": "",
      "ESTADO": "",
      "TIPOS_PERSONA": [
        ""
      ]
    },
    {
      "N_IDENTIFICACION": "",
      "PRIMER_NOMBRE": "",
      "SEGUNDO_NOMBRE": "",
      "TERCER_NOMBRE": null,
      "PRIMER_APELLIDO": "",
      "SEGUNDO_APELLIDO": "",
      "SEXO": "",
      "DIRECCION_RESIDENCIA": "",
      "FECHA_NACIMIENTO": "",
      "TELEFONO_1": "",
      "TELEFONO_2": null,
      "CORREO_1": "",
      "DEPARTAMENTO_RESIDENCIA": "",
      "MUNICIPIO_RESIDENCIA": "",
      "MUNICIPIO_NACIMIENTO": "",
      "DEPARTAMENTO_NACIMIENTO": "",
      "ESTADO": "",
      "TIPOS_PERSONA": [
        ""
      ]
    }
  ]
}
```

#### Errores Comunes

| Código HTTP | Error                                 | Descripción                                   |
|-------------|---------------------------------------|-----------------------------------------------|
| 400         | Debe proporcionar exactamente dos términos de búsqueda | Solo aplica para `tipo=2`. |
| 400         | Tipo de consulta no válido           | `tipo` debe ser `1` o `2`.                   |
| 404         | Afiliado con N_IDENTIFICACION no existe | No se encontró un afiliado con el DNI proporcionado. |
| 404         | No persons found with terms          | No se encontraron personas con los términos proporcionados. |

### 2. Planilla de Contratos Activos

**URL:** `/planilla-activos`

**Método:** `GET`

**Descripción:** Obtiene la lista de contratos activos.

#### Ejemplo de Solicitud

**GET** /api/conasa/planilla-activos

**Authorization: Basic** <Base64(email:password)>

#### Respuesta Exitosa

``` json
{ 
  "message": "Consulta de planilla realizada exitosamente.", 
  "data": {} 
} 
```
### 3. Registrar Consulta Médica

**URL:** `/registrar-consulta-medica`  
**Método:** `POST`  
**Descripción:** Permite registrar consultas médicas para los afiliados en el sistema. Cada consulta está asociada a un afiliado identificado por su `n_identificacion`.

#### Cuerpo de la Solicitud

Se debe enviar un array de objetos en el cuerpo de la solicitud, con la siguiente estructura para cada objeto:

| Campo                 | Tipo     | Requerido | Descripción                                       |
|------------------------|----------|-----------|---------------------------------------------------|
| n_identificacion       | string   | Sí        | Número de identificación del afiliado.           |
| fecha_consulta         | string   | Sí        | Fecha de la consulta en formato `YYYY-MM-DD`.    |
| motivo_consulta        | string   | Sí        | Motivo principal de la consulta (máx. 255 caracteres). |
| tiempo_sintomas        | string   | Sí        | Tiempo que el paciente lleva con los síntomas.   |
| tipo_atencion          | string   | Sí        | Tipo de atención.      |
| triage                 | string   | Sí        | Nivel de triage asignado.|
| diagnostico_presuntivo | string   | Sí        | Diagnóstico presuntivo realizado (máx. 255 caracteres). |
| detalle_atencion       | string   | No        | Detalles de la atención proporcionada (máx. 500 caracteres). |
| fecha_cierre           | string   | No        | Fecha de cierre de la consulta en formato `YYYY-MM-DD`. |

Ejemplo de cuerpo de solicitud:
```json
[
  {
    "n_identificacion": "1401197400858",
    "fecha_consulta": "2024-12-15",
    "motivo_consulta": "Dolor abdominal agudo",
    "tiempo_sintomas": "3 días",
    "tipo_atencion": "Presencial",
    "triage": "III",
    "diagnostico_presuntivo": "Gastritis",
    "detalle_atencion": "Se recetó omeprazol y dieta baja en grasas.",
    "fecha_cierre": "2024-12-16"
  },
  {
    "n_identificacion": "1401197400858",
    "fecha_consulta": "2024-12-14",
    "motivo_consulta": "Fiebre persistente",
    "tiempo_sintomas": "5 días",
    "tipo_atencion": "Virtual",
    "triage": "II",
    "diagnostico_presuntivo": "Infección viral",
    "detalle_atencion": "Recomendado paracetamol y reposo.",
    "fecha_cierre": "2024-12-15"
  }
]
```
#### Validaciones

- **n_identificacion:** Debe existir en la base de datos.
- **fecha_consulta:** Debe ser una fecha válida en formato ISO8601 (`YYYY-MM-DD`).
- **motivo_consulta:** Máximo 255 caracteres.
- **detalle_atencion:** Máximo 500 caracteres.
- **fecha_cierre:** Opcional, pero debe ser una fecha válida si se proporciona.

#### Respuestas

| Código HTTP | Descripción                               |
|-------------|-------------------------------------------|
| 201         | Proceso de registro completado.           |
| 401         | Error de autorización (credenciales inválidas o usuario no autorizado). |
| 404         | Persona con identificación no encontrada. |
| 500         | Error en el proceso de registro.          |

Ejemplo de respuesta exitosa:
```json
{
  "message": "Proceso de registro de asistencias médicas completado.",
  "totalExitosos": 2,
  "fallidos": []
}
```
Ejemplo de respuesta con errores parciales:
```json
{
  "message": "Proceso de registro de asistencias médicas completado.",
  "totalExitosos": 1,
  "fallidos": [
    {
      "n_identificacion": "1401197400858",
      "error": "Persona con identificación 1401197400858 no encontrada."
    }
  ]
}
```
#### Errores Comunes

| Código HTTP | Error                                   | Descripción                                   |
|-------------|-----------------------------------------|-----------------------------------------------|
| 404         | Persona con identificación no encontrada | No se encontró una persona con el DNI proporcionado. |
| 500         | Error en el proceso de registro        | Ocurrió un error interno durante el proceso.  |


### 4. Obtener Datos de Cuadres

**URL:** `/cuadres`  
**Método:** `GET`  
**Descripción:** Proporciona datos sobre el estado de los cuadres para análisis según el tipo de consulta proporcionado.

#### Parámetros de Consulta

| Nombre | Tipo   | Requerido | Descripción                                                    |
|--------|--------|-----------|----------------------------------------------------------------|
| tipo   | number | Sí        | Tipo de consulta: `1` para cuadres de planillas, `2` para contratos. |

#### Autenticación

- Este endpoint requiere autenticación mediante `Basic Auth`.  
- La cabecera `Authorization` debe estar en formato `Basic <Base64(email:password)>`.

#### Validaciones

- `tipo` es obligatorio y debe ser `1` o `2`.
- La cabecera `Authorization` debe ser válida.
- Se verifican las credenciales del usuario en la base de datos.

---

#### Ejemplo de Solicitud  

**Tipo 1 - Resumen de docentes pensionados activos en el mes:**  

**GET** `/api/conasa/cuadres?tipo=1`
**Authorization:** `Basic <Base64(email:password)>`  

**Tipo 2 - Resumen de Contratos asistencia funeraria en el mes:**

**GET** `/api/conasa/cuadres?tipo=2`  
**Authorization:** `Basic <Base64(email:password)>`

---

#### Respuestas

**Tipo 1 - Cuadres de Planillas:**
```json
[
  {
    "mes": "2024-12",
    "tot_no_pensionados_activos": 200,
    "altas": 15,
    "bajas": 5
  },
  {
    "mes": "2024-11",
    "tot_no_pensionados_activos": 190,
    "altas": 0,
    "bajas": 0
  }
]
```
**Tipo 2 - Cuadres de Contratos:**  

#### Respuesta Exitosa

```json
[
  {
    "mes": "2024-12",
    "nombre_categoria": "Salud",
    "tot_no_general_contratos_activos": 150,
    "altas": 10,
    "cancelaciones": 5,
    "total_valor_general_contratos": 75000,
    "planes": [
      {
        "nombre_plan": "Plan Básico",
        "tot_no_contratos_activos": 80,
        "total_valor_contratos": 40000
      },
      {
        "nombre_plan": "Plan Avanzado",
        "tot_no_contratos_activos": 70,
        "total_valor_contratos": 35000
      }
    ]
  }
]
```
#### Errores Comunes

| Código HTTP | Error                                    | Descripción                                                      |
|-------------|------------------------------------------|------------------------------------------------------------------|
| 400         | Tipo de consulta no válido              | El parámetro `tipo` debe ser `1` o `2`.                         |
| 404         | No se encontraron datos                 | No existen registros para el tipo de consulta especificado.     |
| 500         | Error en el proceso                     | Error interno durante la ejecución del proceso.                 |
