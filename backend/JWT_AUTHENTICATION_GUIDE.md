# Spring Security JWT Authentication - Guía de Uso

## 📋 **Implementación Completada**

### ✅ **Características Implementadas:**

1. **Autenticación JWT Stateless** con Access Token (15 min) y Refresh Token (7 días)
2. **SecurityFilterChain** configurado correctamente
3. **PasswordEncoder BCrypt** para hasheo seguro de contraseñas
4. **UserDetailsService** integrado con la entidad User
5. **Filtro JWT** que intercepta requests y valida tokens
6. **Manejo de excepciones** 401/403 apropiado
7. **Endpoints de registro** protegidos y públicos según corresponde

---

## 🔐 **Endpoints de Autenticación**

### **1. Login - POST /api/auth/login**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "medico@ejemplo.com",
    "password": "password123"
  }'
```

**Response exitoso (200):**
```json
{
  "timestamp": "2025-09-05T00:49:38.123Z",
  "message": "Login exitoso",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "email": "medico@ejemplo.com",
    "nombre": "Dr. Juan Pérez"
  }
}
```

### **2. Refresh Token - POST /api/auth/refresh**
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9..."
  }'
```

**Response exitoso (200):**
```json
{
  "timestamp": "2025-09-05T00:49:38.123Z",
  "message": "Token renovado exitosamente",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiJ9...",
    "tokenType": "Bearer",
    "email": "medico@ejemplo.com",
    "nombre": "Dr. Juan Pérez"
  }
}
```

---

## 🛡️ **Endpoints Protegidos**

### **Acceso a endpoints de negocio:**
```bash
curl -X GET http://localhost:8080/api/medicos \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiJ9..."
```

---

## 🔒 **Configuración de Seguridad**

### **Endpoints Públicos:**
- `/api/auth/**` - Autenticación (login, refresh)
- `/api/pacientes/register` - **SOLO** auto-registro de pacientes

### **Endpoints Protegidos (requieren autenticación):**
- `/api/medicos/register` - **Solo ADMINS** pueden crear médicos
- `/api/medicos/**` (todos los demás)
- `/api/pacientes/**` (excepto /register)
- `/api/especialidades/**`
- Todos los demás endpoints

### **Política de Registro:**
- **👤 Pacientes**: Pueden auto-registrarse públicamente
- **👨‍⚕️ Médicos**: Solo creados por administradores autenticados
- **👮‍♂️ Admins/Operadores**: Solo creados por otros administradores

---

## ⚙️ **Configuración JWT**

### **Variables de Entorno (application.properties):**
```properties
# JWT Configuration
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.access-token-expiration=900000     # 15 minutos
jwt.refresh-token-expiration=604800000 # 7 días
```

---

## 🧪 **Flujo de Pruebas**

### **1. Registrar un paciente (PÚBLICO):**
```bash
curl -X POST http://localhost:8080/api/pacientes/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paciente@ejemplo.com",
    "password": "password123",
    "dni": 87654321,
    "nombre": "María",
    "apellido": "González",
    "telefono": "+549987654321",
    "fechaNacimiento": "1990-05-15",
    "obraSocialId": 1
  }'
```

### **2. Hacer login con el paciente:**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "paciente@ejemplo.com",
    "password": "password123"
  }'
```

### **3. Un ADMIN registra un médico (PROTEGIDO):**
```bash
curl -X POST http://localhost:8080/api/medicos/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [TOKEN_DEL_ADMIN]" \
  -d '{
    "email": "nuevo.medico@ejemplo.com",
    "password": "password123",
    "dni": 12345678,
    "nombre": "Juan",
    "apellido": "Pérez",
    "telefono": "+549123456789",
    "matricula": "MP12345",
    "especialidadId": 1
  }'
```

### **4. Usar access token para acceder a endpoints:**
```bash
curl -X GET http://localhost:8080/api/medicos \
  -H "Authorization: Bearer [ACCESS_TOKEN_AQUÍ]"
```

### **5. Renovar token cuando expire:**
```bash
curl -X POST http://localhost:8080/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "[REFRESH_TOKEN_AQUÍ]"
  }'
```

---

## 🚨 **Manejo de Errores**

### **401 - Credenciales Inválidas:**
```json
{
  "timestamp": "2025-09-05T00:49:38.123Z",
  "message": "Credenciales inválidas",
  "data": null
}
```

### **401 - Token Expirado:**
```json
{
  "timestamp": "2025-09-05T00:49:38.123Z",
  "message": "Refresh token inválido o expirado",
  "data": null
}
```

### **403 - Acceso No Autorizado:**
Spring Security maneja automáticamente los 403 para endpoints protegidos sin token válido.

---

## ✅ **Características de Seguridad**

1. **Stateless**: No se almacenan sesiones en el servidor
2. **BCrypt**: Contraseñas hasheadas con algoritmo seguro
3. **HMAC SHA-256**: Firma JWT con clave secreta
4. **Token Expiration**: Access tokens expiran rápido, refresh tokens duran más
5. **CSRF Disabled**: No necesario en aplicaciones stateless
6. **CORS Ready**: Configuración preparada para frontend

---

## 🔧 **Próximos Pasos Opcionales**

1. **Integrar Roles**: Modificar `User.getAuthorities()` para usar `RoleService`
2. **Blacklist Tokens**: Implementar revocación de tokens
3. **Rate Limiting**: Limitar intentos de login
4. **Audit Logging**: Registrar eventos de autenticación
5. **Password Reset**: Endpoint para resetear contraseñas
