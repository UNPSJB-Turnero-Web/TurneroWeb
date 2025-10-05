# Sistema TurneroWeb - Documentación Técnica

## Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Stack Tecnológico](#stack-tecnológico)
4. [Modelo de Datos](#modelo-de-datos)
5. [Módulos Funcionales](#módulos-funcionales)
6. [Sistema de Auditoría](#sistema-de-auditoría)
7. [Frontend - Estructura Angular](#frontend---estructura-angular)
8. [Flujos de Negocio](#flujos-de-negocio)
9. [Testing y Calidad](#testing-y-calidad)
10. [Despliegue y Configuración](#despliegue-y-configuración)

---

## Descripción General

**TurneroWeb** es un sistema integral de gestión de turnos médicos desarrollado como parte de un proyecto académico de Laboratorio de Programación. El sistema permite la administración completa de turnos médicos, incluyendo gestión de pacientes, médicos, especialidades, centros de atención, consultorios y una funcionalidad avanzada de auditoría.

### Objetivos del Sistema
- Gestionar de manera eficiente los turnos médicos
- Automatizar la asignación de consultorios
- Proporcionar trazabilidad completa de cambios mediante auditoría
- Ofrecer interfaces diferenciadas para administradores y pacientes
- Mantener la integridad de datos y consistencia del sistema

---

## Arquitectura del Sistema

El sistema sigue una arquitectura de **3 capas** con separación clara de responsabilidades:

```
┌─────────────────────┐
│    Frontend         │  Angular 17 + Bootstrap
│    (Presentación)   │
├─────────────────────┤
│    Backend          │  Spring Boot + JPA
│    (Lógica Negocio) │
├─────────────────────┤
│    Base de Datos    │  PostgreSQL
│    (Persistencia)   │
└─────────────────────┘
```

### Componentes Principales
- **Frontend**: Aplicación Angular con interfaces para administradores y pacientes
- **Backend**: API REST desarrollada en Spring Boot con JPA/Hibernate
- **Base de Datos**: PostgreSQL con esquema relacional normalizado
- **Testing**: Suite de pruebas automatizadas con Cucumber.js
- **Orquestación**: Docker Compose para el despliegue integrado

---

## Stack Tecnológico

### Backend
- **Framework**: Spring Boot 3.1.5
- **Persistencia**: Spring Data JPA + Hibernate
- **Base de Datos**: PostgreSQL
- **Build Tool**: Maven
- **Documentación API**: Spring Boot Actuator

### Frontend
- **Framework**: Angular 17
- **UI Components**: Bootstrap 5.3.2
- **Iconos**: Font Awesome 6.4.2
- **HTTP Client**: Angular HttpClient
- **Routing**: Angular Router con Guards

### DevOps y Testing
- **Contenedores**: Docker + Docker Compose
- **Testing**: Cucumber.js para pruebas BDD
- **Proxy**: Configuración de proxy para desarrollo

---

## Modelo de Datos

### Entidades Principales

#### Gestión de Personas
- **Paciente**: Información personal, obra social, historial de turnos
- **Medico**: Datos profesionales, especialidades, disponibilidad
- **StaffMedico**: Relación médico-centro de atención con especialidades

#### Infraestructura Médica
- **CentroAtencion**: Ubicaciones físicas del sistema
- **Consultorio**: Salas de atención asociadas a centros
- **Especialidad**: Categorías médicas del sistema
- **ObraSocial**: Entidades de cobertura médica

#### Gestión de Turnos
- **Turno**: Cita médica con estado, fecha, hora y consultorio
- **EsquemaTurno**: Plantillas de horarios para especialidades
- **DisponibilidadMedico**: Horarios disponibles por médico
- **ConfiguracionExcepcional**: Excepciones a horarios normales

#### Auditoría
- **AuditLog**: Registro inmutable de todos los cambios de turnos

### Relaciones Clave
```
Paciente ──→ Turno ←── Medico
                ↓
           Consultorio ←── CentroAtencion
                ↓
         EsquemaTurno ←── Especialidad
```

---

## Módulos Funcionales

### 1. Gestión de Turnos
**Funcionalidades:**
- Creación, modificación y cancelación de turnos
- Asignación automática de consultorios
- Validación de disponibilidad de médicos
- Gestión de estados (Pendiente, Confirmado, Cancelado, Completado)

**Servicios Clave:**
- `TurnoService`: Lógica de negocio principal
- `TurnoPresenter`: API REST endpoints
- Validaciones de conflictos y disponibilidad

### 2. Gestión de Agenda
**Funcionalidades:**
- Configuración de esquemas de turno por especialidad
- Gestión de días excepcionales
- Redistribución automática de consultorios
- Visualización de agenda por médico/centro

### 3. Gestión de Pacientes
**Funcionalidades:**
- CRUD de pacientes
- Historial de turnos
- Dashboard personalizado para pacientes
- Sistema de notificaciones

### 4. Gestión de Staff Médico
**Funcionalidades:**
- Administración de médicos y especialidades
- Configuración de disponibilidades
- Asignación a centros de atención
- Gestión de staff médico por centro

### 5. Infraestructura
**Funcionalidades:**
- Gestión de centros de atención
- Administración de consultorios
- Configuración de especialidades
- Gestión de obras sociales

---

## Sistema de Auditoría

### Características del Sistema de Auditoría
- **Inmutabilidad**: Los registros de auditoría no pueden modificarse
- **Trazabilidad Completa**: Cada cambio en turnos queda registrado
- **Información Contextual**: Usuario, timestamp, estado anterior y nuevo
- **Búsqueda Avanzada**: Filtros por fecha, usuario, tipo de cambio

### Estructura del AuditLog
```java
@Entity
public class AuditLog {
    private Long id;
    private Long turnoId;
    private String usuario;
    private LocalDateTime timestamp;
    private String accion; // CREATE, UPDATE, DELETE, CANCEL
    private String estadoAnterior;
    private String estadoNuevo;
    private String detalles;
}
```

### Endpoints de Auditoría
- `GET /audit/turno/{id}`: Historial de un turno específico
- `GET /audit/search`: Búsqueda avanzada con filtros
- `GET /audit/dashboard`: Dashboard con métricas de auditoría

---

## Frontend - Estructura Angular

### Arquitectura de Componentes

#### Componentes Principales
```
app/
├── home/                    # Dashboard principal
├── turnos/                  # Gestión de turnos + auditoría
├── pacientes/               # Gestión de pacientes + dashboard paciente
├── agenda/                  # Configuración de agenda
├── medicos/                 # CRUD médicos
├── staffMedicos/            # Gestión staff por centro
├── consultorios/            # CRUD consultorios
├── centrosAtencion/         # CRUD centros
├── especialidades/          # CRUD especialidades
├── obraSocial/              # CRUD obras sociales
├── disponibilidadMedicos/   # Configuración horarios
├── esquemaTurno/            # Plantillas de horarios
├── services/                # Servicios HTTP
├── guards/                  # Guards de autenticación
├── modal/                   # Componentes modales
└── pagination/              # Componente de paginado
```

### Sistema de Routing y Guards
- **AdminGuard**: Protege rutas administrativas
- **PatientGuard**: Protege rutas de pacientes
- **Rutas Diferenciadas**: 
  - `/paciente-*`: Interfaces para pacientes
  - Rutas administrativas: Gestión completa del sistema

### Componentes de Auditoría
- **TurnoAdvancedSearchComponent**: Búsqueda avanzada de turnos
- **AuditDashboardComponent**: Dashboard de métricas de auditoría

---

## Flujos de Negocio

### Flujo de Alta de Turno
1. **Selección de Datos**: Paciente, médico, especialidad, fecha
2. **Validación de Disponibilidad**: Verificación de horarios
3. **Asignación de Consultorio**: Algoritmo automático basado en disponibilidad
4. **Creación del Turno**: Persistencia con estado "Pendiente"
5. **Registro de Auditoría**: Log automático de creación

### Flujo de Asignación de Consultorio
1. **Evaluación de Esquemas**: Consulta esquemas de turno activos
2. **Verificación de Disponibilidad**: Validación de ocupación
3. **Algoritmo de Asignación**: Distribución equitativa por centro
4. **Persistencia**: Actualización de turno con consultorio asignado

### Flujo de Redistribución de Esquemas
1. **Detección de Cambios**: Modificación en esquemas de turno
2. **Identificación de Turnos Afectados**: Query de turnos sin consultorio
3. **Reasignación Automática**: Algoritmo de redistribución
4. **Notificación de Cambios**: Log de cambios realizados

---

## Testing y Calidad

### Estrategia de Testing
- **BDD (Behavior Driven Development)**: Usando Cucumber.js
- **Pruebas de Aceptación**: Definidas en archivos `.feature`
- **Cobertura Funcional**: Validación de casos de uso principales

### Casos de Prueba Implementados

#### Gestión de Centros de Atención
```gherkin
Feature: Gestión de Centros de Atención
  Scenario: Alta de un centro de atención
    Given que ingreso al sistema como administrador
    When creo un centro de atención con datos válidos
    Then el centro se crea exitosamente
```

#### Gestión de Agenda
```gherkin
Feature: Gestión de Agenda
  Scenario: Configuración de esquema de turno
    Given que tengo especialidades y centros disponibles
    When configuro un esquema de turno
    Then los turnos se redistribuyen automáticamente
```

### Configuración de Testing
- **Framework**: Cucumber.js con Selenium WebDriver
- **Ejecución**: `npm test` en el directorio `/testing`
- **Reportes**: Generación automática de reportes HTML

---

## Despliegue y Configuración

### Docker Compose
El sistema se despliega usando Docker Compose con los siguientes servicios:

```yaml
services:
  database:     # PostgreSQL 13
  backend:      # Spring Boot Application
  frontend:     # Angular con Nginx
  testing:      # Cucumber.js Test Suite
```

### Comandos de Despliegue
```bash
# Construcción e inicio de todos los servicios
docker-compose up --build

# Solo base de datos y backend
docker-compose up database backend

# Ejecución de tests
docker-compose run testing npm test
```

### Configuración de Desarrollo
- **Proxy Configuration**: `proxy.conf.json` para desarrollo local
- **Variables de Entorno**: Configuradas en `docker-compose.yml`
- **Hot Reload**: Habilitado en modo desarrollo

### Estructura de Base de Datos
- **Inicialización**: Scripts SQL en `/staging`
- **Migraciones**: Archivos de migración para cambios de esquema
- **Datos de Prueba**: Población inicial para testing

---

## Sistema de Roles y Autorización

### Jerarquía de Roles
El sistema implementa una jerarquía de roles centralizada que permite herencia de permisos:

```
ADMINISTRADOR
├── MEDICO
├── OPERADOR
└── PACIENTE (base)

MEDICO
└── PACIENTE (base)

OPERADOR  
└── PACIENTE (base)
```

- **PACIENTE**: Rol base con permisos básicos
- **MEDICO**: Hereda permisos de PACIENTE + permisos médicos
- **OPERADOR**: Hereda permisos de PACIENTE + permisos operativos  
- **ADMINISTRADOR**: Hereda permisos de PACIENTE, MEDICO y OPERADOR + permisos administrativos

**Nota**: MEDICO y OPERADOR son roles independientes; no hay herencia entre ellos, solo comparten la base de PACIENTE.### Lógica de Autorización
- **Método Centralizado**: `Role.hasAccessTo(Role required)` verifica permisos jerárquicos
- **Uso Consistente**: Todos los checks de permisos usan la jerarquía, no comparaciones directas
- **Ejemplo**: `user.getRole().hasAccessTo(Role.PACIENTE)` permite acceso a funcionalidades de paciente

### Creación Automática de Pacientes
Para usuarios multi-rol (médicos, operadores, administradores):
- **Escenario**: Usuario sin registro de paciente intenta sacar un turno para sí mismo
- **Proceso**: 
  1. Verificar permisos usando jerarquía
  2. Buscar paciente existente por DNI/email
  3. Si no existe, crear automáticamente registro de paciente
  4. Asociar turno al paciente creado/encontrado
- **Beneficio**: Usuarios multi-rol pueden gestionar turnos personales sin registro manual

### Implementación Técnica
- **Enum Role**: Define roles y herencia en `Role.java`
- **RoleHierarchy**: Clase utilitaria para operaciones jerárquicas
- **User Model**: Campo `role` con `@Enumerated(EnumType.STRING)`
- **Spring Security**: Configurado con `RoleHierarchy` para herencia automática
- **Verificación**: `currentUser.getRole().hasAccessTo(Role.PACIENTE)` en lógica de aplicación

---

## Conclusiones

El sistema TurneroWeb representa una solución integral para la gestión de turnos médicos, implementando las mejores prácticas de desarrollo de software:

- **Arquitectura Modular**: Separación clara de responsabilidades
- **Trazabilidad Completa**: Sistema de auditoría robusto
- **Testing Automatizado**: Garantía de calidad mediante BDD
- **Despliegue Containerizado**: Facilidad de instalación y mantenimiento
- **Interfaz Responsiva**: Experiencia de usuario optimizada

El sistema está diseñado para ser escalable, mantenible y cumplir con los estándares de calidad requeridos en sistemas de gestión médica.

--