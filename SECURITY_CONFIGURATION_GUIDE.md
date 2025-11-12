# Guía de Configuración de Seguridad - TurneroWeb

## 📋 Configuración de Seguridad Implementada

El sistema TurneroWeb cuenta con un sistema de seguridad flexible que permite alternar entre **modo desarrollo** y **modo producción** mediante una simple configuración.

## 🔄 Modos de Operación

### 🛠️ Modo Desarrollo (devMode=true)
- **Comportamiento**: Todos los endpoints son públicos y accesibles sin autenticación
- **Uso**: Ideal para desarrollo, debugging y testing
- **Seguridad**: Deshabilitada - ⚠️ NO usar en producción

### 🔒 Modo Producción (devMode=false)
- **Comportamiento**: Control de acceso completo basado en roles JWT
- **Uso**: Entorno de producción y staging
- **Seguridad**: Completa - Requerida para uso real

## ⚙️ Cómo Cambiar Entre Modos

### Opción 1: Variable de Entorno (Recomendado)
```bash
# Para modo producción
export SECURITY_DEV_MODE=false

# Para modo desarrollo  
export SECURITY_DEV_MODE=true

# Verificar la variable
echo $SECURITY_DEV_MODE
```

### Opción 2: Parámetro JVM
```bash
# Al ejecutar la aplicación
java -Dsecurity.dev.mode=false -jar backend.jar

# O con Maven
mvn spring-boot:run -Dspring-boot.run.jvmArguments="-Dsecurity.dev.mode=false"
```

### Opción 3: Archivo application.properties
```properties
# En backend/src/main/resources/application.properties
security.dev.mode=false
```

### Opción 4: Docker Compose
```yaml
# En docker-compose.yml
services:
  backend:
    environment:
      - SECURITY_DEV_MODE=false
```

## 🎯 Control de Acceso por Roles

### 👑 ADMINISTRADOR
**Acceso completo al sistema**
- Turnos avanzados y auditoría
- Gestión de especialidades  
- Dashboard administrativo
- Creación de operadores
- Todas las funciones de OPERADOR

### 👥 OPERADOR  
**Gestión operativa del sistema**
- Gestión de turnos
- Administración de pacientes
- Gestión de médicos y staff
- Obras sociales y centros
- Consultorios y esquemas

### 👨‍⚕️ MÉDICO
**Área médica personal**
- Dashboard médico
- Gestión de horarios
- Estadísticas personales
- Perfil médico

### 👤 PACIENTE
**Área personal del paciente**
- Dashboard paciente
- Agenda personal
- Notificaciones
- Reagendamiento de turnos

## 🛡️ Endpoints y Permisos

### Públicos (Sin autenticación)
- `/api/auth/**` - Autenticación
- `/registro-usuario` - Auto-registro pacientes
- `/activate-account` - Activación de cuentas

### Solo ADMINISTRADOR
- `/turnos/advanced-search/**`
- `/turnos/audit-dashboard/**` 
- `/especialidades/**`
- `/admin-dashboard/**`
- `/operadores/create-by-admin`

### Solo PACIENTE
- `/paciente-dashboard/**`
- `/paciente-agenda/**`
- `/paciente-notificaciones/**`
- `/paciente-perfil/**`

### Solo MÉDICO
- `/medico-dashboard/**`
- `/medico-horarios/**`
- `/medico-estadisticas/**`
- `/medico-perfil/**`

### Solo OPERADOR
- `/operador-dashboard/**`
- `/operador-agenda/**`
- `/operadores/**`
- `/operador-perfil/**`

### ADMIN + OPERADOR
- `/turnos/**` (gestión general)
- `/agenda/**`
- `/pacientes/**`
- `/medicos/**`
- `/consultorios/**`
- `/centrosAtencion/**`

## 🔍 Verificación del Modo Actual

### Método 1: Logs de Aplicación
Al iniciar la aplicación, buscar en los logs:
```
INFO: Security Mode: DEVELOPMENT (all endpoints public)
INFO: Security Mode: PRODUCTION (role-based access control)
```

### Método 2: Endpoint de Debug
```bash
# Verificar estado actual (requiere autenticación en modo producción)
curl -H "Authorization: Bearer <token>" http://localhost:8080/debug/tokens
```

### Método 3: Verificación Manual
Intentar acceder a un endpoint protegido sin autenticación:
```bash
# En modo desarrollo: Devuelve datos
# En modo producción: Devuelve 401 Unauthorized
curl http://localhost:8080/pacientes
```

## 🚨 Consideraciones de Seguridad

### ⚠️ IMPORTANTE - Modo Desarrollo
- **NUNCA** usar `devMode=true` en producción
- Expone todos los endpoints sin protección
- Solo para desarrollo local y testing

### ✅ Producción Segura
- Usar `devMode=false` en todos los entornos públicos
- Configurar JWT tokens con secretos seguros
- Validar roles en frontend Y backend
- Implementar logs de auditoría

## 🔧 Troubleshooting

### Problema: "403 Forbidden"
**Causa**: Usuario autenticado pero sin permisos suficientes
**Solución**: Verificar que el rol del usuario coincida con el endpoint

### Problema: "401 Unauthorized"  
**Causa**: Token JWT inválido o ausente
**Solución**: Login nuevamente o verificar header Authorization

### Problema: Acceso no esperado en producción
**Causa**: Aplicación en modo desarrollo
**Solución**: Verificar `security.dev.mode=false`

## 📝 Logs y Monitoreo

Para monitorear la seguridad, habilitar logs:
```properties
# En application.properties
logging.level.org.springframework.security=DEBUG
logging.level.unpsjb.labprog.backend.config.SecurityConfig=INFO
```

## 🔄 Cambios en Tiempo de Ejecución

**Nota**: Cambiar el modo de seguridad requiere reiniciar la aplicación. No es posible cambiar dinámicamente sin restart.

---

**Autor**: TurneroWeb Development Team  
**Versión**: 1.0  
**Fecha**: Septiembre 2025