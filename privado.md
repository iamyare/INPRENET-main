# API Documentación - Servicio de Información de Pago

## Endpoint

### **Obtener Información de Pago**

**Descripción:**
Obtiene la información de las planillas pendientes de un colegio privado, incluyendo el código de planilla, el monto total, la mora acumulada, el mes y el año.

**URL:**

`GET /planilla-privados/informacion-pago/:codigoColegio`


**Descripción:**
Obtiene la información de las planillas pendientes de un colegio privado, incluyendo el código de planilla, el monto total, la mora acumulada, el mes y el año.

---

### **Parámetros**

| Nombre           | Tipo   | Descripción                      |
|------------------|--------|----------------------------------|
| `codigoColegio`  | String | Código único del colegio privado |

---

### **Respuesta Exitosa**

```json
{
  "codigo_colegio": "COL12345",
  "nombre_colegio": "Colegio San José",
  "planillas": [
    {
      "codigo_planilla": "PLAN001",
      "monto_total": 21000,
      "mora": 1000,
      "mes": "Enero",
      "año": 2025
    },
    {
      "codigo_planilla": "PLAN002",
      "monto_total": 15500,
      "mora": 500,
      "mes": "Febrero",
      "año": 2025
    }
  ]
}
```
---

### **Errores**

#### **Error: Código del colegio inválido o sin planillas pendientes**

**Código:** `404 Not Found`

**Mensaje:**
```json
{
  "error": "El código del colegio no es válido o no tiene planillas pendientes."
}
```
## Endpoint

### **Notificar Pago**

**Descripción:**
Permite que un banco notifique el pago de una o más planillas pendientes de un colegio privado. Actualiza el estado de las planillas a "Pagada" si el pago es exitoso.

**URL:**

`POST /planilla-privados/notificar-pago`

---

### **Cuerpo de la Solicitud**

```json
{
  "codigo_colegio": "COL12345",
  "planillas": [
    {
      "codigo_planilla": "PLAN001",
      "monto_pagado": 21000,
      "fecha_pago": "2025-01-10T10:00:00.000Z",
      "referencia_pago": "BANCO001",
      "cajero": "Cajero 1",
      "lugar": "Sucursal Central"
    },
    {
      "codigo_planilla": "PLAN002",
      "monto_pagado": 15500,
      "fecha_pago": "2025-01-10T11:00:00.000Z",
      "referencia_pago": "BANCO002",
      "cajero": "Cajero 2",
      "lugar": "Sucursal Este"
    }
  ]
}
```
### **Respuesta Exitosa**

```json
{
  "mensaje": "Procesamiento completado",
  "pagosProcesados": [
    {
      "codigo_planilla": "PLAN001",
      "monto_pagado": 21000,
      "fecha_pago": "2025-01-10T10:00:00.000Z",
      "referencia_pago": "BANCO001",
      "cajero": "Cajero 1",
      "lugar": "Sucursal Central"
    },
    {
      "codigo_planilla": "PLAN002",
      "monto_pagado": 15500,
      "fecha_pago": "2025-01-10T11:00:00.000Z",
      "referencia_pago": "BANCO002",
      "cajero": "Cajero 2",
      "lugar": "Sucursal Este"
    }
  ],
  "errores": []
}
```
### **Errores**

#### **Error: Código del colegio inválido**

**Código:** `404 Not Found`

**Mensaje:**
```json
{
  "error": "El código del colegio no es válido."
}
```
#### **Error: Planilla no encontrada o ya pagada**

**Código:** `200 OK` (con errores específicos en la respuesta)

**Mensaje:**
```json
{
  "mensaje": "Procesamiento completado",
  "pagosProcesados": [],
  "errores": [
    {
      "codigo_planilla": "PLAN001",
      "error": "Planilla no encontrada o ya pagada."
    }
  ]
}
```