# Auditoría de Roles y Usuarios - Guía de Uso

## Descripción
Se ha implementado un sistema completo de auditoría para cambios de roles y gestión de usuarios, que registra automáticamente todas las operaciones críticas relacionadas con la seguridad del sistema.

## Endpoints Disponibles

### Gestión de Roles con Auditoría
- **PUT** `/api/role-management/user/{userId}/role` - Cambiar rol de usuario
- **GET** `/api/role-management/user/{userId}/role-history` - Historial de cambios de rol
- **GET** `/api/role-management/role-changes` - Todos los cambios de rol del sistema
- **GET** `/api/role-management/role-statistics` - Estadísticas de cambios de rol

### Gestión de Estado de Usuario con Auditoría
- **PUT** `/api/role-management/user/{userId}/enable` - Habilitar usuario
- **PUT** `/api/role-management/user/{userId}/disable` - Deshabilitar usuario
- **GET** `/api/role-management/user/{userId}/audit-history` - Historial completo de auditoría

### Consultas de Auditoría
- **GET** `/audit/usuario/{userId}` - Historial de auditoría del usuario
- **GET** `/audit/roles/cambios` - Todos los cambios de rol
- **GET** `/audit/roles/recientes` - Cambios de rol recientes (24h)
- **GET** `/audit/roles/estadisticas` - Estadísticas de cambios de rol
- **GET** `/audit/usuarios/creaciones` - Logs de creación de usuarios
- **GET** `/audit/usuarios/resumen` - Resumen de actividad de usuarios

## Ejemplos de Uso

### 1. Cambiar Rol de Usuario
```bash
curl -X PUT http://localhost:8080/api/role-management/user/123/role \
  -H "Content-Type: application/json" \
  -d '{
    "newRole": "OPERADOR",
    "reason": "Promoción a operador por desempeño",
    "performedBy": "admin@sistema.com"
  }'
```

### 2. Obtener Historial de Cambios de Rol
```bash
curl -X GET http://localhost:8080/api/role-management/user/123/role-history
```

### 3. Deshabilitar Usuario
```bash
curl -X PUT http://localhost:8080/api/role-management/user/123/disable \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Suspensión por violación de políticas",
    "performedBy": "admin@sistema.com"
  }'
```

### 4. Obtener Estadísticas de Cambios de Rol
```bash
curl -X GET http://localhost:8080/audit/roles/estadisticas
```

## Estructura de Datos de Auditoría

### Campos Principales de AuditLog
- `id`: ID único del registro de auditoría
- `entityType`: Tipo de entidad (USER, TURNO, ROLE, etc.)
- `entityId`: ID de la entidad auditada
- `action`: Acción realizada (ROLE_CHANGE, USER_CREATE, USER_ENABLE, etc.)
- `performedBy`: Usuario que realizó la acción
- `performedAt`: Timestamp de la acción
- `previousStatus`: Estado anterior (para cambios de rol)
- `newStatus`: Nuevo estado
- `oldValues`: Valores anteriores en JSON
- `newValues`: Nuevos valores en JSON
- `reason`: Motivo del cambio

### Tipos de Acción para Usuarios
- `ROLE_CHANGE`: Cambio de rol
- `USER_CREATE`: Creación de usuario
- `USER_UPDATE`: Actualización de datos
- `USER_ENABLE`: Habilitación de usuario
- `USER_DISABLE`: Deshabilitación de usuario

## Integración Automática

### En RegistrationService
- Los nuevos operadores se registran automáticamente en auditoría
- Se puede usar `registrarOperadorWithAudit()` para especificar quién registra

### En UserService
- Métodos con auditoría integrada:
  - `changeUserRole()`
  - `createUserWithAudit()`
  - `updateUserInfoWithAudit()`
  - `enableUserWithAudit()`
  - `disableUserWithAudit()`

## Configuración de Base de Datos

### Migración Requerida
Ejecutar el script: `staging/migration_audit_roles.sql`

```sql
-- Agregar nuevos campos
ALTER TABLE audit_log 
ADD COLUMN entity_type VARCHAR(50),
ADD COLUMN entity_id BIGINT;

-- Actualizar registros existentes
UPDATE audit_log 
SET entity_type = 'TURNO', entity_id = turno_id 
WHERE turno_id IS NOT NULL;

-- Crear índices
CREATE INDEX idx_audit_log_entity_type ON audit_log(entity_type);
CREATE INDEX idx_audit_log_entity_id ON audit_log(entity_id);
```

## Contexto de Auditoría

### AuditInterceptor
- Captura automáticamente el usuario actual de los headers HTTP
- Disponible en `AuditContext.getCurrentUser()`
- Se limpia automáticamente después de cada request

### Headers Soportados
- `X-User-ID`: ID del usuario
- `Authorization: Bearer <token>`: Token JWT
- Parámetro `userId` en query string

## Ejemplos de Respuesta

### Cambio de Rol Exitoso
```json
{
  "status_code": 200,
  "message": "Rol del usuario actualizado correctamente",
  "data": {
    "userId": 123,
    "email": "usuario@ejemplo.com",
    "newRole": "OPERADOR",
    "message": "Rol cambiado exitosamente"
  }
}
```

### Historial de Auditoría
```json
{
  "status_code": 200,
  "message": "Historial de auditoría del usuario recuperado correctamente",
  "data": [
    {
      "id": 456,
      "entityType": "USER",
      "entityId": 123,
      "action": "ROLE_CHANGE",
      "performedBy": "admin@sistema.com",
      "performedAt": "2025-09-09T14:30:00",
      "previousStatus": "PACIENTE",
      "newStatus": "OPERADOR",
      "reason": "Promoción a operador por desempeño"
    }
  ]
}
```

## Consideraciones de Seguridad

1. **Inmutabilidad**: Los registros de auditoría no pueden ser modificados
2. **Trazabilidad**: Cada cambio registra quién, qué, cuándo y por qué
3. **Integridad**: Los datos se almacenan en JSON para preservar el estado completo
4. **Indexación**: Consultas optimizadas para análisis de seguridad

## Monitoreo

### Alertas Recomendadas
- Cambios de rol a ADMINISTRADOR
- Múltiples cambios de rol en corto tiempo
- Deshabilitación masiva de usuarios
- Cambios realizados por usuarios inactivos

### Reportes de Seguridad
- Cambios de rol por período
- Actividad por usuario administrador
- Usuarios creados/deshabilitados por día
- Análisis de patrones sospechosos
