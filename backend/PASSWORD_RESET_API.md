# API de Autenticación y Recuperación de Contraseñas

Este documento describe los endpoints disponibles para autenticación y recuperación de contraseñas en el sistema TurneroWeb. Todos los endpoints están unificados en el controlador `AuthController.java`.

## Endpoints de Autenticación

### Login
**POST** `/api/auth/login`

### Refresh Token
**POST** `/api/auth/refresh`

### Registro de Paciente
**POST** `/api/auth/register`

### Verificar Email
**POST** `/api/auth/check-email`

### Cambiar Contraseña (Usuario autenticado)
**POST** `/api/auth/change-password`

### Políticas de Contraseña
**GET** `/api/auth/password-policy`

## Endpoints de Recuperación de Contraseña

### 1. Solicitar Recuperación de Contraseña

**POST** `/api/auth/forgot-password`

Envía un enlace de recuperación al email del usuario.

#### Request Body
```json
{
  "email": "usuario@ejemplo.com"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Si el email existe en nuestro sistema, recibirás un enlace para restablecer tu contraseña",
  "data": null
}
```

#### Notas de Seguridad
- Por razones de seguridad, siempre retorna la misma respuesta independientemente de si el email existe o no
- Previene la enumeración de usuarios válidos en el sistema

### 2. Validar Token de Recuperación

**GET** `/api/auth/validate-reset-token?token={token}`

Verifica si un token de recuperación es válido y no ha expirado.

#### Query Parameters
- `token` (string): Token de recuperación a validar

#### Response (200 OK) - Token Válido
```json
{
  "success": true,
  "message": "Token válido",
  "data": {
    "valid": true,
    "message": "Token válido",
    "userEmail": "us***@ejemplo.com"
  }
}
```

#### Response (400 Bad Request) - Token Inválido
```json
{
  "success": false,
  "message": "Token inválido",
  "data": {
    "valid": false,
    "message": "Token inválido o expirado"
  }
}
```

### 3. Restablecer Contraseña

**POST** `/api/auth/reset-password`

Cambia la contraseña del usuario usando un token válido.

#### Request Body
```json
{
  "token": "abc123...",
  "newPassword": "nuevaContraseña123"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Contraseña restablecida exitosamente",
  "data": null
}
```

#### Response (400 Bad Request)
```json
{
  "success": false,
  "message": "Token inválido o expirado",
  "data": null
}
```

### 4. Información de Configuración de Tokens

**GET** `/api/auth/reset-token-info`

Obtiene información sobre la configuración de expiración de tokens.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Información de configuración obtenida",
  "data": {
    "expirationMinutes": 1440,
    "expirationHours": 24
  }
}
```

### 5. Cambiar Contraseña (Usuario Autenticado)

**POST** `/api/auth/change-password`

Cambia la contraseña de un usuario autenticado validando su contraseña actual.

#### Request Body
```json
{
  "currentPassword": "contraseñaActual123",
  "newPassword": "nuevaContraseña456",
  "confirmPassword": "nuevaContraseña456"
}
```

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente",
  "data": null
}
```

#### Response (400 Bad Request)
```json
{
  "success": false,
  "message": "La contraseña actual es incorrecta",
  "data": null
}
```

#### Headers Requeridos
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Notas de Seguridad
- ✅ **Requiere autenticación JWT válida** con userId incluido
- ✅ **Extrae userId del token JWT** automáticamente
- ✅ **Valida la contraseña actual** antes del cambio
- ✅ **Registra el cambio en auditoría** completa
- ✅ **No requiere envío de email** (cambio inmediato)

### 6. Políticas de Contraseña

**GET** `/api/auth/password-policy`

Obtiene las políticas de contraseña del sistema.

#### Response (200 OK)
```json
{
  "success": true,
  "message": "Políticas de contraseña obtenidas",
  "data": {
    "minLength": 6,
    "requiresUppercase": false,
    "requiresLowercase": false,
    "requiresNumber": false,
    "requiresSymbol": false
  }
}
```

## Configuración

La configuración del sistema se maneja a través del archivo `application.properties`:

```properties
# Configuración de recuperación de contraseñas
password.reset.token.expiration.minutes=1440
password.reset.max.tokens.per.user=3

# Configuración de email
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=tu-email@gmail.com
spring.mail.password=tu-contraseña-de-aplicacion
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.connectiontimeout=30000
spring.mail.properties.mail.smtp.timeout=30000
spring.mail.properties.mail.smtp.writetimeout=30000
```

## Flujos de Cambio de Contraseña

### Flujo 1: Recuperación de Contraseña (Usuario NO autenticado)

1. **Usuario solicita recuperación**: 
   - POST a `/forgot-password` con email
   - Sistema genera token y envía email

2. **Usuario recibe email**:
   - Email contiene enlace con token
   - Enlace dirige a página de recuperación en frontend

3. **Frontend valida token**:
   - GET a `/validate-reset-token` con token
   - Muestra formulario si token es válido

4. **Usuario ingresa nueva contraseña**:
   - POST a `/reset-password` con token y nueva contraseña
   - Contraseña se actualiza y token se marca como usado

### Flujo 2: Cambio desde Perfil (Usuario autenticado)

1. **Usuario accede a perfil**:
   - Usuario ya autenticado con JWT válido
   - Accede a sección de cambio de contraseña

2. **Usuario completa formulario**:
   - Ingresa contraseña actual
   - Ingresa nueva contraseña
   - Confirma nueva contraseña

3. **Frontend envía solicitud**:
   - POST a `/change-password` con JWT en header
   - Incluye contraseña actual y nueva

4. **Sistema valida y actualiza**:
   - Valida contraseña actual
   - Actualiza a nueva contraseña
   - Registra cambio en auditoría

## Arquitectura Unificada

Todos los endpoints de autenticación y recuperación de contraseñas están implementados en `AuthController.java` para:
- **Cohesión funcional**: Toda la lógica de autenticación en un lugar
- **Simplicidad**: Una sola clase para mantener
- **Consistencia de API**: Todos los endpoints bajo `/api/auth`

## Características de Seguridad

### Tokens de Recuperación (Usuarios NO autenticados)
- **Tokens únicos**: Cada token es generado con 64 caracteres aleatorios
- **Expiración configurable**: Por defecto 24 horas, configurable en properties
- **Límite de tokens**: Máximo 3 tokens activos por usuario
- **Uso único**: Los tokens se marcan como usados después del restablecimiento
- **Limpieza automática**: Tarea programada elimina tokens expirados cada hora
- **Email enmascarado**: Solo muestra parte del email en validación

### JWT Tokens (Usuarios autenticados)
- **UserId incluido**: El JWT ahora incluye el ID del usuario para cambio de contraseña
- **Extracción automática**: El sistema extrae automáticamente el userId del token
- **Validación de contraseña actual**: Requiere contraseña actual correcta
- **Auditoría completa**: Registra quién, cuándo y desde dónde se cambió
- **Sin expiración adicional**: Usa la expiración del JWT (15 minutos por defecto)

### Políticas Comunes
- **Validación de contraseña**: Mínimo 6 caracteres (personalizable)
- **Encoding seguro**: BCrypt para hash de contraseñas
- **Logs detallados**: Registro de todos los intentos y cambios

## Mantenimiento

### Limpieza de Tokens Expirados
El sistema ejecuta automáticamente una tarea cada hora que elimina:
- Tokens expirados
- Tokens usados más antiguos que el tiempo de expiración

### Logs
El sistema registra:
- Solicitudes de recuperación exitosas
- Intentos de uso de tokens inválidos
- Errores en envío de emails
- Operaciones de limpieza de tokens

## Personalización

### Cambiar Tiempo de Expiración
Modificar en `application.properties`:
```properties
password.reset.token.expiration.minutes=720  # 12 horas
```

### Cambiar Límite de Tokens por Usuario
```properties
password.reset.max.tokens.per.user=5  # 5 tokens máximo
```

### Personalizar Plantilla de Email
Modificar el método `buildPasswordResetEmailBody()` en `EmailService.java`

## Errores Comunes

### Error 500 en envío de email
- Verificar credenciales SMTP en `application.properties`
- Verificar que Gmail tenga habilitada la autenticación de 2 factores
- Usar contraseña de aplicación específica, no la contraseña regular

### Tokens que no expiran
- Verificar configuración de `password.reset.token.expiration.minutes`
- Reiniciar aplicación después de cambios en properties

### Emails no llegan
- Verificar configuración SMTP
- Verificar logs para errores de conexión
- Verificar que el puerto 587 esté abierto
