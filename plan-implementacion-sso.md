# Plan de Implementación de Single Sign-On (SSO) con Control de Sesión Única

## 1. Contexto Actual

```mermaid
graph TD
    A[Usuario] -->|Login| B[Auth Service]
    B -->|Valida Credenciales| C[Users Service]
    C -->|Genera Token| D[JWT]
    D -->|Guarda Token| E[User Sessions Table]
    E -->|Retorna Token| A
```

### Componentes Existentes

- Tabla `user_sessions` con campos básicos
- Manejo de tokens JWT
- Control de inactividad en frontend
- Manejo básico de sesiones por dispositivo

## 2. Cambios Propuestos

### 2.1 Backend (NestJS)

#### A. Base de Datos

```sql
-- Modificar tabla user_sessions
ALTER TABLE user_sessions
ADD active BOOLEAN DEFAULT TRUE,
ADD lastActivity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD deviceInfo VARCHAR2(500),
ADD ipAddress VARCHAR2(45);

-- Índices para optimización
CREATE INDEX idx_user_sessions_user_active ON user_sessions(user_id, active);
CREATE INDEX idx_user_sessions_token ON user_sessions(token);
```

#### B. Arquitectura de Servicios

```mermaid
graph TD
    A[Auth Controller] -->|Login Request| B[Auth Service]
    B -->|Validate| C[Users Service]
    B -->|Manage Sessions| D[Session Service]
    D -->|Store| E[(user_sessions)]
    F[SSE Controller] -->|Emit Events| G[Connected Clients]
    H[Session Guard] -->|Validate| D
    I[Session Middleware] -->|Check Active| D
```

1. **SessionService (Nuevo)**

   - Gestionar sesiones activas
   - Invalidar sesiones anteriores
   - Mantener registro de actividad

2. **SSE Controller (Nuevo)**

   ```typescript
   @Controller('api/sse')
   export class SSEController {
     @Get('session-events')
     @Sse()
     sessionEvents(): Observable<MessageEvent> {
       return interval(1000).pipe(
         map(() => ({ data: { type: 'session-check' } }))
       )
     }
   }
   ```

3. **Middleware de Sesión Activa (Actualizar)**
   - Verificar token activo
   - Actualizar última actividad
   - Validar límite de sesiones

### 2.2 Frontend (Angular)

```mermaid
graph TD
    A[Auth Service] -->|Login| B[HTTP Client]
    A -->|Subscribe| C[Session Events Service]
    C -->|SSE Events| D[Session Manager]
    D -->|Handle Logout| E[Router]
    D -->|Show Alert| F[Toast Service]
```

1. **SessionEventsService (Nuevo)**

```typescript
@Injectable({
  providedIn: 'root'
})
export class SessionEventsService {
  private eventSource: EventSource

  constructor() {
    this.eventSource = new EventSource('/api/sse/session-events')
    this.eventSource.onmessage = (event) => {
      // Manejar eventos de sesión
    }
  }
}
```

2. **AuthInterceptor (Actualizar)**

   - Adjuntar headers de dispositivo
   - Manejar errores de sesión
   - Redireccionar en invalidación

3. **UI Components**
   - Modal de sesión terminada (informando que se cerró la sesión por inicio en otro dispositivo)
   - Indicador de sesión activa

## 3. Flujos de Trabajo

### 3.1 Inicio de Sesión

```mermaid
sequenceDiagram
    participant U as Usuario
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant SSE as SSE Events

    U->>F: Login
    F->>B: POST /auth/login
    B->>DB: Verificar credenciales
    B->>DB: Invalidar sesiones anteriores
    B->>DB: Crear nueva sesión
    B->>SSE: Emitir evento de sesión
    B->>F: Retornar nuevo token
    F->>U: Redirigir a dashboard
```

### 3.2 Validación Continua

```mermaid
sequenceDiagram
    participant F as Frontend
    participant B as Backend
    participant DB as Database
    participant SSE as SSE Events

    F->>B: Request con token
    B->>DB: Verificar sesión activa
    alt Sesión inválida
        B->>SSE: Emitir evento de invalidación
        SSE->>F: Notificar invalidación
        F->>F: Cerrar sesión local
    else Sesión válida
        B->>F: Respuesta exitosa
        F->>F: Actualizar último acceso
    end
```

## 4. Beneficios del Cambio a SSE

1. **Simplicidad**

   - Comunicación unidireccional del servidor al cliente
   - No requiere manejo de reconexiones como WebSocket
   - Mejor para eventos infrecuentes como invalidación de sesiones

2. **Eficiencia**

   - Menor overhead que WebSocket
   - Usa conexión HTTP estándar
   - Mejor manejo de firewalls y proxies

3. **Mantenibilidad**
   - Código más simple y directo
   - Menos estados que manejar
   - Integración más sencilla con Angular

## 5. Plan de Implementación

1. **Fase 1: Preparación**

   - Modificar tabla user_sessions
   - Implementar SessionService básico
   - Crear endpoints SSE

2. **Fase 2: Backend**

   - Implementar lógica de sesión única
   - Configurar emisión de eventos SSE
   - Actualizar middleware y guards

3. **Fase 3: Frontend**

   - Implementar SessionEventsService
   - Actualizar AuthService
   - Crear componentes UI

4. **Fase 4: Pruebas**

   - Validar manejo de sesiones múltiples
   - Probar escenarios de desconexión
   - Verificar notificaciones al usuario

5. **Fase 5: Despliegue**
   - Actualizar documentación
   - Desplegar cambios en base de datos
   - Monitorear comportamiento en producción
