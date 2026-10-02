package unpsjb.labprog.backend.business.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityNotFoundException;
import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.business.repository.PacienteRepository;
import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.business.repository.TurnoRepository;

import unpsjb.labprog.backend.dto.CancelacionDataDTO;
import unpsjb.labprog.backend.dto.HistorialTurnoDTO;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.dto.TurnoFilterDTO;
import unpsjb.labprog.backend.dto.ValidacionContactoDTO;
import unpsjb.labprog.backend.model.AuditLog;

import unpsjb.labprog.backend.model.Consultorio;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Paciente;
import unpsjb.labprog.backend.model.Role;
import unpsjb.labprog.backend.model.StaffMedico;
import unpsjb.labprog.backend.model.TipoNotificacion;
import unpsjb.labprog.backend.model.Turno;
import unpsjb.labprog.backend.model.User;
import unpsjb.labprog.backend.business.repository.OperadorRepository;
import unpsjb.labprog.backend.business.repository.UserRepository;

@Service
public class TurnoService {

    @Autowired
    private TurnoRepository repository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private StaffMedicoRepository staffMedicoRepository;

    @Autowired
    private ListaEsperaService listaEsperaService;

    @Autowired
    private ConsultorioRepository consultorioRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    private OperadorRepository operadorRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ConfiguracionService configuracionService;

    // Parámetro de configuración: días máximos para confirmar un turno antes de la
    // fecha

    // === VALIDACIONES DE TRANSICIÓN DE ESTADO ===

    // Definir transiciones de estado válidas
    private static final Map<EstadoTurno, List<EstadoTurno>> VALID_TRANSITIONS = new HashMap<>();

    static {
        // PROGRAMADO puede ir a: CONFIRMADO, CANCELADO, REAGENDADO
        VALID_TRANSITIONS.put(EstadoTurno.PROGRAMADO,
                Arrays.asList(EstadoTurno.CONFIRMADO, EstadoTurno.CANCELADO, EstadoTurno.REAGENDADO));

        // CONFIRMADO puede ir a: COMPLETO, CANCELADO, REAGENDADO
        VALID_TRANSITIONS.put(EstadoTurno.CONFIRMADO,
                Arrays.asList(EstadoTurno.COMPLETO, EstadoTurno.CANCELADO, EstadoTurno.REAGENDADO));

        // REAGENDADO puede ir a: CONFIRMADO, CANCELADO
        VALID_TRANSITIONS.put(EstadoTurno.REAGENDADO,
                Arrays.asList(EstadoTurno.CONFIRMADO, EstadoTurno.CANCELADO));

        // CANCELADO y COMPLETO son estados finales (no pueden cambiar)
        VALID_TRANSITIONS.put(EstadoTurno.CANCELADO, Arrays.asList());
        VALID_TRANSITIONS.put(EstadoTurno.COMPLETO, Arrays.asList());
    }

    // Obtener todos los turnos como DTOs
    public List<TurnoDTO> findAll() {
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Obtener un turno por ID como DTO
    public Optional<TurnoDTO> findById(Integer id) {
        return repository.findById(id).map(this::toDTO);
    }

    // Obtener turnos por paciente ID
    public List<TurnoDTO> findByPacienteId(Integer pacienteId) {
        return repository.findByPaciente_Id(pacienteId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TurnoDTO save(TurnoDTO dto) {
        return save(dto, "SYSTEM");
    }

    @Transactional
    public TurnoDTO save(TurnoDTO dto, String performedBy) {
        return save(dto, performedBy, null);
    }

    @Transactional
    public TurnoDTO save(TurnoDTO dto, String performedBy, String currentUserEmail) {
        try {
            // Lógica para multi-rol: si no hay pacienteId pero hay usuario actual,
            // buscar/crear paciente
            if (dto.getPacienteId() == null && currentUserEmail != null && !currentUserEmail.equals("UNKNOWN")) {
                Optional<User> currentUserOpt = userRepository.findByEmail(currentUserEmail);
                if (currentUserOpt.isPresent()) {
                    User currentUser = currentUserOpt.get();
                    // Verificar permisos usando jerarquía centralizada: cualquier rol puede acceder
                    // a PACIENTE
                    if (currentUser.getRole().hasAccessTo(Role.PACIENTE)) {
                        // Buscar paciente existente por DNI o email
                        Optional<Paciente> pacienteOpt = pacienteRepository.findByDni(currentUser.getDni());
                        if (pacienteOpt.isEmpty()) {
                            pacienteOpt = pacienteRepository.findByEmail(currentUser.getEmail());
                        }

                        Paciente paciente;
                        if (pacienteOpt.isPresent()) {
                            paciente = pacienteOpt.get();
                        } else {
                            // Crear nuevo paciente
                            paciente = new Paciente();
                            paciente.setNombre(currentUser.getNombre());
                            paciente.setApellido(currentUser.getApellido());
                            paciente.setDni(currentUser.getDni());
                            paciente.setEmail(currentUser.getEmail());
                            paciente.setTelefono(currentUser.getTelefono());
                            paciente = pacienteRepository.save(paciente);
                        }
                        dto.setPacienteId(paciente.getId());
                    } else {
                        throw new IllegalArgumentException("Usuario no autorizado para crear turnos");
                    }
                }
            }

            Turno turno = toEntity(dto); // Convertir DTO a entidad
            validarTurno(turno); // Validar el turno

            boolean isNewTurno = dto.getId() == null || dto.getId() == 0;
            EstadoTurno previousStatus = null;

            if (!isNewTurno) {
                // Es una actualización, obtener el estado anterior
                Optional<Turno> existingTurno = repository.findById(turno.getId());
                if (existingTurno.isPresent()) {
                    previousStatus = existingTurno.get().getEstado();
                }
            }

            Turno saved = repository.save(turno); // Guardar el turno

            // Asegurar que el turno tenga ID después de guardar
            if (saved.getId() == null) {
                throw new IllegalStateException("Error: El turno no recibió ID después de guardar");
            }

            if (isNewTurno) {
                try {
                    auditLogService.logTurnoCreated(saved, performedBy);
                } catch (Exception e) {
                    // No re-lanzar para no romper la creación del turno
                }

                // Crear notificación de nuevo turno para el paciente
                crearNotificacionNuevoTurno(saved);

            } else if (previousStatus != null && !previousStatus.equals(saved.getEstado())) {
                System.out.println("🔍 DEBUG TurnoService.save: Detectado cambio de estado (ID: " + saved.getId() + ", "
                        + previousStatus + " -> " + saved.getEstado() + "), llamando a logStatusChange");
                try {
                    AuditLog auditResult = auditLogService.logStatusChange(saved, previousStatus.name(), performedBy,
                            "Actualización de turno");
                    if (auditResult != null) {
                        System.out
                                .println("✅ DEBUG TurnoService.save: Auditoría de cambio de estado registrada con ID: "
                                        + auditResult.getId());
                    } else {
                        System.err.println(
                                "❌ ERROR TurnoService.save: Falló el registro de auditoría de cambio de estado");
                    }
                } catch (Exception e) {
                    System.err.println(
                            "❌ ERROR TurnoService.save: Excepción en auditoría de cambio de estado: " + e.getMessage());
                    // No re-lanzar para no romper la actualización del turno
                }
            } else {
                System.out.println("🔍 DEBUG TurnoService.save: Turno actualizado sin cambio de estado (ID: "
                        + saved.getId() + ")");
            }

            return toDTO(saved); // Convertir entidad a DTO y retornar
        } catch (Exception e) {
            System.err.println("Error al guardar el turno: " + e.getMessage());
            // Log the error without printing stack trace
            throw e; // Re-lanzar la excepción para que el controlador la maneje
        }
    }

    // Obtener turnos paginados como DTOs
    public Page<TurnoDTO> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    /**
     * Búsqueda paginada avanzada con filtros y ordenamiento
     * 
     * @param page        Número de página (0-based)
     * @param size        Tamaño de página
     * @param paciente    Filtro por nombre o apellido del paciente (opcional)
     * @param medico      Filtro por nombre o apellido del médico (opcional)
     * @param consultorio Filtro por nombre del consultorio (opcional)
     * @param estado      Filtro por estado del turno (opcional)
     * @param fechaDesde  Filtro por fecha desde (formato: yyyy-MM-dd, opcional)
     * @param fechaHasta  Filtro por fecha hasta (formato: yyyy-MM-dd, opcional)
     * @param sortBy      Campo para ordenar (opcional)
     * @param sortDir     Dirección del ordenamiento (asc/desc, opcional)
     * @return Page<TurnoDTO> con los resultados paginados
     */
    public Page<TurnoDTO> findByPage(
            int page,
            int size,
            String paciente,
            String medico,
            String consultorio,
            String estado,
            String fechaDesde,
            String fechaHasta,
            String sortBy,
            String sortDir) {

        // Configurar ordenamiento
        Sort sort = Sort.unsorted();
        if (sortBy != null && !sortBy.trim().isEmpty()) {
            Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;
            sort = Sort.by(direction, sortBy);
        }

        // Configurar paginación
        PageRequest pageable = PageRequest.of(page, size, sort);

        // Parsear estado si viene como string
        EstadoTurno estadoEnum = null;
        if (estado != null && !estado.trim().isEmpty()) {
            try {
                estadoEnum = EstadoTurno.valueOf(estado.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Estado inválido, ignorar filtro
                System.err.println("Estado inválido proporcionado: " + estado);
            }
        }

        // Parsear fechas si vienen como string
        LocalDate fechaDesdeParsed = null;
        LocalDate fechaHastaParsed = null;
        if (fechaDesde != null && !fechaDesde.trim().isEmpty()) {
            try {
                fechaDesdeParsed = LocalDate.parse(fechaDesde.trim());
            } catch (Exception e) {
                System.err.println("Fecha desde inválida: " + fechaDesde);
            }
        }
        if (fechaHasta != null && !fechaHasta.trim().isEmpty()) {
            try {
                fechaHastaParsed = LocalDate.parse(fechaHasta.trim());
            } catch (Exception e) {
                System.err.println("Fecha hasta inválida: " + fechaHasta);
            }
        }

        // Ejecutar consulta con filtros
        Page<Turno> result = repository.findByFiltros(
                paciente, medico, consultorio, estadoEnum,
                fechaDesdeParsed, fechaHastaParsed, pageable);

        // Mapear a DTO
        return result.map(this::toDTO);
    }

    @Transactional
    public void delete(Integer id) {
        delete(id, "Eliminación de turno", "SYSTEM");
    }

    @Transactional
    public void delete(Integer id, String motivo, String performedBy) {
        if (!repository.existsById(id)) {
            throw new IllegalStateException("No existe un turno con el ID: " + id);
        }

        // Obtener el turno antes de eliminarlo para auditoría
        Optional<Turno> turnoOpt = repository.findById(id);
        if (turnoOpt.isPresent()) {
            Turno turno = turnoOpt.get();

            // Registrar auditoría antes de eliminar
            try {
                auditLogService.logTurnoDeleted(turno, performedBy, motivo);
                System.out.println("✅ DEBUG TurnoService.delete: Auditoría de eliminación registrada para turno ID: "
                        + turno.getId());
            } catch (Exception e) {
                System.err.println("❌ ERROR TurnoService.delete: Falló auditoría de eliminación: " + e.getMessage());
                // No re-lanzar para no romper la eliminación
            }
        }

        repository.deleteById(id);
    }

    public void deleteAll() {
        repository.deleteAll();
    }

    @Transactional
    public TurnoDTO cancelarTurno(Integer id) {
        return cancelarTurno(id, "Cancelación sin motivo especificado", "SYSTEM");
    }

    @Transactional
    public TurnoDTO cancelarTurno(Integer id, String motivo, String performedBy) {
        Optional<Turno> turnoOpt = repository.findById(id);
        if (turnoOpt.isEmpty()) {
            throw new IllegalArgumentException("Turno no encontrado con ID: " + id);
        }

        Turno turno = turnoOpt.get();
        EstadoTurno previousStatus = turno.getEstado();

        // Validar que el usuario tenga permisos para cancelar
        validarPermisosCancelacion(performedBy);

        // Validaciones de negocio para cancelación
        validarCancelacion(turno);

        // Validar que se proporcione un motivo válido para la cancelación
        if (!isValidCancellationReason(motivo)) {
            throw new IllegalArgumentException(
                    "El motivo de cancelación es obligatorio y debe tener al menos 5 caracteres");
        }

        // Validar medios de contacto ANTES de cancelar
        ValidacionContactoDTO validacionContacto = validarMediosContactoInterno(turno);

        // Capturar datos de cancelación ANTES de cambiar el estado
        CancelacionDataDTO cancelacionData = extraerDatosCancelacion(turno, motivo, performedBy);

        turno.setEstado(EstadoTurno.CANCELADO);
        Turno savedTurno = repository.save(turno);

        // Registrar auditoría de cancelación
        try {
            auditLogService.logTurnoCanceled(savedTurno, previousStatus.name(), performedBy, motivo);
            System.out.println("✅ DEBUG TurnoService.cancelarTurno: Auditoría de cancelación registrada para turno ID: "
                    + savedTurno.getId());
        } catch (Exception e) {
            System.err.println("❌ ERROR TurnoService.cancelarTurno: Falló auditoría de cancelación: " + e.getMessage());
            // No re-lanzar para no romper la cancelación
        }

        // Crear notificación de cancelación para el paciente
        crearNotificacionCancelacion(savedTurno, motivo, performedBy);

        // Log de los datos capturados para futuras funcionalidades (notificacion)
        System.out.println("📋 Datos de cancelación capturados: " + cancelacionData.toString());

        // Log de advertencia si no tiene medios de contacto válidos
        if (!validacionContacto.isTieneMediosValidos()) {
            System.out.println("⚠️ ADVERTENCIA DE CONTACTO: " + validacionContacto.getMensaje());
            System.out.println("📧 Estado detallado: " + validacionContacto.getEstadoDetallado());
        }

        // Enviar notificación por email si el paciente tiene email verificado
        enviarNotificacionCancelacionEmail(savedTurno, cancelacionData, validacionContacto, performedBy);

        // Buscar pacientes en lista de espera que coincidan con el turno cancelado
        boolean buscarPacienteParaReasignar = listaEsperaService.buscarPacienteParaReasignar(savedTurno);
        System.out.println("Estado buscarPacienteParaReasignar: " + buscarPacienteParaReasignar);

        return toDTO(savedTurno);
    }

    /**
     * Método adicional para obtener datos completos de cancelación
     * Útil para casos donde se necesita información detallada sin cancelar el turno
     * inmediatamente
     */
    public CancelacionDataDTO obtenerDatosCancelacion(Integer id, String motivo, String performedBy) {
        Optional<Turno> turnoOpt = repository.findById(id);
        if (turnoOpt.isEmpty()) {
            throw new IllegalArgumentException("Turno no encontrado con ID: " + id);
        }

        Turno turno = turnoOpt.get();
        return extraerDatosCancelacion(turno, motivo, performedBy);
    }

    /**
     * Valida si el paciente del turno tiene medios de contacto válidos para recibir
     * notificaciones
     * Retorna información detallada sobre el estado de los medios de contacto
     */
    public ValidacionContactoDTO validarMediosContacto(Integer turnoId) {
        Optional<Turno> turnoOpt = repository.findById(turnoId);
        if (turnoOpt.isEmpty()) {
            throw new IllegalArgumentException("Turno no encontrado con ID: " + turnoId);
        }

        Turno turno = turnoOpt.get();
        Paciente paciente = turno.getPaciente();

        if (paciente == null) {
            return ValidacionContactoDTO.conAdvertencia(
                    "Advertencia: El turno no tiene un paciente asignado",
                    "Sin paciente asignado al turno",
                    null, null);
        }

        boolean tieneContactoValido = tieneMediosContactoValidos(paciente);
        String estadoDetallado = obtenerEstadoMediosContacto(paciente);

        if (tieneContactoValido) {
            return ValidacionContactoDTO.conMediosValidos(
                    estadoDetallado,
                    paciente.getEmail(),
                    paciente.getTelefono());
        } else {
            String mensaje = "⚠️ Advertencia: El paciente no tiene medios de contacto válidos para recibir la notificación de cancelación. "
                    +
                    "Es posible que no se entere de la cancelación del turno.";
            return ValidacionContactoDTO.conAdvertencia(
                    mensaje,
                    estadoDetallado,
                    paciente.getEmail(),
                    paciente.getTelefono());
        }
    }

    @Transactional
    public TurnoDTO confirmarTurno(Integer id) {
        return confirmarTurno(id, "SYSTEM");
    }

    @Transactional
    public TurnoDTO confirmarTurno(Integer id, String performedBy) {
        Optional<Turno> turnoOpt = repository.findById(id);
        if (turnoOpt.isEmpty()) {
            throw new IllegalArgumentException("Turno no encontrado con ID: " + id);
        }

        Turno turno = turnoOpt.get();
        EstadoTurno previousStatus = turno.getEstado();

        // Validaciones de negocio para confirmación
        validarConfirmacion(turno);

        // Validación de ventana de confirmación
        String rol = determinarRolUsuario(performedBy);
        validarVentanaConfirmacion(turno, rol);

        turno.setEstado(EstadoTurno.CONFIRMADO);
        Turno savedTurno = repository.save(turno);

        // Registrar auditoría de confirmación
        try {
            auditLogService.logTurnoConfirmed(savedTurno, previousStatus.name(), performedBy);
            System.out
                    .println("✅ DEBUG TurnoService.confirmarTurno: Auditoría de confirmación registrada para turno ID: "
                            + savedTurno.getId());
        } catch (Exception e) {
            System.err
                    .println("❌ ERROR TurnoService.confirmarTurno: Falló auditoría de confirmación: " + e.getMessage());
            // No re-lanzar para no romper la confirmación
        }

        // Crear notificación de confirmación para el paciente
        crearNotificacionConfirmacion(savedTurno);

        return toDTO(savedTurno);
    }

    // Método mejorado para validar ventana de confirmación
    private void validarVentanaConfirmacion(Turno turno, String rol) {
        // Administradores y operadores pueden confirmar sin restricciones
        if ("ADMINISTRADOR".equals(rol) || "OPERADOR".equals(rol)) {
            return;
        }

        // Validar consistencia de configuraciones
        configuracionService.validarConfiguracionesTurnos();
        configuracionService.validarConfiguracionesRecordatorios();

        ZoneId zoneId = ZoneId.of("America/Argentina/Buenos_Aires");
        LocalDate hoy = LocalDate.now();
        LocalTime horaActual = LocalTime.now(zoneId);
        long diasRestantes = ChronoUnit.DAYS.between(hoy, turno.getFecha());

        int diasMin = configuracionService.getDiasMinConfirmacion();
        int diasMax = configuracionService.getDiasMaxNoConfirm();
        LocalTime horaCorte = configuracionService.getHoraCorteConfirmacion();
        LocalTime ahoraHora = LocalTime.now(zoneId);

        // Calcular ventana de confirmación
        LocalDate fechaInicioConfirmacion = turno.getFecha().minusDays(diasMax);
        LocalDate fechaFinConfirmacion = turno.getFecha().minusDays(diasMin);

        DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("HH:mm");

        // 🧩 LOGS DE DEPURACIÓN
        System.out.println("🕒 --- VALIDACIÓN DE CONFIRMACIÓN DE TURNO ---");
        System.out.println("📅 Fecha actual: " + hoy);
        System.out.println("🕓 Hora actual: " + horaActual);
        System.out.println("📅 Fecha del turno: " + turno.getFecha());
        System.out.println("🕑 Hora del turno: " + turno.getHoraInicio());
        System.out.println("📉 Días restantes: " + diasRestantes);
        System.out.println(
                "⚙️  Configuración -> Mínimo: " + diasMin + ", Máximo: " + diasMax + ", Hora corte: " + horaCorte);
        System.out.println("👤 Rol del usuario: " + rol);
        System.out.println("🕓 Hora actual: " + ahoraHora);
        System.out.println("--------------------------------------------------");

        // Validaciones
        if (diasRestantes <= 0) {
            throw new IllegalStateException(
                    "Este turno ya ocurrió o es para hoy. Solo se pueden confirmar turnos con anticipación. " +
                            "Por favor, comunicate con el centro de atención si necesitás reprogramarlo.");
        }

        if (diasRestantes < diasMin) {
            throw new IllegalStateException(String.format(
                    "No podés confirmar este turno porque faltan menos de %d días. " +
                            "Los turnos deben confirmarse con al menos %d días de anticipación (hasta el %s antes de las %s).",
                    diasMin, diasMin,
                    fechaFinConfirmacion.format(dateFormatter),
                    horaCorte.format(timeFormatter)));
        }

        if (diasRestantes > diasMax) {
            throw new IllegalStateException(String.format(
                    "Aún no podés confirmar este turno. " +
                            "Las confirmaciones se habilitan entre %d y %d días antes de la fecha del turno, " +
                            "es decir, entre el %s y el %s (hora límite %s).",
                    diasMax, diasMin,
                    fechaInicioConfirmacion.format(dateFormatter),
                    fechaFinConfirmacion.format(dateFormatter),
                    horaCorte.format(timeFormatter)));
        }

        if (diasRestantes == diasMin && horaActual.isAfter(horaCorte)) {
            throw new IllegalStateException(String.format(
                    "Ya pasó la hora límite de confirmación (%s). " +
                            "Podías confirmar este turno hasta las %s del día %s.",
                    horaCorte.format(timeFormatter),
                    horaCorte.format(timeFormatter),
                    fechaFinConfirmacion.format(dateFormatter)));
        }
    }

    // Cancelación automática actualizada

    @Scheduled(cron = "0 0 0 * * ?") // Diariamente a las 00:00
    @Transactional
    public void cancelarTurnosNoConfirmadosAutomaticamente() {
        if (!configuracionService.isHabilitadaCancelacionAutomatica()) {
            System.out.println("Cancelación automática deshabilitada por configuración");
            return;
        }

        LocalDate hoy = LocalDate.now();
        int diasMin = configuracionService.getDiasMinConfirmacion();
        LocalDate fechaLimite = hoy.plusDays(diasMin);

        System.out.println(String.format("Ejecutando cancelación automática para turnos del: %s (límite: %d días)",
                fechaLimite, diasMin));

        List<Turno> turnosACancelar = repository.findByEstadoInAndFecha(
                Arrays.asList(EstadoTurno.PROGRAMADO, EstadoTurno.REAGENDADO),
                fechaLimite);

        System.out.println("Turnos a evaluar para cancelación: " +
                turnosACancelar.size());

        for (Turno turno : turnosACancelar) {
            try {
                String motivo = String.format(
                        "Cancelado automáticamente por falta de confirmación. " +
                                "El turno debía confirmarse antes de %d días de anticipación",
                        diasMin);

                cancelarTurno(turno.getId(), motivo, "SYSTEM_AUTO");

                System.out.println("Turno ID " + turno.getId() +
                        " cancelado automáticamente");

            } catch (Exception e) {
                System.err.println("Error al cancelar automáticamente turno ID " +
                        turno.getId() + ": " + e.getMessage());
            }
        }

        System.out.println("Cancelación automática completada");
    }

    // Nota: Los recordatorios automáticos ahora son manejados por
    // RecordatorioService
    // Los métodos de notificación individuales (confirmar, cancelar, etc.)
    // permanecen aquí

    /**
     * Método para obtener configuración actual del sistema
     * (las estadísticas de recordatorios ahora están en RecordatorioService)
     */
    public Map<String, Object> getConfiguracionSistema() {
        Map<String, Object> config = new HashMap<>();

        // Configuraciones de turnos
        config.putAll(configuracionService.getResumenConfiguracionTurnos());

        // Configuraciones de notificaciones
        config.putAll(configuracionService.getResumenConfiguracionNotificaciones());

        return config;
    }

    @Transactional
    public TurnoDTO reagendarTurno(Integer id, TurnoDTO nuevosDatos) {
        return reagendarTurno(id, nuevosDatos, "Reagendamiento", "SYSTEM");
    }

    @Transactional
    public TurnoDTO reagendarTurno(Integer id, TurnoDTO nuevosDatos, String motivo, String performedBy) {
        Optional<Turno> turnoOpt = repository.findById(id);
        if (turnoOpt.isEmpty()) {
            throw new IllegalArgumentException("Turno no encontrado con ID: " + id);
        }

        Turno turno = turnoOpt.get();
        EstadoTurno previousStatus = turno.getEstado();

        // Capturar los valores antiguos para auditoría (convertir a String para
        // serialización)
        Map<String, Object> oldValues = new HashMap<>();
        oldValues.put("fecha", turno.getFecha().toString());
        oldValues.put("horaInicio", turno.getHoraInicio().toString());
        oldValues.put("horaFin", turno.getHoraFin().toString());
        oldValues.put("estado", turno.getEstado().name());

        // Validaciones de negocio para reagendamiento
        validarReagendamiento(turno);

        // Validar que se proporcione un motivo válido para el reagendamiento
        if (!isValidReschedulingReason(motivo)) {
            throw new IllegalArgumentException(
                    "El motivo de reagendamiento es obligatorio y debe tener al menos 5 caracteres");
        }

        // Actualizar datos del turno
        turno.setFecha(nuevosDatos.getFecha());
        turno.setHoraInicio(nuevosDatos.getHoraInicio());
        turno.setHoraFin(nuevosDatos.getHoraFin());
        turno.setEstado(EstadoTurno.REAGENDADO);

        Turno savedTurno = repository.save(turno);

        // Registrar auditoría de reagendamiento
        try {
            auditLogService.logTurnoRescheduled(savedTurno, previousStatus.name(), oldValues, performedBy, motivo);
            System.out.println(
                    "✅ DEBUG TurnoService.reagendarTurno: Auditoría de reagendamiento registrada para turno ID: "
                            + savedTurno.getId());
        } catch (Exception e) {
            System.err.println(
                    "❌ ERROR TurnoService.reagendarTurno: Falló auditoría de reagendamiento: " + e.getMessage());
            // No re-lanzar para no romper el reagendamiento
        }

        // Crear notificación de reagendamiento para el paciente
        crearNotificacionReagendamiento(savedTurno, oldValues);

        return toDTO(savedTurno);
    }

    /**
     * Obtiene los estados válidos para una transición desde el estado actual
     */
    public List<EstadoTurno> getValidNextStates(Integer turnoId) {
        Optional<Turno> turnoOpt = repository.findById(turnoId);
        if (turnoOpt.isEmpty()) {
            throw new IllegalArgumentException("Turno no encontrado con ID: " + turnoId);
        }

        return getValidNextStates(turnoOpt.get().getEstado());
    }

    @Transactional
    public TurnoDTO marcarAsistencia(Integer turnoId, Boolean asistio, String performedBy) {
        // Validar que asistio no sea null
        if (asistio == null) {
            throw new IllegalArgumentException("El parámetro 'asistio' no puede ser nulo");
        }

        // Buscar el turno
        Turno turno = repository.findById(turnoId)
                .orElseThrow(() -> new EntityNotFoundException("Turno no encontrado con ID: " + turnoId));

        // Guardar estado anterior ANTES de modificar
        EstadoTurno previousStatus = turno.getEstado();
        Boolean previousAsistio = turno.getAsistio();

        // Validar que el turno pueda ser modificado
        validarMarcadoAsistencia(turno);

        // ============ OPCIÓN 2: LÓGICA SEPARADA ============
        // Actualizar solo el campo de asistencia
        turno.setAsistio(asistio);

        // El estado NO cambia automáticamente
        // Solo sincronizamos el estado AUSENTE para mantener compatibilidad
        if (!asistio && (turno.getEstado() == EstadoTurno.CONFIRMADO ||
                turno.getEstado() == EstadoTurno.PROGRAMADO)) {
            // Si marca como no asistido, cambiar a AUSENTE (backward compatibility)
            turno.setEstado(EstadoTurno.AUSENTE);
        }
        // Si asistió, el médico debe marcarlo como COMPLETO manualmente después
        // NO lo marcamos automáticamente como COMPLETO aquí

        // Guardar cambios
        Turno savedTurno = repository.save(turno);

        // Registrar auditoría con contexto correcto
        try {
            String mensaje = asistio ? "Paciente marcado como PRESENTE - Pendiente atención"
                    : "Paciente marcado como AUSENTE";

            auditLogService.logAsistenciaRegistrada(
                    savedTurno,
                    previousStatus,
                    previousAsistio,
                    performedBy,
                    mensaje);
        } catch (Exception e) {
            System.err.println("Error al registrar auditoría de asistencia: " + e.getMessage());
        }

        return toDTO(savedTurno);
    }

    private void validarMarcadoAsistencia(Turno turno) {
        // No se puede modificar turnos cancelados
        if (turno.getEstado() == EstadoTurno.CANCELADO) {
            throw new IllegalStateException("No se puede marcar asistencia en un turno cancelado");
        }

        // No se puede modificar turnos reagendados
        if (turno.getEstado() == EstadoTurno.REAGENDADO) {
            throw new IllegalStateException("No se puede marcar asistencia en un turno reagendado");
        }

        // Validar que sea un turno del día actual o pasado
        LocalDate today = LocalDate.now();
        if (turno.getFecha().isAfter(today)) {
            throw new IllegalStateException(
                    "No se puede marcar asistencia para un turno futuro. Fecha del turno: " +
                            turno.getFecha());
        }

        // OPCIÓN 2: Permitir marcar asistencia en estados relevantes
        // Incluimos AUSENTE y COMPLETO porque pueden necesitar corrección
        if (turno.getEstado() != EstadoTurno.CONFIRMADO &&
                turno.getEstado() != EstadoTurno.PROGRAMADO &&
                turno.getEstado() != EstadoTurno.COMPLETO &&
                turno.getEstado() != EstadoTurno.AUSENTE) {
            throw new IllegalStateException(
                    "Solo se puede marcar asistencia en turnos PROGRAMADOS, CONFIRMADOS, COMPLETOS o AUSENTES. Estado actual: "
                            + turno.getEstado());
        }
    }

    /**
     * Cambia el estado de un turno con validaciones
     */
    @Transactional
    public TurnoDTO changeEstado(Integer id, EstadoTurno newState, String motivo, String performedBy) {
        // Si es una cancelación, delegar al método específico que tiene toda la lógica
        if (newState == EstadoTurno.CANCELADO) {
            return cancelarTurno(id, motivo, performedBy);
        }

        Optional<Turno> turnoOpt = repository.findById(id);
        if (turnoOpt.isEmpty()) {
            throw new IllegalArgumentException("Turno no encontrado con ID: " + id);
        }

        Turno turno = turnoOpt.get();
        EstadoTurno previousStatus = turno.getEstado();

        // Validar que el usuario tiene permisos
        if (!hasPermissionToModifyTurno(performedBy)) {
            throw new IllegalArgumentException("Usuario sin permisos para modificar turnos");
        }

        // Validar que el turno puede ser modificado
        if (!canTurnoBeModified(turno)) {
            throw new IllegalStateException("No se puede modificar un turno cancelado");
        }

        // Validar transición de estado
        if (!isValidStateTransition(previousStatus, newState)) {
            throw new IllegalStateException("Transición de estado inválida de " +
                    previousStatus + " a " + newState);
        }

        // Validar motivo si es requerido
        if (requiresReason(newState)) {
            if (newState == EstadoTurno.REAGENDADO && !isValidReschedulingReason(motivo)) {
                throw new IllegalArgumentException(
                        "El motivo de reagendamiento es obligatorio y debe tener al menos 5 caracteres");
            }
        }

        turno.setEstado(newState);
        Turno savedTurno = repository.save(turno);

        // Registrar auditoría para TODOS los cambios de estado
        String auditReason = motivo != null ? motivo : "Cambio de estado a " + newState.name();
        try {
            auditLogService.logStatusChange(savedTurno, previousStatus.name(), performedBy, auditReason);
            System.out.println(
                    "✅ DEBUG TurnoService.changeEstado: Auditoría de cambio de estado registrada para turno ID: "
                            + savedTurno.getId());
        } catch (Exception e) {
            System.err.println(
                    "❌ ERROR TurnoService.changeEstado: Falló auditoría de cambio de estado: " + e.getMessage());
            // No re-lanzar para no romper el cambio de estado
        }

        // Acciones específicas según el nuevo estado
        switch (newState) {
            case CONFIRMADO:
                // Crear notificación de confirmación
                crearNotificacionConfirmacion(savedTurno);
                break;
            case PROGRAMADO:
            case CANCELADO:
            case COMPLETO:
            case REAGENDADO:
                auditLogService.logStatusChange(savedTurno, previousStatus.name(), performedBy,
                        motivo != null ? motivo : "Cambio de estado");
                // Nota: Para reagendamiento completo se debe usar el método reagendarTurno()
                // que incluye nueva fecha
                break;
            default:
                auditLogService.logStatusChange(savedTurno, previousStatus.name(), performedBy,
                        motivo != null ? motivo : "Cambio de estado");
                break;
        }

        return toDTO(savedTurno);
    }

    // Métodos de validación de reglas de negocio
    private void validarCancelacion(Turno turno) {
        // Validar que el turno puede ser modificado
        if (!canTurnoBeModified(turno)) {
            throw new IllegalStateException("No se puede cancelar un turno que ya está cancelado");
        }

        // Validar transiciones de estado válidas
        if (!isValidStateTransition(turno.getEstado(), EstadoTurno.CANCELADO)) {
            throw new IllegalStateException("Transición de estado inválida de " +
                    turno.getEstado() + " a CANCELADO");
        }

        // No se pueden cancelar turnos el mismo día de la cita sin justificación válida
        LocalDate hoy = LocalDate.now();
        if (turno.getFecha().equals(hoy)) {
            throw new IllegalStateException("No se pueden cancelar turnos el mismo día de la cita");
        }
    }

    private void validarConfirmacion(Turno turno) {
        // Validar que el turno puede ser modificado
        if (!canTurnoBeModified(turno)) {
            throw new IllegalStateException("No se puede confirmar un turno cancelado");
        }

        // Validar transiciones de estado válidas
        if (!isValidStateTransition(turno.getEstado(), EstadoTurno.CONFIRMADO)) {
            throw new IllegalStateException("Transición de estado inválida de " +
                    turno.getEstado() + " a CONFIRMADO");
        }
    }

    private void validarReagendamiento(Turno turno) {
        // Validar que el turno puede ser modificado
        if (!canTurnoBeModified(turno)) {
            throw new IllegalStateException("No se puede reagendar un turno cancelado");
        }

        // Validar transiciones de estado válidas
        if (!isValidStateTransition(turno.getEstado(), EstadoTurno.REAGENDADO)) {
            throw new IllegalStateException("Transición de estado inválida de " +
                    turno.getEstado() + " a REAGENDADO");
        }
    }

    // Métodos de conversión entre entidad y DTO
    private TurnoDTO toDTO(Turno turno) {
        TurnoDTO dto = new TurnoDTO();
        dto.setId(turno.getId());
        dto.setFecha(turno.getFecha());
        dto.setHoraInicio(turno.getHoraInicio());
        dto.setHoraFin(turno.getHoraFin());
        dto.setEstado(turno.getEstado().name());
        dto.setPacienteId(turno.getPaciente().getId());
        dto.setNombrePaciente(turno.getPaciente().getNombre());
        dto.setApellidoPaciente(turno.getPaciente().getApellido());

        // Datos del médico: usar staffMedico si existe, sino usar campos de auditoría
        if (turno.getStaffMedico() != null) {
            dto.setStaffMedicoId(turno.getStaffMedico().getId());
            dto.setStaffMedicoNombre(turno.getStaffMedico().getMedico().getNombre());
            dto.setStaffMedicoApellido(turno.getStaffMedico().getMedico().getApellido());
            dto.setEspecialidadStaffMedico(turno.getStaffMedico().getEspecialidad().getNombre());
        } else {
            // StaffMedico fue desvinculado, usar campos de auditoría
            dto.setStaffMedicoId(null);
            if (turno.getMedico() != null) {
                dto.setStaffMedicoNombre(turno.getMedico().getNombre());
                dto.setStaffMedicoApellido(turno.getMedico().getApellido());
            }
            if (turno.getEspecialidad() != null) {
                dto.setEspecialidadStaffMedico(turno.getEspecialidad().getNombre());
            }
        }

        // Nuevo campo de observaciones
        dto.setObservaciones(turno.getObservaciones());

        // Validar si consultorio no es null antes de acceder a sus propiedades
        if (turno.getConsultorio() != null) {
            dto.setConsultorioId(turno.getConsultorio().getId());
            dto.setConsultorioNombre(turno.getConsultorio().getNombre());
            dto.setCentroId(turno.getConsultorio().getCentroAtencion().getId());
            dto.setNombreCentro(turno.getConsultorio().getCentroAtencion().getNombre());
        } else {
            dto.setConsultorioId(null);
            dto.setConsultorioNombre(null);
            // Usar centro de auditoría como fallback si existe
            if (turno.getCentroAtencion() != null) {
                dto.setCentroId(turno.getCentroAtencion().getId());
                dto.setNombreCentro(turno.getCentroAtencion().getNombre());
            } else {
                dto.setCentroId(null);
                dto.setNombreCentro(null);
            }
        }

        return dto;
    }

    private Turno toEntity(TurnoDTO dto) {
        System.out.println("Procesando TurnoDTO: " + dto);

        Turno turno = new Turno();
        turno.setId(dto.getId());
        turno.setFecha(dto.getFecha());
        turno.setHoraInicio(dto.getHoraInicio());
        turno.setHoraFin(dto.getHoraFin());

        // Nuevo campo de observaciones
        turno.setObservaciones(dto.getObservaciones());

        // Si no se especifica estado, usar PROGRAMADO por defecto
        if (dto.getEstado() != null && !dto.getEstado().isEmpty()) {
            turno.setEstado(EstadoTurno.valueOf(dto.getEstado()));
        } else {
            turno.setEstado(EstadoTurno.PROGRAMADO);
        }

        if (dto.getPacienteId() != null) {
            Paciente paciente = pacienteRepository.findById(dto.getPacienteId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Paciente no encontrado con ID: " + dto.getPacienteId()));
            turno.setPaciente(paciente);
        }

        if (dto.getStaffMedicoId() != null) {
            StaffMedico staffMedico = staffMedicoRepository.findById(dto.getStaffMedicoId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Médico no encontrado con ID: " + dto.getStaffMedicoId()));
            turno.setStaffMedico(staffMedico);

            // Campos de auditoría: preservar información histórica
            turno.setMedico(staffMedico.getMedico());
            turno.setEspecialidad(staffMedico.getEspecialidad());
            turno.setCentroAtencion(staffMedico.getCentroAtencion());
        }

        if (dto.getConsultorioId() != null) {
            Consultorio consultorio = consultorioRepository.findById(dto.getConsultorioId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Consultorio no encontrado con ID: " + dto.getConsultorioId()));
            turno.setConsultorio(consultorio);
        } else {
            throw new IllegalArgumentException("El consultorio es obligatorio.");
        }

        System.out.println("Turno procesado: " + turno);
        return turno;
    }

    private void validarTurno(Turno turno) {
        if (turno.getFecha() == null) {
            throw new IllegalArgumentException("La fecha del turno es obligatoria");
        }
        if (turno.getHoraInicio() == null) {
            throw new IllegalArgumentException("La hora de inicio es obligatoria");
        }
        if (turno.getHoraFin() == null) {
            throw new IllegalArgumentException("La hora de fin es obligatoria");
        }
        if (turno.getHoraFin().isBefore(turno.getHoraInicio())) {
            throw new IllegalArgumentException("La hora de fin no puede ser anterior a la hora de inicio");
        }
        if (turno.getPaciente() == null || turno.getPaciente().getId() == null) {
            throw new IllegalArgumentException("El paciente es obligatorio");
        }
        if (turno.getStaffMedico() == null || turno.getStaffMedico().getId() == null) {
            throw new IllegalArgumentException("El médico es obligatorio");
        }
        if (turno.getEstado() == null) {
            throw new IllegalArgumentException("El estado del turno es obligatorio");
        }
    }

    // public TurnoDTO asignarTurno(TurnoDTO turnoDTO) {
    // if (turnoDTO == null) {
    // throw new IllegalArgumentException("El turnoDTO no puede ser nulo.");
    // }

    // // Crear un nuevo turno utilizando los datos del TurnoDTO
    // Turno turno = new Turno();
    // turno.setFecha(turnoDTO.getFecha());
    // turno.setHoraInicio(turnoDTO.getHoraInicio());
    // turno.setHoraFin(turnoDTO.getHoraFin());
    // turno.setEstado(EstadoTurno.PROGRAMADO); // Estado inicial

    // // Asignar el paciente
    // if (turnoDTO.getPacienteId() != null) {
    // Paciente paciente = pacienteRepository.findById(turnoDTO.getPacienteId())
    // .orElseThrow(() -> new IllegalArgumentException(
    // "Paciente no encontrado con ID: " + turnoDTO.getPacienteId()));
    // turno.setPaciente(paciente);
    // }

    // // Asignar datos del esquema directamente desde el TurnoDTO
    // turno.setStaffMedico(new StaffMedico(turnoDTO.getStaffMedicoId(),
    // turnoDTO.getStaffMedicoNombre));
    // turno.setConsultorio(new Consultorio(turnoDTO.getConsultorioId(),
    // turnoDTO.getConsultorioNombre));
    // turno.setCentroAtencion(new CentroAtencion(turnoDTO.getCentroId(),
    // turnoDTO.getNombreCentro));

    // // Guardar el turno
    // Turno savedTurno = repository.save(turno);

    // // Retornar el turno como DTO
    // return toDTO(savedTurno);
    // }

    // === MÉTODOS DE AUDITORÍA ===

    /**
     * Obtiene el historial completo de auditoría de un turno específico
     */
    public List<AuditLog> getTurnoAuditHistory(Integer turnoId) {
        return auditLogService.getTurnoAuditHistory(turnoId);
    }

    /**
     * Obtiene el historial de auditoría de un turno con paginación
     */
    public Page<AuditLog> getTurnoAuditHistoryPaged(Integer turnoId, int page, int size) {
        return auditLogService.getTurnoAuditHistoryPaged(turnoId, PageRequest.of(page, size));
    }

    /**
     * Verifica la integridad del historial de auditoría de un turno
     */
    public boolean verifyTurnoAuditIntegrity(Integer turnoId) {
        return auditLogService.verifyAuditIntegrity(turnoId);
    }

    /**
     * Obtiene estadísticas de auditoría generales
     */
    public List<Object[]> getAuditStatistics() {
        return auditLogService.getActionStatistics();
    }

    /**
     * Obtiene logs recientes del sistema
     */
    public List<AuditLog> getRecentAuditLogs() {
        return auditLogService.getRecentLogs();
    }

    // Consultas avanzadas con filtros (versión simplificada sin CriteriaBuilder)
    public List<TurnoDTO> findByFilters(TurnoFilterDTO filter) {
        // Validar y limpiar el filtro
        TurnoFilterDTO cleanFilter = validateAndCleanFilter(filter);

        // Usar los métodos del repositorio en lugar de CriteriaBuilder
        if (cleanFilter.getEstado() != null && !cleanFilter.getEstado().isEmpty()) {
            try {
                EstadoTurno estadoEnum = EstadoTurno.valueOf(cleanFilter.getEstado().toUpperCase());
                return repository.findByEstado(estadoEnum).stream()
                        .map(this::toDTO)
                        .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                System.err.println("Estado inválido en filtro simple: " + cleanFilter.getEstado());
                // Estado inválido, retornar lista vacía
                return Collections.emptyList();
            }
        }

        if (cleanFilter.getPacienteId() != null) {
            return repository.findByPaciente_Id(cleanFilter.getPacienteId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }

        if (cleanFilter.getStaffMedicoId() != null) {
            return repository.findByStaffMedico_Id(cleanFilter.getStaffMedicoId()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }

        if (cleanFilter.getFechaExacta() != null) {
            System.out.println("🔍 DEBUG: Buscando turnos por fecha exacta: " + cleanFilter.getFechaExacta());
            return repository.findByFecha(cleanFilter.getFechaExacta()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }

        if (cleanFilter.getFechaDesde() != null && cleanFilter.getFechaHasta() != null) {
            System.out.println("🔍 DEBUG: Buscando turnos entre fechas: " + cleanFilter.getFechaDesde() + " y "
                    + cleanFilter.getFechaHasta());
            return repository.findByFechaBetween(cleanFilter.getFechaDesde(), cleanFilter.getFechaHasta()).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
        }

        // Si no hay filtros específicos, retornar todos
        return repository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // === MÉTODOS DE CONSULTA AVANZADA CON FILTROS ===

    /**
     * Busca turnos aplicando filtros múltiples con paginación
     */
    public Page<TurnoDTO> findByAdvancedFilters(TurnoFilterDTO filter) {
        // Validar y limpiar el filtro
        TurnoFilterDTO cleanFilter = validateAndCleanFilter(filter);

        EstadoTurno estadoEnum = null;
        if (cleanFilter.getEstado() != null && !cleanFilter.getEstado().isEmpty()) {
            try {
                estadoEnum = EstadoTurno.valueOf(cleanFilter.getEstado().toUpperCase());
            } catch (IllegalArgumentException e) {
                System.err.println("Estado inválido en filtro: " + cleanFilter.getEstado());
                // Si el estado no es válido, no se aplica este filtro
            }
        }

        // Crear el objeto Pageable para paginación y ordenamiento
        Sort sort = Sort.by(
                "DESC".equalsIgnoreCase(cleanFilter.getSortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC,
                cleanFilter.getSortBy());
        org.springframework.data.domain.Pageable pageable = PageRequest.of(cleanFilter.getPage(), cleanFilter.getSize(),
                sort);

        System.out.println("🔍 DEBUG: Ejecutando búsqueda avanzada con filtros:");
        System.out.println("   - Estado: " + estadoEnum);
        System.out.println("   - PacienteId: " + cleanFilter.getPacienteId());
        System.out.println("   - StaffMedicoId: " + cleanFilter.getStaffMedicoId());
        System.out.println("   - EspecialidadId: " + cleanFilter.getEspecialidadId());
        System.out.println("   - CentroId: " + cleanFilter.getCentroAtencionId());
        System.out.println("   - ConsultorioId: " + cleanFilter.getConsultorioId());
        System.out.println("   - FechaDesde: " + cleanFilter.getFechaDesde());
        System.out.println("   - FechaHasta: " + cleanFilter.getFechaHasta());

        // Crear especificación usando métodos estáticos del repositorio
        Specification<Turno> spec = TurnoRepository.buildSpecification(
                estadoEnum,
                cleanFilter.getPacienteId(),
                cleanFilter.getStaffMedicoId(),
                cleanFilter.getEspecialidadId(),
                cleanFilter.getCentroAtencionId(),
                cleanFilter.getConsultorioId(),
                cleanFilter.getFechaDesde(),
                cleanFilter.getFechaHasta(),
                cleanFilter.getFechaExacta(),
                cleanFilter.getNombrePaciente(),
                cleanFilter.getNombreMedico(),
                cleanFilter.getNombreEspecialidad(),
                cleanFilter.getNombreCentro());

        // Usar el método de JpaSpecificationExecutor
        Page<Turno> turnosPage = repository.findAll(spec, pageable);

        System.out.println("✅ DEBUG: Búsqueda completada. Resultados encontrados: " + turnosPage.getTotalElements());

        // Convertir a DTOs con información de auditoría
        return turnosPage.map(this::toDTOWithAuditInfo);
    }

    /**
     * Busca turnos para exportación (sin paginación)
     */
    public List<TurnoDTO> findForExport(TurnoFilterDTO filter) {
        // Validar y limpiar el filtro
        TurnoFilterDTO cleanFilter = validateAndCleanFilter(filter);

        EstadoTurno estadoEnum = null;
        if (cleanFilter.getEstado() != null && !cleanFilter.getEstado().isEmpty()) {
            try {
                estadoEnum = EstadoTurno.valueOf(cleanFilter.getEstado().toUpperCase());
            } catch (IllegalArgumentException e) {
                System.err.println("Estado inválido en filtro de exportación: " + cleanFilter.getEstado());
                // Si el estado no es válido, no se aplica este filtro
            }
        }

        System.out.println("🔍 DEBUG: Ejecutando búsqueda para exportación con filtros:");
        System.out.println("   - Estado: " + estadoEnum);
        System.out.println("   - PacienteId: " + cleanFilter.getPacienteId());
        System.out.println("   - StaffMedicoId: " + cleanFilter.getStaffMedicoId());
        System.out.println("   - EspecialidadId: " + cleanFilter.getEspecialidadId());
        System.out.println("   - CentroId: " + cleanFilter.getCentroAtencionId());
        System.out.println("   - ConsultorioId: " + cleanFilter.getConsultorioId());
        System.out.println("   - FechaDesde: " + cleanFilter.getFechaDesde());
        System.out.println("   - FechaHasta: " + cleanFilter.getFechaHasta());

        // Crear especificación usando métodos estáticos del repositorio
        Specification<Turno> spec = TurnoRepository.buildSpecification(
                estadoEnum,
                cleanFilter.getPacienteId(),
                cleanFilter.getStaffMedicoId(),
                cleanFilter.getEspecialidadId(),
                cleanFilter.getCentroAtencionId(),
                cleanFilter.getConsultorioId(),
                cleanFilter.getFechaDesde(),
                cleanFilter.getFechaHasta(),
                cleanFilter.getFechaExacta(),
                cleanFilter.getNombrePaciente(),
                cleanFilter.getNombreMedico(),
                cleanFilter.getNombreEspecialidad(),
                cleanFilter.getNombreCentro());

        // Usar JpaSpecificationExecutor sin paginación para exportación
        Sort sort = Sort.by(
                "DESC".equalsIgnoreCase(cleanFilter.getSortDirection()) ? Sort.Direction.DESC : Sort.Direction.ASC,
                cleanFilter.getSortBy());

        List<Turno> turnos = repository.findAll(spec, sort);

        System.out.println("✅ DEBUG: Búsqueda para exportación completada. Resultados encontrados: " + turnos.size());

        // Convertir a DTOs con información de auditoría
        return turnos.stream()
                .map(this::toDTOWithAuditInfo)
                .collect(Collectors.toList());
    }

    /**
     * Convierte Turno a TurnoDTO incluyendo información de auditoría
     */
    private TurnoDTO toDTOWithAuditInfo(Turno turno) {
        TurnoDTO dto = toDTO(turno); // Usar el método existente

        try {
            // Agregar información de auditoría
            List<AuditLog> auditHistory = auditLogService.getTurnoAuditHistory(turno.getId());
            if (!auditHistory.isEmpty()) {
                // Obtener la última modificación
                AuditLog lastAudit = auditHistory.get(0); // Ya están ordenados por fecha
                dto.setUltimoUsuarioModificacion(lastAudit.getPerformedBy());
                dto.setFechaUltimaModificacion(lastAudit.getPerformedAt());
                dto.setMotivoUltimaModificacion(lastAudit.getReason());
                dto.setTotalModificaciones(auditHistory.size());
            } else {
                // Si no hay auditoría, significa que es un turno sin modificaciones
                dto.setTotalModificaciones(0);
            }
        } catch (Exception e) {
            // Si hay error al obtener auditoría, no fallar la consulta principal
            System.err.println("Error al obtener auditoría para turno " + turno.getId() +
                    ": " + e.getMessage());
            dto.setTotalModificaciones(0);
        }

        return dto;
    }

    /**
     * Validaciones administrativas para corrección de inconsistencias
     */
    public void validateAdminModification(Integer turnoId, String adminUser) {
        if (adminUser == null || (!adminUser.equals("ADMIN") && !adminUser.startsWith("ADMIN_"))) {
            throw new SecurityException("Solo los administradores pueden realizar modificaciones en turnos");
        }

        Optional<Turno> turnoOpt = repository.findById(turnoId);
        if (turnoOpt.isEmpty()) {
            throw new IllegalArgumentException("Turno no encontrado");
        }

        Turno turno = turnoOpt.get();

        // No se pueden modificar turnos cancelados
        if (turno.getEstado() == EstadoTurno.CANCELADO) {
            throw new IllegalStateException("No se pueden modificar turnos cancelados");
        }

        // Validar disponibilidad del médico y consultorio
        validateMedicoDisponibilidad(turno);
        validateConsultorioDisponibilidad(turno);
    }

    private void validateMedicoDisponibilidad(Turno turno) {
        // Verificar que no haya conflictos con otros turnos del médico
        boolean hasConflict = repository.existsByFechaAndHoraInicioAndStaffMedicoIdAndEstadoNot(
                turno.getFecha(),
                turno.getHoraInicio(),
                turno.getStaffMedico().getId(),
                EstadoTurno.CANCELADO);

        if (hasConflict) {
            throw new IllegalStateException("El médico ya tiene un turno asignado en ese horario");
        }
    }

    private void validateConsultorioDisponibilidad(Turno turno) {
        // Validaciones específicas del consultorio
        if (turno.getConsultorio() == null) {
            throw new IllegalArgumentException("El consultorio es obligatorio para la validación");
        }
        // Aquí se podrían agregar más validaciones específicas del consultorio
        // Por ejemplo, verificar horarios de disponibilidad, mantenimiento, etc.
    }

    // === MÉTODOS DE BÚSQUEDA POR TEXTO ===

    /**
     * Busca turnos por nombres (paciente, médico, especialidad, centro)
     */
    public Page<TurnoDTO> findByTextSearch(String searchText, org.springframework.data.domain.Pageable pageable) {
        if (searchText == null || searchText.trim().isEmpty()) {
            return repository.findAll(pageable).map(this::toDTOWithAuditInfo);
        }

        // Usar el mismo texto para buscar en todos los campos
        String searchPattern = searchText.trim();

        Page<Turno> turnosPage = repository.findByTextFilters(
                searchPattern, // nombrePaciente
                searchPattern, // nombreMedico
                searchPattern, // nombreEspecialidad
                searchPattern, // nombreCentro
                pageable);

        return turnosPage.map(this::toDTOWithAuditInfo);
    }

    @Transactional
    public TurnoDTO completarTurno(Integer id) {
        return completarTurno(id, "SYSTEM");
    }

    @Transactional
    public TurnoDTO completarTurno(Integer id, String performedBy) {
        Optional<Turno> turnoOpt = repository.findById(id);
        if (turnoOpt.isEmpty()) {
            throw new IllegalArgumentException("Turno no encontrado con ID: " + id);
        }

        Turno turno = turnoOpt.get();
        EstadoTurno previousStatus = turno.getEstado();

        // Validaciones de negocio para completar turno
        validarComplecion(turno);

        turno.setEstado(EstadoTurno.COMPLETO);
        Turno savedTurno = repository.save(turno);

        // Registrar auditoría de completar turno
        try {
            auditLogService.logTurnoCompleted(savedTurno, previousStatus.name(), performedBy);
            System.out.println("✅ DEBUG TurnoService.completarTurno: Auditoría de completado registrada para turno ID: "
                    + savedTurno.getId());
        } catch (Exception e) {
            System.err.println("❌ ERROR TurnoService.completarTurno: Falló auditoría de completado: " + e.getMessage());
            // No re-lanzar para no romper el completado
        }

        // Crear notificación de turno completado (opcional, puede ser útil para el
        // paciente)
        try {
            String fechaTurno = formatearFechaTurno(savedTurno);
            String especialidad = obtenerEspecialidadTurno(savedTurno);
            String medico = obtenerNombreMedico(savedTurno);

            notificacionService.crearNotificacion(
                    savedTurno.getPaciente().getId(),
                    "Turno Completado",
                    String.format("Su turno del %s con Dr/a %s en %s ha sido completado exitosamente",
                            fechaTurno, medico, especialidad),
                    TipoNotificacion.CONFIRMACION,
                    savedTurno.getId(),
                    "SISTEMA");
        } catch (Exception e) {
            // Log error pero no fallar la operación principal
            System.err.println("Error al crear notificación de turno completado: " + e.getMessage());
        }

        return toDTO(savedTurno);
    }

    private void validarComplecion(Turno turno) {
        // Validar que el turno puede ser modificado
        if (!canTurnoBeModified(turno)) {
            throw new IllegalStateException("No se puede completar un turno cancelado o ya completado");
        }

        // Solo se pueden completar turnos confirmados
        if (turno.getEstado() != EstadoTurno.CONFIRMADO) {
            throw new IllegalStateException(
                    "Solo se pueden completar turnos confirmados. Estado actual: " + turno.getEstado());
        }

        // Validar transiciones de estado válidas
        if (!isValidStateTransition(turno.getEstado(), EstadoTurno.COMPLETO)) {
            throw new IllegalStateException("Transición de estado inválida de " +
                    turno.getEstado() + " a COMPLETO");
        }
    }

    /**
     * Buscar turnos con filtros y paginación
     */
    public Page<TurnoDTO> findByFilters(TurnoFilterDTO filter, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);

        // Por simplicidad, implementar filtros básicos
        // En producción, usar Specifications de JPA para filtros más complejos

        if (filter.getEstado() != null && !filter.getEstado().isEmpty()) {
            try {
                EstadoTurno estadoEnum = EstadoTurno.valueOf(filter.getEstado().toUpperCase());
                // Obtener todos y filtrar - no ideal para producción pero funcional
                List<Turno> allTurnos = repository.findByEstado(estadoEnum);
                return createPageFromList(allTurnos, pageRequest).map(this::toDTO);
            } catch (IllegalArgumentException e) {
                return Page.empty(pageRequest);
            }
        }

        if (filter.getPacienteId() != null) {
            List<Turno> allTurnos = repository.findByPaciente_Id(filter.getPacienteId());
            return createPageFromList(allTurnos, pageRequest).map(this::toDTO);
        }

        // Si no hay filtros específicos, retornar todos paginados
        return repository.findAll(pageRequest).map(this::toDTO);
    }

    /**
     * Crear página desde lista - método auxiliar
     */
    private Page<Turno> createPageFromList(List<Turno> list, PageRequest pageRequest) {
        int start = (int) pageRequest.getOffset();
        int end = Math.min((start + pageRequest.getPageSize()), list.size());

        if (start > list.size()) {
            return new org.springframework.data.domain.PageImpl<>(
                    Collections.emptyList(), pageRequest, list.size());
        }

        return new org.springframework.data.domain.PageImpl<>(
                list.subList(start, end), pageRequest, list.size());
    }

    // Métodos auxiliares para crear notificaciones
    private void crearNotificacionCancelacion(Turno turno, String motivo, String performedBy) {
        try {
            String fechaTurno = formatearFechaTurno(turno);
            String especialidad = obtenerEspecialidadTurno(turno);

            notificacionService.crearNotificacionCancelacion(
                    turno.getPaciente().getId(),
                    turno.getId(),
                    fechaTurno,
                    especialidad,
                    motivo);

            // Registrar auditoría de notificación in-app exitosa
            registrarAuditoriaNotificacion(turno, "IN_APP", "SUCCESS",
                    "Notificación in-app enviada exitosamente al paciente " + turno.getPaciente().getNombre() + " "
                            + turno.getPaciente().getApellido(),
                    performedBy);

        } catch (Exception e) {
            // Registrar auditoría de notificación fallida
            registrarAuditoriaNotificacion(turno, "IN_APP", "FAIL",
                    "Error al enviar notificación in-app: " + e.getMessage(), performedBy);

            // Log error pero no fallar la operación principal
            System.err.println("Error al crear notificación de cancelación: " + e.getMessage());
        }
    }

    private void crearNotificacionConfirmacion(Turno turno) {
        try {
            String fechaTurno = formatearFechaTurno(turno);
            String especialidad = obtenerEspecialidadTurno(turno);
            String medico = obtenerNombreMedico(turno);

            notificacionService.crearNotificacionConfirmacion(
                    turno.getPaciente().getId(),
                    turno.getId(),
                    fechaTurno,
                    especialidad,
                    medico);

            // Enviar email de confirmación al paciente
            enviarEmailConfirmacionTurno(turno, fechaTurno, especialidad, medico);

        } catch (Exception e) {
            // Log error pero no fallar la operación principal
            System.err.println("Error al crear notificación de confirmación: " + e.getMessage());
        }
    }

    /**
     * Envía email de confirmación de turno al paciente
     */
    private void enviarEmailConfirmacionTurno(Turno turno, String fechaTurno, String especialidad, String medico) {
        try {
            // Verificar que el paciente tenga email
            if (turno.getPaciente() == null || turno.getPaciente().getEmail() == null ||
                    turno.getPaciente().getEmail().trim().isEmpty()) {
                System.err
                        .println("No se pudo enviar email: paciente sin email válido para turno ID: " + turno.getId());
                return;
            }

            String patientEmail = turno.getPaciente().getEmail();
            String patientName = turno.getPaciente().getNombre() + " " + turno.getPaciente().getApellido();

            // Construir detalles del turno para el email
            String appointmentDetails = construirDetallesTurnoEmail(turno, fechaTurno, especialidad, medico);

            // Enviar email de forma asíncrona
            emailService.sendAppointmentConfirmationEmail(patientEmail, patientName, appointmentDetails);

            System.out.println("Email de confirmación enviado a: " + patientEmail + " para turno ID: " + turno.getId());

        } catch (Exception e) {
            // Log error pero no fallar la operación principal
            System.err.println(
                    "Error al enviar email de confirmación para turno ID " + turno.getId() + ": " + e.getMessage());
        }
    }

    /**
     * Construye los detalles del turno formateados para el email
     */
    private String construirDetallesTurnoEmail(Turno turno, String fechaTurno, String especialidad, String medico) {
        StringBuilder detalles = new StringBuilder();

        detalles.append("<p><strong>Fecha y Hora:</strong> ").append(fechaTurno).append("</p>");
        detalles.append("<p><strong>Especialidad:</strong> ").append(especialidad).append("</p>");
        detalles.append("<p><strong>Médico:</strong> Dr/a. ").append(medico).append("</p>");

        // Agregar información del consultorio si está disponible
        if (turno.getConsultorio() != null) {
            detalles.append("<p><strong>Consultorio:</strong> ").append(turno.getConsultorio().getNombre());

            // Agregar centro de atención si está disponible
            if (turno.getConsultorio().getCentroAtencion() != null) {
                detalles.append(" - ").append(turno.getConsultorio().getCentroAtencion().getNombre());
            }
            detalles.append("</p>");
        }

        // Agregar número de turno
        detalles.append("<p><strong>Número de Turno:</strong> #").append(turno.getId()).append("</p>");

        return detalles.toString();
    }

    private void crearNotificacionReagendamiento(Turno turno, Map<String, Object> oldValues) {
        try {
            String fechaAnterior = formatearFechaDesdeString(oldValues.get("fecha").toString());
            String fechaNueva = formatearFechaTurno(turno);
            String especialidad = obtenerEspecialidadTurno(turno);

            notificacionService.crearNotificacionReagendamiento(
                    turno.getPaciente().getId(),
                    turno.getId(),
                    fechaAnterior,
                    fechaNueva,
                    especialidad);
        } catch (Exception e) {
            // Log error pero no fallar la operación principal
            System.err.println("Error al crear notificación de reagendamiento: " + e.getMessage());
        }
    }

    private void crearNotificacionNuevoTurno(Turno turno) {
        try {
            String fechaTurno = formatearFechaTurno(turno);
            String especialidad = obtenerEspecialidadTurno(turno);
            String medico = obtenerNombreMedico(turno);

            notificacionService.crearNotificacionNuevoTurno(
                    turno.getPaciente().getId(),
                    turno.getId(),
                    fechaTurno,
                    especialidad,
                    medico);
        } catch (Exception e) {
            // Log error pero no fallar la operación principal
            System.err.println("Error al crear notificación de nuevo turno: " + e.getMessage());
        }
    }

    private String formatearFechaTurno(Turno turno) {
        return turno.getFecha().toString() + " " + turno.getHoraInicio().toString();
    }

    private String formatearFechaDesdeString(String fechaString) {
        return fechaString; // Podría mejorarse el formateo
    }

    private String obtenerEspecialidadTurno(Turno turno) {
        if (turno.getStaffMedico() != null && turno.getStaffMedico().getEspecialidad() != null) {
            return turno.getStaffMedico().getEspecialidad().getNombre();
        }
        return "Especialidad no disponible";
    }

    private String obtenerNombreMedico(Turno turno) {
        if (turno.getStaffMedico() != null && turno.getStaffMedico().getMedico() != null) {
            return turno.getStaffMedico().getMedico().getNombre() + " "
                    + turno.getStaffMedico().getMedico().getApellido();
        }
        return "Médico no disponible";
    }

    /**
     * Valida y limpia los filtros antes de usarlos en las consultas
     * Maneja especialmente los campos de fecha que pueden venir como null o strings
     * vacíos
     */
    private TurnoFilterDTO validateAndCleanFilter(TurnoFilterDTO filter) {
        if (filter == null) {
            filter = new TurnoFilterDTO();
        }

        // Crear una copia limpia del filtro
        TurnoFilterDTO cleanFilter = new TurnoFilterDTO();

        // Copiar campos básicos, validando y limpiando
        cleanFilter.setEstado(cleanAndValidateString(filter.getEstado()));
        cleanFilter.setPacienteId(filter.getPacienteId());
        cleanFilter.setStaffMedicoId(filter.getStaffMedicoId());
        cleanFilter.setEspecialidadId(filter.getEspecialidadId());
        cleanFilter.setCentroAtencionId(filter.getCentroAtencionId());
        cleanFilter.setConsultorioId(filter.getConsultorioId());
        cleanFilter.setCentroId(filter.getCentroId()); // alias para centroAtencionId
        cleanFilter.setMedicoId(filter.getMedicoId()); // alias para staffMedicoId

        // Validar y limpiar fechas - CRÍTICO para evitar errores SQL
        cleanFilter.setFechaDesde(validateDate(filter.getFechaDesde(), "fechaDesde"));
        cleanFilter.setFechaHasta(validateDate(filter.getFechaHasta(), "fechaHasta"));
        cleanFilter.setFechaExacta(validateDate(filter.getFechaExacta(), "fechaExacta"));

        // Validar orden de fechas
        if (cleanFilter.getFechaDesde() != null && cleanFilter.getFechaHasta() != null) {
            if (cleanFilter.getFechaDesde().isAfter(cleanFilter.getFechaHasta())) {
                System.err.println("⚠️  WARNING: fechaDesde (" + cleanFilter.getFechaDesde() +
                        ") es posterior a fechaHasta (" + cleanFilter.getFechaHasta() + "). Intercambiando valores.");
                LocalDate temp = cleanFilter.getFechaDesde();
                cleanFilter.setFechaDesde(cleanFilter.getFechaHasta());
                cleanFilter.setFechaHasta(temp);
            }
        }

        // Copiar campos de paginación con valores por defecto
        cleanFilter.setPage(filter.getPage() != null ? Math.max(0, filter.getPage()) : 0);
        cleanFilter.setSize(filter.getSize() != null ? Math.min(Math.max(1, filter.getSize()), 100) : 20);
        cleanFilter.setSortBy(cleanAndValidateString(filter.getSortBy()) != null ? filter.getSortBy() : "fecha");
        cleanFilter.setSortDirection(
                cleanAndValidateString(filter.getSortDirection()) != null ? filter.getSortDirection() : "ASC");

        // Campos de auditoría y búsqueda de texto
        cleanFilter.setNombrePaciente(cleanAndValidateString(filter.getNombrePaciente()));
        cleanFilter.setNombreMedico(cleanAndValidateString(filter.getNombreMedico()));
        cleanFilter.setNombreEspecialidad(cleanAndValidateString(filter.getNombreEspecialidad()));
        cleanFilter.setNombreCentro(cleanAndValidateString(filter.getNombreCentro()));
        cleanFilter.setUsuarioModificacion(cleanAndValidateString(filter.getUsuarioModificacion()));
        cleanFilter.setConModificaciones(filter.getConModificaciones());
        cleanFilter.setExportFormat(cleanAndValidateString(filter.getExportFormat()));

        return cleanFilter;
    }

    // === MÉTODOS DE VALIDACIÓN INTEGRADOS ===

    /**
     * Valida si una transición de estado es válida
     */
    private boolean isValidStateTransition(EstadoTurno currentState, EstadoTurno newState) {
        if (currentState == null || newState == null) {
            return false;
        }

        List<EstadoTurno> validNextStates = VALID_TRANSITIONS.get(currentState);
        return validNextStates != null && validNextStates.contains(newState);
    }

    /**
     * Valida si un turno puede ser modificado
     */
    private boolean canTurnoBeModified(Turno turno) {
        if (turno == null) {
            return false;
        }

        // No se pueden modificar turnos cancelados o completados
        return turno.getEstado() != EstadoTurno.CANCELADO &&
                turno.getEstado() != EstadoTurno.COMPLETO;
    }

    /**
     * Valida si se requiere motivo para una transición específica
     */
    private boolean requiresReason(EstadoTurno newState) {
        // Cancelaciones y reagendamientos siempre requieren motivo
        return newState == EstadoTurno.CANCELADO || newState == EstadoTurno.REAGENDADO;
    }

    /**
     * Valida que el usuario tenga permisos para cancelar turnos
     */
    private void validarPermisosCancelacion(String performedBy) {
        if (performedBy == null || performedBy.trim().isEmpty()) {
            throw new IllegalArgumentException("Usuario requerido para cancelar turno");
        }

    }

    /**
     * Valida permisos de usuario (simplificado - en producción integrar con sistema
     * de autenticación)
     */
    private boolean hasPermissionToModifyTurno(String userId) {
        // Por ahora, permitir a todos los usuarios autenticados
        // En producción, verificar roles específicos como ADMIN, STAFF_MEDICO, etc.
        return userId != null && !userId.trim().isEmpty();
    }

    /**
     * Obtiene los estados válidos para una transición desde el estado actual
     */
    private List<EstadoTurno> getValidNextStates(EstadoTurno currentState) {
        return VALID_TRANSITIONS.getOrDefault(currentState, Arrays.asList());
    }

    /**
     * Valida motivo de cancelación
     */
    private boolean isValidCancellationReason(String reason) {
        return reason != null && reason.trim().length() >= 5; // Mínimo 5 caracteres
    }

    /**
     * Determina el rol del usuario basado en el nombre de usuario
     * En un sistema real, esto se obtendría del token JWT o la base de datos de
     * usuarios
     */
    /**
     * Determina el rol real del usuario a partir de su email, consultando la base
     * de datos.
     * Si no se encuentra, usa heurística por nombre/email como fallback.
     */
    private String determinarRolUsuario(String performedBy) {

        if (performedBy == null || performedBy.trim().isEmpty()) {
            return "DESCONOCIDO";
        }

        String email = performedBy.trim().toLowerCase();

        // Buscar en PACIENTE
        if (pacienteRepository != null && pacienteRepository.existsByEmail(email)) {
            return "PACIENTE";
        }

        // Buscar en OPERADOR
        if (operadorRepository.findByEmail(email).isPresent()) {
            return "OPERADOR";
        }

        // Buscar en USER (admins)
        if (userRepository.existsByEmail(email)) {
            return "ADMINISTRADOR";
        }

        return "DESCONOCIDO";

    }

    /**
     * Verifica si el paciente tiene medios de contacto válidos para recibir
     * notificaciones
     * Actualmente solo verifica email verificado
     */
    private boolean tieneMediosContactoValidos(Paciente paciente) {
        if (paciente == null) {
            return false;
        }

        // Verificar si tiene email
        if (paciente.getEmail() == null || paciente.getEmail().trim().isEmpty()) {
            return false;
        }

        // Verificar si el email está verificado buscando el usuario correspondiente
        try {
            Optional<User> userOpt = userService.findByEmail(paciente.getEmail());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                return user.getEmailVerified() != null && user.getEmailVerified();
            }
            // Si no se encuentra el usuario, asumir que el email no está verificado
            return false;
        } catch (Exception e) {
            System.err.println(
                    "Error al verificar medios de contacto para paciente " + paciente.getId() + ": " + e.getMessage());
            return false;
        }
    }

    /**
     * Obtiene información detallada sobre los medios de contacto del paciente
     */
    private String obtenerEstadoMediosContacto(Paciente paciente) {
        if (paciente == null) {
            return "Paciente no encontrado";
        }

        StringBuilder estado = new StringBuilder();

        // Información sobre email
        if (paciente.getEmail() == null || paciente.getEmail().trim().isEmpty()) {
            estado.append("Sin email registrado. ");
        } else {
            try {
                Optional<User> userOpt = userService.findByEmail(paciente.getEmail());
                if (userOpt.isPresent()) {
                    User user = userOpt.get();
                    if (user.getEmailVerified() != null && user.getEmailVerified()) {
                        estado.append("Email verificado: ").append(paciente.getEmail()).append(". ");
                    } else {
                        estado.append("Email NO verificado: ").append(paciente.getEmail()).append(". ");
                    }
                } else {
                    estado.append("Email registrado pero sin verificar: ").append(paciente.getEmail()).append(". ");
                }
            } catch (Exception e) {
                estado.append("Error al verificar email: ").append(paciente.getEmail()).append(". ");
            }
        }

        // Información sobre teléfono (futuro)
        if (paciente.getTelefono() == null || paciente.getTelefono().trim().isEmpty()) {
            estado.append("Sin teléfono registrado.");
        } else {
            estado.append("Teléfono registrado: ").append(paciente.getTelefono())
                    .append(" (notificaciones no implementadas).");
        }

        return estado.toString().trim();
    }

    /**
     * Versión interna de validación de medios de contacto que trabaja directamente
     * con un Turno
     */
    private ValidacionContactoDTO validarMediosContactoInterno(Turno turno) {
        Paciente paciente = turno.getPaciente();

        if (paciente == null) {
            return ValidacionContactoDTO.conAdvertencia(
                    "Advertencia: El turno no tiene un paciente asignado",
                    "Sin paciente asignado al turno",
                    null, null);
        }

        boolean tieneContactoValido = tieneMediosContactoValidos(paciente);
        String estadoDetallado = obtenerEstadoMediosContacto(paciente);

        if (tieneContactoValido) {
            return ValidacionContactoDTO.conMediosValidos(
                    estadoDetallado,
                    paciente.getEmail(),
                    paciente.getTelefono());
        } else {
            String mensaje = "⚠️ Advertencia: El paciente no tiene medios de contacto válidos para recibir la notificación de cancelación. "
                    +
                    "Es posible que no se entere de la cancelación del turno.";
            return ValidacionContactoDTO.conAdvertencia(
                    mensaje,
                    estadoDetallado,
                    paciente.getEmail(),
                    paciente.getTelefono());
        }
    }

    /**
     * Valida motivo de reagendamiento
     */
    private boolean isValidReschedulingReason(String reason) {
        return reason != null && reason.trim().length() >= 5; // Mínimo 5 caracteres
    }

    /**
     * Valida y limpia strings eliminando espacios y convirtiendo vacíos a null
     */
    private String cleanAndValidateString(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }

    /**
     * Valida un campo de fecha y lo convierte a LocalDate si es válido
     * Si hay error, retorna null y registra el problema
     */
    private LocalDate validateDate(LocalDate date, String fieldName) {
        if (date == null) {
            return null;
        }

        try {
            // Si la fecha ya es LocalDate, solo validamos que sea razonable
            LocalDate now = LocalDate.now();
            LocalDate minDate = now.minusYears(2); // No más de 2 años en el pasado
            LocalDate maxDate = now.plusYears(2); // No más de 2 años en el futuro

            if (date.isBefore(minDate)) {
                System.err.println("⚠️  WARNING: " + fieldName + " (" + date
                        + ") es demasiado antigua. Usando fecha mínima: " + minDate);
                return minDate;
            }

            if (date.isAfter(maxDate)) {
                System.err.println("⚠️  WARNING: " + fieldName + " (" + date
                        + ") es demasiado futura. Usando fecha máxima: " + maxDate);
                return maxDate;
            }

            return date;

        } catch (Exception e) {
            System.err.println("❌ ERROR: No se pudo validar la fecha " + fieldName + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Extrae todos los datos necesarios de la cancelación de un turno
     * para uso en plantillas de notificación y auditoría
     */
    private CancelacionDataDTO extraerDatosCancelacion(Turno turno, String motivo, String performedBy) {
        try {
            CancelacionDataDTO cancelacionData = new CancelacionDataDTO();

            // Información básica del turno
            cancelacionData.setTurnoId(turno.getId().longValue());
            cancelacionData.setFechaTurno(turno.getFecha());
            cancelacionData.setHoraTurno(turno.getHoraInicio());
            cancelacionData.setRazonCancelacion(motivo);

            // Información del centro médico y consultorio
            if (turno.getConsultorio() != null) {
                cancelacionData.setConsultorio(turno.getConsultorio().getNombre());

                if (turno.getConsultorio().getCentroAtencion() != null) {
                    cancelacionData.setCentroMedico(turno.getConsultorio().getCentroAtencion().getNombre());
                } else {
                    cancelacionData.setCentroMedico("Centro no disponible");
                }
            } else {
                cancelacionData.setConsultorio("Consultorio no disponible");
                cancelacionData.setCentroMedico("Centro no disponible");
            }

            // Información del médico y especialidad
            if (turno.getStaffMedico() != null) {
                if (turno.getStaffMedico().getEspecialidad() != null) {
                    cancelacionData.setEspecialidad(turno.getStaffMedico().getEspecialidad().getNombre());
                } else {
                    cancelacionData.setEspecialidad("Especialidad no disponible");
                }

                if (turno.getStaffMedico().getMedico() != null) {
                    String nombreMedico = turno.getStaffMedico().getMedico().getNombre() + " " +
                            turno.getStaffMedico().getMedico().getApellido();
                    cancelacionData.setMedico(nombreMedico);
                } else {
                    cancelacionData.setMedico("Médico no disponible");
                }
            } else {
                cancelacionData.setEspecialidad("Especialidad no disponible");
                cancelacionData.setMedico("Médico no disponible");
            }

            // Información del paciente
            if (turno.getPaciente() != null) {
                cancelacionData.setPacienteId(turno.getPaciente().getId().longValue());
                cancelacionData.setPacienteNombre(turno.getPaciente().getNombre());
                cancelacionData.setPacienteApellido(turno.getPaciente().getApellido());
                cancelacionData.setPacienteEmail(turno.getPaciente().getEmail());
                cancelacionData.setPacienteTelefono(turno.getPaciente().getTelefono());
            } else {
                cancelacionData.setPacienteId(null);
                cancelacionData.setPacienteNombre("Paciente no disponible");
                cancelacionData.setPacienteApellido("");
                cancelacionData.setPacienteEmail("");
                cancelacionData.setPacienteTelefono("");
            }

            // Información de auditoría
            cancelacionData.setCanceladoPor(performedBy);
            cancelacionData.setRolCancelacion(determinarRolUsuario(performedBy));

            return cancelacionData;

        } catch (Exception e) {
            System.err.println("Error al extraer datos de cancelación: " + e.getMessage());
            e.printStackTrace();

            // Retornar un DTO básico en caso de error
            CancelacionDataDTO errorData = new CancelacionDataDTO();
            errorData.setTurnoId(turno.getId().longValue());
            errorData.setRazonCancelacion(motivo);
            errorData.setCanceladoPor(performedBy);
            errorData.setRolCancelacion("ERROR_EXTRACTION");
            return errorData;
        }
    }

    /**
     * Envía notificación por email de cancelación de turno al paciente
     * Solo se envía si el paciente tiene email verificado
     */
    private void enviarNotificacionCancelacionEmail(Turno turno, CancelacionDataDTO cancelacionData,
            ValidacionContactoDTO validacionContacto, String performedBy) {
        try {
            // Solo enviar email si el paciente tiene email verificado
            if (!validacionContacto.isPuedeRecibirEmail()) {
                System.out.println("📧 No se envía email de cancelación: paciente sin email verificado");
                // Registrar auditoría de notificación no enviada por falta de email verificado
                registrarAuditoriaNotificacion(turno, "EMAIL", "NOT_SENT",
                        "Email no enviado: paciente sin email verificado", performedBy);
                return;
            }

            // Verificar que tengamos email del paciente
            if (cancelacionData.getPacienteEmail() == null || cancelacionData.getPacienteEmail().trim().isEmpty()) {
                System.out.println("📧 No se envía email de cancelación: paciente sin email registrado");
                // Registrar auditoría de notificación no enviada por falta de email
                registrarAuditoriaNotificacion(turno, "EMAIL", "NOT_SENT",
                        "Email no enviado: paciente sin email registrado", performedBy);
                return;
            }

            String patientEmail = cancelacionData.getPacienteEmail();
            String patientName = cancelacionData.getPacienteNombreCompleto();

            // Construir detalles de la cancelación para el email
            String cancellationDetails = construirDetallesCancelacionEmail(cancelacionData);

            // Obtener IDs necesarios para el deep link
            Integer pacienteId = turno.getPaciente() != null ? turno.getPaciente().getId() : null;
            Integer turnoId = turno.getId();

            // Enviar email de forma asíncrona con deep link
            // El EmailService generará automáticamente el deep link token
            emailService.sendAppointmentCancellationEmail(
                    patientEmail,
                    patientName,
                    cancellationDetails,
                    pacienteId,
                    turnoId);

            System.out
                    .println("📧 Email de cancelación enviado a: " + patientEmail + " para turno ID: " + turno.getId());

            // Registrar auditoría de notificación email exitosa
            registrarAuditoriaNotificacion(turno, "EMAIL", "SUCCESS",
                    "Email de cancelación enviado exitosamente a " + patientEmail, performedBy);

        } catch (Exception e) {
            // Registrar auditoría de notificación email fallida
            registrarAuditoriaNotificacion(turno, "EMAIL", "FAIL",
                    "Error al enviar email de cancelación: " + e.getMessage(), performedBy);

            // Log error pero no fallar la operación principal
            System.err.println(
                    "❌ Error al enviar email de cancelación para turno ID " + turno.getId() + ": " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Construye los detalles de la cancelación formateados para el email
     */
    private String construirDetallesCancelacionEmail(CancelacionDataDTO cancelacionData) {
        StringBuilder detalles = new StringBuilder();

        detalles.append("<p><strong>Fecha y Hora del Turno:</strong> ").append(cancelacionData.getFechaHoraFormateada())
                .append("</p>");
        detalles.append("<p><strong>Centro Médico:</strong> ").append(cancelacionData.getCentroMedico()).append("</p>");
        detalles.append("<p><strong>Consultorio:</strong> ").append(cancelacionData.getConsultorio()).append("</p>");
        detalles.append("<p><strong>Especialidad:</strong> ").append(cancelacionData.getEspecialidad()).append("</p>");
        detalles.append("<p><strong>Profesional:</strong> ").append(cancelacionData.getMedico()).append("</p>");
        detalles.append("<p><strong>Razón de la Cancelación:</strong> ").append(cancelacionData.getRazonCancelacion())
                .append("</p>");
        detalles.append("<p><strong>Cancelado por:</strong> ").append(cancelacionData.getCanceladoPor()).append(" (")
                .append(cancelacionData.getRolCancelacion()).append(")</p>");

        return detalles.toString();
    }

    /**
     * Registra auditoría para el envío de notificaciones de cancelación de turno
     */
    private void registrarAuditoriaNotificacion(Turno turno, String notificationChannel, String status, String message,
            String performedBy) {
        try {
            System.out.println("🔍 DEBUG: performedBy = " + performedBy);

            Long pacienteId = turno.getPaciente() != null ? turno.getPaciente().getId().longValue() : null;

            // Crear objeto con detalles de la notificación
            Map<String, Object> notificationDetails = new HashMap<>();
            notificationDetails.put("turnoId", turno.getId());
            notificationDetails.put("pacienteId", pacienteId);
            notificationDetails.put("pacienteNombre",
                    turno.getPaciente() != null
                            ? turno.getPaciente().getNombre() + " " + turno.getPaciente().getApellido()
                            : "N/A");
            notificationDetails.put("notificationChannel", notificationChannel);
            notificationDetails.put("status", status);
            notificationDetails.put("message", message);

            System.out.println("🔍 DEBUG: Intentando registrar auditoría - Turno: " + turno.getId() + ", Canal: "
                    + notificationChannel + ", Status: " + status);

            // TODO: BUG - El Map notificationDetails no se serializa correctamente en la
            // DB.
            // Actualmente se guarda el hashCode (ej. 29534) en lugar del JSON esperado.
            // Necesario: Cambiar columna newValues en AuditLog a TEXT/JSON y serializar Map
            // a JSON en AuditLogService.logGenericAction
            // Registrar auditoría genérica
            AuditLog auditLog = auditLogService.logGenericAction(
                    AuditLog.EntityTypes.TURNO,
                    turno.getId().longValue(),
                    AuditLog.Actions.CANCELACION_TURNO_NOTIFICACION,
                    performedBy,
                    null, // estadoAnterior
                    null, // estadoNuevo
                    null, // oldValues
                    notificationDetails, // newValues
                    message // reason
            );

            System.out.println(
                    "✅ Auditoría registrada exitosamente - ID: " + (auditLog != null ? auditLog.getId() : "NULL"));

        } catch (Exception e) {
            System.err.println("❌ ERROR al registrar auditoría de notificación: " + e.getMessage());
            e.printStackTrace();
            // No re-lanzar para no afectar la operación principal
        }
    }

    /**
     * Convierte Turno a HistorialTurnoDTO con información completa de auditoría
     */
    private HistorialTurnoDTO toHistorialDTO(Turno turno) {
        HistorialTurnoDTO dto = new HistorialTurnoDTO();

        // Información básica del turno
        dto.setId(turno.getId());
        dto.setFecha(turno.getFecha());
        dto.setHoraInicio(turno.getHoraInicio());
        dto.setHoraFin(turno.getHoraFin());
        dto.setEstado(turno.getEstado().name());
        dto.setObservaciones(turno.getObservaciones());
        dto.setAsistio(turno.getAsistio());
        // dto.setFechaRegistroAsistencia(turno.getFechaRegistroAsistencia());

        // Información del paciente
        if (turno.getPaciente() != null) {
            dto.setPacienteId(turno.getPaciente().getId());
            dto.setNombrePaciente(turno.getPaciente().getNombre());
            dto.setApellidoPaciente(turno.getPaciente().getApellido());
            dto.setDniPaciente(turno.getPaciente().getDni());
            dto.setEmailPaciente(turno.getPaciente().getEmail());
            dto.setTelefonoPaciente(turno.getPaciente().getTelefono());
        }

        // Información del médico
        if (turno.getStaffMedico() != null) {
            dto.setStaffMedicoId(turno.getStaffMedico().getId());
            if (turno.getStaffMedico().getMedico() != null) {
                dto.setStaffMedicoNombre(turno.getStaffMedico().getMedico().getNombre());
                dto.setStaffMedicoApellido(turno.getStaffMedico().getMedico().getApellido());
            }
            if (turno.getStaffMedico().getEspecialidad() != null) {
                dto.setEspecialidadStaffMedico(turno.getStaffMedico().getEspecialidad().getNombre());
            }
        }

        // Información del consultorio y centro
        if (turno.getConsultorio() != null) {
            dto.setConsultorioId(turno.getConsultorio().getId());
            dto.setConsultorioNombre(turno.getConsultorio().getNombre());

            if (turno.getConsultorio().getCentroAtencion() != null) {
                dto.setCentroId(turno.getConsultorio().getCentroAtencion().getId());
                dto.setNombreCentro(turno.getConsultorio().getCentroAtencion().getNombre());
                dto.setDireccionCentro(turno.getConsultorio().getCentroAtencion().getDireccion());
            }
        }

        // Agregar información de auditoría
        try {
            List<AuditLog> auditHistory = auditLogService.getTurnoAuditHistory(turno.getId());
            if (!auditHistory.isEmpty()) {
                // Obtener la última modificación
                AuditLog lastAudit = auditHistory.get(0);
                dto.setUltimoUsuarioModificacion(lastAudit.getPerformedBy());
                dto.setFechaUltimaModificacion(lastAudit.getPerformedAt());
                dto.setMotivoUltimaModificacion(lastAudit.getReason());
                dto.setTotalModificaciones(auditHistory.size());

                // Información de creación (último elemento de la lista)
                AuditLog firstAudit = auditHistory.get(auditHistory.size() - 1);
                dto.setCreadoPor(firstAudit.getPerformedBy());
                dto.setFechaCreacion(firstAudit.getPerformedAt());

                // Buscar información específica de cancelación
                auditHistory.stream()
                        .filter(log -> log.getAction().contains("CANCELACION") ||
                                log.getEstadoNuevo() != null && log.getEstadoNuevo().equals("CANCELADO"))
                        .findFirst()
                        .ifPresent(cancelLog -> {
                            dto.setMotivoCancelacion(cancelLog.getReason());
                            dto.setFechaCancelacion(cancelLog.getPerformedAt());
                            dto.setUsuarioCancelacion(cancelLog.getPerformedBy());
                            dto.setEstadoAnterior(cancelLog.getEstadoAnterior());
                            dto.setFechaCambioEstado(cancelLog.getPerformedAt());
                            dto.setUsuarioCambioEstado(cancelLog.getPerformedBy());
                        });
                // Buscar información específica de reagendamiento
                auditHistory.stream()
                        .filter(log -> log.getAction().contains("REAGENDAMIENTO") ||
                                log.getEstadoNuevo() != null && log.getEstadoNuevo().equals("REAGENDADO"))
                        .findFirst()
                        .ifPresent(reagendaLog -> {
                            dto.setMotivoReagendamiento(reagendaLog.getReason());
                            // Intentar extraer fecha original del oldValues si está disponible
                            if (reagendaLog.getOldValues() != null) {
                                try {
                                    // Aquí podrías parsear oldValues si contiene la fecha original
                                    // Por ahora lo dejamos como null
                                } catch (Exception e) {
                                    System.err.println(
                                            "Error al parsear fecha original de reagendamiento: " + e.getMessage());
                                }
                            }
                        });
            } else {
                dto.setTotalModificaciones(0);
            }
        } catch (Exception e) {
            System.err.println(
                    "Error al obtener auditoría para historial de turno " + turno.getId() + ": " + e.getMessage());
            dto.setTotalModificaciones(0);
        }

        return dto;
    }

    /**
     * Obtiene el historial completo de turnos de un paciente
     */
    public List<HistorialTurnoDTO> getHistorialTurnosByPaciente(Integer pacienteId) {
        List<Turno> turnos = repository.findByPaciente_Id(pacienteId);
        return turnos.stream()
                .map(this::toHistorialDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene el historial completo de turnos de un paciente con paginación
     */
    public Page<HistorialTurnoDTO> getHistorialTurnosByPacientePaged(Integer pacienteId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "fecha"));
        Page<Turno> turnosPage = repository.findByPaciente_Id(pacienteId, pageRequest);
        return turnosPage.map(this::toHistorialDTO);
    }

    /**
     * Obtiene el historial de un turno específico con toda su información de
     * auditoría
     */
    public HistorialTurnoDTO getHistorialTurnoById(Integer turnoId) {
        Optional<Turno> turnoOpt = repository.findById(turnoId);
        if (turnoOpt.isEmpty()) {
            throw new IllegalArgumentException("Turno no encontrado con ID: " + turnoId);
        }
        return toHistorialDTO(turnoOpt.get());
    }

    /**
     * Actualiza las observaciones de un turno
     */
    @Transactional
    public TurnoDTO actualizarObservaciones(Integer turnoId, String observaciones, String performedBy) {
        Optional<Turno> turnoOpt = repository.findById(turnoId);
        if (turnoOpt.isEmpty()) {
            throw new IllegalArgumentException("Turno no encontrado con ID: " + turnoId);
        }

        Turno turno = turnoOpt.get();
        String observacionesAnteriores = turno.getObservaciones();

        // Validar que el turno puede ser modificado
        if (!canTurnoBeModified(turno)) {
            throw new IllegalStateException("No se pueden modificar observaciones de un turno cancelado o completado");
        }

        turno.setObservaciones(observaciones);
        Turno savedTurno = repository.save(turno);

        // Registrar auditoría del cambio de observaciones
        try {
            Map<String, Object> oldValues = new HashMap<>();
            oldValues.put("observaciones", observacionesAnteriores);

            Map<String, Object> newValues = new HashMap<>();
            newValues.put("observaciones", observaciones);

            auditLogService.logGenericAction(
                    AuditLog.EntityTypes.TURNO,
                    turno.getId().longValue(),
                    AuditLog.Actions.UPDATE,
                    performedBy,
                    null,
                    null,
                    oldValues,
                    newValues,
                    "Actualización de observaciones");
        } catch (Exception e) {
            System.err.println("Error al registrar auditoría de observaciones: " + e.getMessage());
        }

        return toDTO(savedTurno);
    }

    // ===============================
    // MÉTODOS PARA HISTORIAL FILTRADO POR PACIENTE
    // ===============================

    /**
     * Obtiene el historial de turnos de un paciente con filtros avanzados
     * 
     * @param pacienteId ID del paciente
     * @param estado     Estado del turno (opcional)
     * @param fechaDesde Fecha desde (opcional)
     * @param fechaHasta Fecha hasta (opcional)
     * @param page       Número de página
     * @param size       Tamaño de página
     * @param sortBy     Campo por el que ordenar (por defecto: "fecha")
     * @param sortDir    Dirección del ordenamiento (ASC/DESC, por defecto: DESC)
     * @return Página de HistorialTurnoDTO con los resultados filtrados
     */
    public Page<HistorialTurnoDTO> getHistorialPacienteFiltrado(
            Integer pacienteId,
            String estado,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            int page,
            int size,
            String sortBy,
            String sortDir) {

        System.out.println("🔍 DEBUG: Obteniendo historial filtrado para paciente ID: " + pacienteId);
        System.out.println("   - Estado recibido: [" + estado + "]");
        System.out.println("   - Fecha desde: " + fechaDesde);
        System.out.println("   - Fecha hasta: " + fechaHasta);

        // Validar paciente
        if (!pacienteRepository.existsById(pacienteId)) {
            throw new IllegalArgumentException("Paciente no encontrado con ID: " + pacienteId);
        }

        // Configurar ordenamiento
        Sort.Direction direction = "ASC".equalsIgnoreCase(sortDir) ? Sort.Direction.ASC : Sort.Direction.DESC;
        String sortField = sortBy != null && !sortBy.trim().isEmpty() ? sortBy : "fecha";
        Sort sort = Sort.by(direction, sortField);
        PageRequest pageable = PageRequest.of(page, size, sort);

        // 🔥 CORRECCIÓN: Parsear estado correctamente
        EstadoTurno estadoEnum = null;
        if (estado != null && !estado.trim().isEmpty() && !"TODO".equalsIgnoreCase(estado.trim())) {
            try {
                estadoEnum = EstadoTurno.valueOf(estado.trim().toUpperCase());
                System.out.println("   - ✅ Estado parseado correctamente: " + estadoEnum);
            } catch (IllegalArgumentException e) {
                System.err.println("   - ⚠️ WARN: Estado inválido: [" + estado + "], se ignorará el filtro");
                estadoEnum = null;
            }
        } else {
            System.out.println("   - ℹ️ Sin filtro de estado (mostrando todos)");
        }

        // Construir especificación base: SIEMPRE filtrar por paciente
        Specification<Turno> spec = Specification.where(TurnoRepository.hasPacienteId(pacienteId));

        // 🔥 CORRECCIÓN: Aplicar filtro de estado SOLO si estadoEnum no es null
        if (estadoEnum != null) {
            System.out.println("   - 🎯 Aplicando filtro de estado: " + estadoEnum);
            spec = spec.and(TurnoRepository.hasEstado(estadoEnum));
        }

        // Aplicar filtros de fecha
        if (fechaDesde != null) {
            spec = spec.and(TurnoRepository.hasFechaDesde(fechaDesde));
            System.out.println("   - 📅 Filtro fecha desde aplicado: " + fechaDesde);
        }

        if (fechaHasta != null) {
            spec = spec.and(TurnoRepository.hasFechaHasta(fechaHasta));
            System.out.println("   - 📅 Filtro fecha hasta aplicado: " + fechaHasta);
        }

        // Ejecutar consulta
        Page<Turno> turnosPage = repository.findAll(spec, pageable);

        System.out.println("✅ DEBUG: Query ejecutada - " + turnosPage.getTotalElements() +
                " turnos encontrados (página " + (page + 1) + " de " + turnosPage.getTotalPages() + ")");

        return turnosPage.map(this::toHistorialDTO);
    }

    /**
     * Obtiene el historial completo de un paciente sin filtros (versión
     * simplificada)
     * 
     * @param pacienteId ID del paciente
     * @param page       Número de página
     * @param size       Tamaño de página
     * @return Página de HistorialTurnoDTO
     */
    public Page<HistorialTurnoDTO> getHistorialPaciente(Integer pacienteId, int page, int size) {
        return getHistorialPacienteFiltrado(pacienteId, null, null, null, page, size, "fecha", "DESC");
    }

    /**
     * Obtiene estadísticas del historial de un paciente
     * 
     * @param pacienteId ID del paciente
     * @return Map con estadísticas del historial
     */
    public Map<String, Object> getEstadisticasHistorialPaciente(Integer pacienteId) {
        System.out.println("📊 DEBUG: Obteniendo estadísticas de historial para paciente ID: " + pacienteId);

        // Validar paciente
        if (!pacienteRepository.existsById(pacienteId)) {
            throw new IllegalArgumentException("Paciente no encontrado con ID: " + pacienteId);
        }

        Map<String, Object> estadisticas = new HashMap<>();

        try {
            // Obtener todos los turnos del paciente
            List<Turno> todosTurnos = repository.findByPaciente_Id(pacienteId);

            // Contar por estado
            Map<String, Long> turnosPorEstado = todosTurnos.stream()
                    .collect(Collectors.groupingBy(
                            t -> t.getEstado().name(),
                            Collectors.counting()));

            estadisticas.put("totalTurnos", todosTurnos.size());
            estadisticas.put("turnosPorEstado", turnosPorEstado);
            estadisticas.put("turnosProgramados", turnosPorEstado.getOrDefault("PROGRAMADO", 0L));
            estadisticas.put("turnosConfirmados", turnosPorEstado.getOrDefault("CONFIRMADO", 0L));
            estadisticas.put("turnosCompletados", turnosPorEstado.getOrDefault("COMPLETO", 0L));
            estadisticas.put("turnosCancelados", turnosPorEstado.getOrDefault("CANCELADO", 0L));
            estadisticas.put("turnosReagendados", turnosPorEstado.getOrDefault("REAGENDADO", 0L));

            // Obtener fecha del primer y último turno
            if (!todosTurnos.isEmpty()) {
                LocalDate primerTurno = todosTurnos.stream()
                        .map(Turno::getFecha)
                        .min(LocalDate::compareTo)
                        .orElse(null);

                LocalDate ultimoTurno = todosTurnos.stream()
                        .map(Turno::getFecha)
                        .max(LocalDate::compareTo)
                        .orElse(null);

                estadisticas.put("primerTurno", primerTurno);
                estadisticas.put("ultimoTurno", ultimoTurno);
            }

            // Contar turnos futuros y pasados
            LocalDate hoy = LocalDate.now();
            long turnosFuturos = todosTurnos.stream()
                    .filter(t -> t.getFecha().isAfter(hoy))
                    .count();
            long turnosPasados = todosTurnos.stream()
                    .filter(t -> t.getFecha().isBefore(hoy) || t.getFecha().equals(hoy))
                    .count();

            estadisticas.put("turnosFuturos", turnosFuturos);
            estadisticas.put("turnosPasados", turnosPasados);

            // Especialidades más frecuentes
            Map<String, Long> especialidadesFrecuentes = todosTurnos.stream()
                    .filter(t -> t.getStaffMedico() != null &&
                            t.getStaffMedico().getEspecialidad() != null)
                    .collect(Collectors.groupingBy(
                            t -> t.getStaffMedico().getEspecialidad().getNombre(),
                            Collectors.counting()));

            estadisticas.put("especialidadesFrecuentes", especialidadesFrecuentes);

            System.out.println("✅ DEBUG: Estadísticas calculadas: " + estadisticas);

        } catch (Exception e) {
            System.err.println("❌ ERROR: Error al calcular estadísticas: " + e.getMessage());
            estadisticas.put("error", "Error al calcular estadísticas: " + e.getMessage());
        }

        return estadisticas;
    }

    /**
     * Obtiene el resumen de turnos próximos de un paciente
     * 
     * @param pacienteId   ID del paciente
     * @param diasAdelante Cantidad de días hacia adelante (por defecto 30)
     * @return Lista de turnos próximos como HistorialTurnoDTO
     */
    public List<HistorialTurnoDTO> getTurnosProximosPaciente(Integer pacienteId, Integer diasAdelante) {
        System.out.println("📅 DEBUG: Obteniendo turnos próximos para paciente ID: " + pacienteId);

        // Validar paciente
        if (!pacienteRepository.existsById(pacienteId)) {
            throw new IllegalArgumentException("Paciente no encontrado con ID: " + pacienteId);
        }

        LocalDate hoy = LocalDate.now();
        LocalDate fechaLimite = hoy.plusDays(diasAdelante != null ? diasAdelante : 30);

        // Crear especificación para turnos futuros del paciente
        Specification<Turno> spec = Specification.where(TurnoRepository.hasPacienteId(pacienteId))
                .and(TurnoRepository.hasFechaDesde(hoy))
                .and(TurnoRepository.hasFechaHasta(fechaLimite))
                .and(TurnoRepository.hasEstado(EstadoTurno.PROGRAMADO)
                        .or(TurnoRepository.hasEstado(EstadoTurno.CONFIRMADO))
                        .or(TurnoRepository.hasEstado(EstadoTurno.REAGENDADO)));

        // Ordenar por fecha ascendente
        Sort sort = Sort.by(Sort.Direction.ASC, "fecha", "horaInicio");

        List<Turno> turnosProximos = repository.findAll(spec, sort);

        System.out.println("✅ DEBUG: " + turnosProximos.size() + " turnos próximos encontrados");

        return turnosProximos.stream()
                .map(this::toHistorialDTO)
                .collect(Collectors.toList());
    }

    /**
     * Obtiene turnos cancelados de un paciente con detalles de cancelación
     * 
     * @param pacienteId ID del paciente
     * @param page       Número de página
     * @param size       Tamaño de página
     * @return Página de HistorialTurnoDTO con turnos cancelados
     */
    public Page<HistorialTurnoDTO> getTurnosCanceladosPaciente(Integer pacienteId, int page, int size) {
        System.out.println("🚫 DEBUG: Obteniendo turnos cancelados para paciente ID: " + pacienteId);

        return getHistorialPacienteFiltrado(
                pacienteId,
                "CANCELADO",
                null,
                null,
                page,
                size,
                "fecha",
                "DESC");
    }

    /**
     * Verifica si un paciente tiene turnos pendientes (PROGRAMADO o CONFIRMADO)
     * 
     * @param pacienteId ID del paciente
     * @return true si tiene turnos pendientes, false en caso contrario
     */
    public boolean tieneTurnosPendientes(Integer pacienteId) {
        LocalDate hoy = LocalDate.now();

        Specification<Turno> spec = Specification.where(TurnoRepository.hasPacienteId(pacienteId))
                .and(TurnoRepository.hasFechaDesde(hoy))
                .and(TurnoRepository.hasEstado(EstadoTurno.PROGRAMADO)
                        .or(TurnoRepository.hasEstado(EstadoTurno.CONFIRMADO))
                        .or(TurnoRepository.hasEstado(EstadoTurno.REAGENDADO)));

        long count = repository.count(spec);

        System.out.println("🔍 DEBUG: Paciente " + pacienteId + " tiene " + count + " turnos pendientes");

        return count > 0;
    }

    /**
     * Exporta el historial de un paciente a un formato específico
     * 
     * @param pacienteId ID del paciente
     * @param estado     Estado del turno (opcional)
     * @param fechaDesde Fecha desde (opcional)
     * @param fechaHasta Fecha hasta (opcional)
     * @return Lista completa de HistorialTurnoDTO para exportación
     */
    public List<HistorialTurnoDTO> exportarHistorialPaciente(
            Integer pacienteId,
            String estado,
            LocalDate fechaDesde,
            LocalDate fechaHasta) {

        System.out.println("📤 DEBUG: Exportando historial para paciente ID: " + pacienteId);

        // Validar paciente
        if (!pacienteRepository.existsById(pacienteId)) {
            throw new IllegalArgumentException("Paciente no encontrado con ID: " + pacienteId);
        }

        // Parsear estado si viene como string
        EstadoTurno estadoEnum = null;
        if (estado != null && !estado.trim().isEmpty()) {
            try {
                estadoEnum = EstadoTurno.valueOf(estado.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                System.err.println("⚠️ WARN: Estado inválido para exportación: " + estado);
            }
        }

        // Construir especificación con filtros
        Specification<Turno> spec = Specification.where(TurnoRepository.hasPacienteId(pacienteId));

        if (estadoEnum != null) {
            spec = spec.and(TurnoRepository.hasEstado(estadoEnum));
        }

        if (fechaDesde != null) {
            spec = spec.and(TurnoRepository.hasFechaDesde(fechaDesde));
        }

        if (fechaHasta != null) {
            spec = spec.and(TurnoRepository.hasFechaHasta(fechaHasta));
        }

        // Ordenar por fecha descendente para exportación
        Sort sort = Sort.by(Sort.Direction.DESC, "fecha", "horaInicio");

        List<Turno> turnos = repository.findAll(spec, sort);

        System.out.println("✅ DEBUG: Exportando " + turnos.size() + " turnos");

        return turnos.stream()
                .map(this::toHistorialDTO)
                .collect(Collectors.toList());
    }

}
