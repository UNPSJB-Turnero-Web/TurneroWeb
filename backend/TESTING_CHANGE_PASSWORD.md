# Testing del Endpoint change-password

## 🧪 Ejemplo de Uso del Endpoint

### 1. **Login para obtener JWT Token**

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "medico@hospital.com",
    "password": "password123"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtZWRpY29AaG9zcGl0YWwuY29tIiwidXNlcklkIjoxLCJyb2xlIjoiTWVkaWNvIiwiaWF0IjoxNjk0...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "email": "medico@hospital.com",
    "fullName": "Dr. Juan Pérez",
    "role": "Medico"
  }
}
```

### 2. **Cambiar Contraseña usando el JWT Token**

```bash
curl -X POST http://localhost:8080/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJtZWRpY29AaG9zcGl0YWwuY29tIiwidXNlcklkIjoxLCJyb2xlIjoiTWVkaWNvIiwiaWF0IjoxNjk0..." \
  -d '{
    "currentPassword": "password123",
    "newPassword": "nuevaPassword456",
    "confirmPassword": "nuevaPassword456"
  }'
```

**Respuesta exitosa:**
```json
{
  "success": true,
  "message": "Contraseña cambiada exitosamente",
  "data": null
}
```

**Respuesta con error - contraseña actual incorrecta:**
```json
{
  "success": false,
  "message": "La contraseña actual es incorrecta",
  "data": null
}
```

**Respuesta con error - token no válido:**
```json
{
  "success": false,
  "message": "Token JWT requerido. Debe incluir el header Authorization con Bearer token válido.",
  "data": null
}
```

## 🔍 Verificación del Token JWT

### Estructura del Token JWT
El token ahora incluye:
```json
{
  "sub": "usuario@email.com",    // subject (email del usuario)
  "userId": 123,                 // ID del usuario en la base de datos
  "role": "Medico",              // Rol del usuario
  "iat": 1694873234,             // Issued at (timestamp)
  "exp": 1694874134              // Expiration (timestamp)
}
```

### Decodificar Token (Solo para Testing - usar jwt.io)
Puedes verificar el contenido del token en https://jwt.io/ copiando el token completo.

## 🔧 Configuración de Seguridad

### Headers Requeridos
- `Content-Type: application/json`
- `Authorization: Bearer <tu_jwt_token_aqui>`

### Validaciones Implementadas
1. ✅ **Token JWT válido** - debe estar presente y no expirado
2. ✅ **UserId extraído** - debe existir en el token
3. ✅ **Contraseña actual** - debe coincidir con la almacenada
4. ✅ **Nueva contraseña** - debe cumplir políticas (min 6 caracteres)
5. ✅ **Confirmación** - nueva contraseña y confirmación deben ser iguales

## 🚨 Casos de Error

### Error 1: Token no proporcionado
```bash
curl -X POST http://localhost:8080/api/auth/change-password \
  -H "Content-Type: application/json" \
  -d '{...}'
```
→ "Token JWT requerido. Debe incluir el header Authorization con Bearer token válido."

### Error 2: Token malformado
```bash
curl -X POST http://localhost:8080/api/auth/change-password \
  -H "Authorization: Bearer token_invalido" \
  -d '{...}'
```
→ "Token JWT requerido. Debe incluir el header Authorization con Bearer token válido."

### Error 3: Contraseña actual incorrecta
```json
{
  "currentPassword": "password_incorrecta",
  "newPassword": "nueva123",
  "confirmPassword": "nueva123"
}
```
→ "La contraseña actual es incorrecta"

### Error 4: Contraseñas no coinciden
```json
{
  "currentPassword": "password123",
  "newPassword": "nueva123",
  "confirmPassword": "otra456"
}
```
→ "La nueva contraseña y su confirmación no coinciden"

## 🏗️ Flujo Completo de Testing

### Paso 1: Crear Usuario (Si no existe)
```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "password123",
    "dni": "12345678",
    "nombre": "Test",
    "apellido": "Usuario",
    "telefono": "123456789"
  }'
```

### Paso 2: Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "password123"
  }'
```

### Paso 3: Cambiar Contraseña
```bash
# Usar el token obtenido en el paso 2
curl -X POST http://localhost:8080/api/auth/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN_DEL_PASO_2>" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "nuevaPassword456",
    "confirmPassword": "nuevaPassword456"
  }'
```

### Paso 4: Verificar Cambio (Login con nueva contraseña)
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@ejemplo.com",
    "password": "nuevaPassword456"
  }'
```

## 🔍 Logs y Auditoría

El sistema registra en logs:
- ✅ Cambios de contraseña exitosos
- ⚠️ Intentos con contraseña incorrecta  
- ❌ Errores de validación
- 📝 Auditoría completa en base de datos

## 🎯 Notas Importantes

1. **Seguridad**: El token debe mantenerse seguro y no exponerse en logs
2. **Expiración**: Los tokens tienen tiempo de vida limitado (15 minutos por defecto)
3. **Refresh**: Usa el refresh token para obtener nuevos access tokens
4. **Auditoría**: Todos los cambios quedan registrados con timestamp y usuario
5. **Políticas**: Las políticas de contraseña son configurables en `PasswordService`
