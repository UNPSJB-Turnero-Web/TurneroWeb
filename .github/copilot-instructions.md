# TurneroWeb - Guía para Agentes IA

## Arquitectura y Tecnologías

### Stack Tecnológico
- **Backend**: Spring Boot 3.0.2 + Java 17 + JPA + PostgreSQL
- **Frontend**: Angular 19 + Bootstrap 5.3.2 + FontAwesome
- **Contenedores**: Docker Compose con servicios database/backend/frontend/testing
- **Testing**: Cucumber.js para pruebas BDD end-to-end

### Estructura del Proyecto
```
backend/src/main/java/unpsjb/labprog/backend/
├── presenter/          # Controladores REST (@RestController)
├── business/service/   # Servicios (@Service, lógica de negocio)
├── business/repository/ # Repositorios JPA 
├── model/             # Entidades JPA (@Entity)
└── dto/               # DTOs para transferencia de datos

frontend/cli/src/app/
├── [entidad]/         # Por entidad: service.ts, component.ts, .html
├── services/          # Servicios transversales (auth, notifications)
└── data.package.ts    # Interface DataPackage<T> para respuestas
```

## Patrones de Desarrollo Críticos

### 1. Clase Response Centralizada (Backend)
Todas las respuestas REST usan la clase `Response` con estructura estándar:
```java
// Estructura JSON de respuesta
{
  "status_code": 200,
  "status_text": "mensaje descriptivo", 
  "data": [objeto/array]
}

// Uso en controladores
return Response.ok(data, "mensaje");
return Response.error(null, "mensaje error");
return Response.notFound("mensaje");
```

### 2. DataPackage Interface (Frontend)
Todas las respuestas HTTP se tipan con `DataPackage<T>`:
```typescript
export interface DataPackage<T = any> {
  data: T;
  status_code: number;
  status_text: string;
}

// Uso en servicios Angular
this.http.get<DataPackage<Entidad[]>>(`${this.url}`)
```

### 3. Arquitectura de Servicios por Capas
- **Presenters**: Solo manejan HTTP, delegan a Services
- **Services**: Lógica de negocio, validaciones, transacciones
- **Repositories**: Acceso a datos via JPA
- **DTOs**: Transferencia entre capas (nunca exponer entidades JPA directamente)

### 4. Convenciones de Naming
- **Backend**: `EntityPresenter`, `EntityService`, `EntityRepository`, `EntityDTO`
- **Frontend**: `entity.service.ts`, `entity-detail.component.ts`, `entity.ts` (interface)
- **URLs REST**: `/entidades` (plural, sin rest prefix en backend)
- **Frontend Service URLs**: `rest/entidades` (usa proxy hacia backend)

## Workflows de Desarrollo

### Comandos Docker Esenciales
```bash
# Script lpl para gestión del entorno
./lpl build          # Construir imágenes
./lpl up            # Levantar servicios
./lpl down          # Detener servicios  
./lpl sh backend    # Acceder al contenedor backend
./lpl sh frontend   # Acceder al contenedor frontend
./lpl restart backend # Reiniciar solo backend
```

### Desarrollo Backend
```bash
# Compilación automática tras cambios
./lpl compile

# Si hay errores de compilación, reiniciar
./lpl restart backend
```

### Comunicación Frontend-Backend
- **Desarrollo**: Frontend en puerto 4200, Backend en 8080
- **Proxy**: `proxy.conf.json` redirige `/rest/*` → `http://backend:8080/*`
- **Servicios**: URLs base como `private url = 'rest/entidades'`

## Patrones Específicos del Dominio

### 1. Paginación Estándar
```java
// Backend - Todos los endpoints de paginación
@GetMapping("/page")
public ResponseEntity<Object> findByPage(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size) {
    
    var pageResult = service.findByPage(page, size);
    Map<String, Object> response = Map.of(
        "content", pageResult.getContent(),
        "totalPages", pageResult.getTotalPages(), 
        "totalElements", pageResult.getTotalElements(),
        "currentPage", pageResult.getNumber()
    );
    return Response.ok(response);
}
```

### 2. Auditoría con AuditContext
Sistema de auditoría para operaciones críticas usando `AuditContext.getCurrentUser()` y campo `performedBy` en DTOs.

### 3. Testing BDD
- Tests en `/testing/features/` con Cucumber.js
- URLs hardcodeadas: `http://backend:8080/endpoint`
- Estructura esperada: `{ status_code, status_text, data }`

### 4. Gestión de Estados
- **Turnos**: Estados como PROGRAMADO, CONFIRMADO, CANCELADO con auditoría
- **Fechas**: Formato `dd-MM-yyyy` en configuración Jackson
- **Horarios**: Backend espera formato `HH:MM:SS`, frontend maneja `HH:MM`

## Entidades Principales

**Dominio Médico**: CentroAtencion, Consultorio, Especialidad, Medico, StaffMedico, DisponibilidadMedico, EsquemaTurno, Agenda, Turno, Paciente, ObraSocial, Operador.

### Relaciones Clave
- `StaffMedico`: Vincula Medico + Centro + Especialidades
- `EsquemaTurno`: Define horarios por StaffMedico + Consultorio
- `DisponibilidadMedico`: Horarios disponibles por StaffMedico
- `Turno`: Cita específica con estados y auditoría

## Anti-patrones a Evitar
- ❌ Exponer entidades JPA directamente en REST
- ❌ Lógica de negocio en Presenters 
- ❌ URLs inconsistentes (usar siempre plural)
- ❌ Respuestas JSON sin estructura Response estándar
- ❌ Servicios Angular sin DataPackage typing
- ❌ Hardcodear URLs sin usar proxy config

## Comandos de Prueba Rápida
```bash
# Verificar backend funcionando
curl http://localhost:8080/
# Respuesta esperada: {"data":"Hello Labprog!","message":"Server Online","status":200}

# Verificar frontend
curl http://localhost:4200/

# Ejecutar tests BDD
./lpl test
```