package unpsjb.labprog.backend.business.service;

import java.time.LocalDate;
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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.business.repository.PacienteRepository;
import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.dto.TurnoFilterDTO;
import unpsjb.labprog.backend.model.AuditLog;
import unpsjb.labprog.backend.model.Consultorio;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Paciente;
import unpsjb.labprog.backend.model.StaffMedico;
import unpsjb.labprog.backend.model.Turno;

@Service
public class TurnoService {

    @Autowired
    private TurnoRepository repository;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private StaffMedicoRepository staffMedicoRepository;

    @Autowired
    private ConsultorioRepository consultorioRepository;

    @Autowired
    private AuditLogService auditLogService;

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
        try {
            Turno turno = toEntity(dto); // Convertir DTO a entidad
            validarTurno(turno); // Validar el turno
            
            boolean isNewTurno = turno.getId() == null;
            EstadoTurno previousStatus = null;
            
            if (!isNewTurno) {
                // Es una actualización, obtener el estado anterior
                Optional<Turno> existingTurno = repository.findById(turno.getId());
                if (existingTurno.isPresent()) {
                    previousStatus = existingTurno.get().getEstado();
                }
            }
            
            Turno saved = repository.save(turno); // Guardar el turno
            
            // Registrar auditoría
            if (isNewTurno) {
                System.out.println("🔍 DEBUG: Creando log de auditoría para nuevo turno ID: " + saved.getId() + ", Usuario: " + performedBy);
                auditLogService.logTurnoCreated(saved, performedBy);
                System.out.println("✅ DEBUG: Log de auditoría creado exitosamente");
            } else if (previousStatus != null && !previousStatus.equals(saved.getEstado())) {
                System.out.println("🔍 DEBUG: Creando log de cambio de estado para turno ID: " + saved.getId());
                auditLogService.logStatusChange(saved, previousStatus.name(), performedBy, "Actualización de turno");
                System.out.println("✅ DEBUG: Log de cambio de estado creado exitosamente");
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
            auditLogService.logTurnoDeleted(turno, performedBy, motivo);
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
        
        // Validaciones de negocio para cancelación
        validarCancelacion(turno);
        
        // Validar que se proporcione un motivo para la cancelación
        if (motivo == null || motivo.trim().isEmpty()) {
            throw new IllegalArgumentException("El motivo de cancelación es obligatorio");
        }
        
        turno.setEstado(EstadoTurno.CANCELADO);
        Turno savedTurno = repository.save(turno);
        
        // Registrar auditoría de cancelación
        auditLogService.logTurnoCanceled(savedTurno, previousStatus.name(), performedBy, motivo);
        
        return toDTO(savedTurno);
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
        
        turno.setEstado(EstadoTurno.CONFIRMADO);
        Turno savedTurno = repository.save(turno);
        
        // Registrar auditoría de confirmación
        auditLogService.logTurnoConfirmed(savedTurno, previousStatus.name(), performedBy);
        
        return toDTO(savedTurno);
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
        
        // Capturar los valores antiguos para auditoría
        Map<String, Object> oldValues = new HashMap<>();
        oldValues.put("fecha", turno.getFecha());
        oldValues.put("horaInicio", turno.getHoraInicio());
        oldValues.put("horaFin", turno.getHoraFin());
        oldValues.put("estado", turno.getEstado());
        
        // Validaciones de negocio para reagendamiento
        validarReagendamiento(turno);
        
        // Actualizar datos del turno
        turno.setFecha(nuevosDatos.getFecha());
        turno.setHoraInicio(nuevosDatos.getHoraInicio());
        turno.setHoraFin(nuevosDatos.getHoraFin());
        turno.setEstado(EstadoTurno.REAGENDADO);
        
        Turno savedTurno = repository.save(turno);
        
        // Registrar auditoría de reagendamiento
        auditLogService.logTurnoRescheduled(savedTurno, previousStatus.name(), oldValues, performedBy, motivo);
        
        return toDTO(savedTurno);
    }

    // Métodos de validación de reglas de negocio mejorados con auditoría
    private void validarCancelacion(Turno turno) {
        // Un turno cancelado no puede ser reactivado
        if (turno.getEstado() == EstadoTurno.CANCELADO) {
            throw new IllegalStateException("No se puede cancelar un turno que ya está cancelado");
        }
        
        // No se pueden cancelar turnos el mismo día de la cita sin justificación válida
        LocalDate hoy = LocalDate.now();
        if (turno.getFecha().equals(hoy)) {
            throw new IllegalStateException("No se pueden cancelar turnos el mismo día de la cita");
        }
        
        // Validar transiciones de estado válidas
        if (!isValidStateTransition(turno.getEstado(), EstadoTurno.CANCELADO)) {
            throw new IllegalStateException("Transición de estado inválida de " + 
                                           turno.getEstado() + " a CANCELADO");
        }
    }

    private void validarConfirmacion(Turno turno) {
        // Solo se pueden confirmar turnos en estado PROGRAMADO
        if (turno.getEstado() != EstadoTurno.PROGRAMADO) {
            throw new IllegalStateException("Solo se pueden confirmar turnos en estado PROGRAMADO. Estado actual: " + turno.getEstado());
        }
        
        // Validar transiciones de estado válidas
        if (!isValidStateTransition(turno.getEstado(), EstadoTurno.CONFIRMADO)) {
            throw new IllegalStateException("Transición de estado inválida de " + 
                                           turno.getEstado() + " a CONFIRMADO");
        }
    }

    private void validarReagendamiento(Turno turno) {
        // Un turno cancelado no puede ser reagendado
        if (turno.getEstado() == EstadoTurno.CANCELADO) {
            throw new IllegalStateException("No se puede reagendar un turno cancelado");
        }
        
        // Solo se pueden reagendar turnos en estado PROGRAMADO o CONFIRMADO
        if (turno.getEstado() != EstadoTurno.PROGRAMADO && turno.getEstado() != EstadoTurno.CONFIRMADO) {
            throw new IllegalStateException("Solo se pueden reagendar turnos en estado PROGRAMADO o CONFIRMADO. Estado actual: " + turno.getEstado());
        }
        
        // Validar transiciones de estado válidas
        if (!isValidStateTransition(turno.getEstado(), EstadoTurno.REAGENDADO)) {
            throw new IllegalStateException("Transición de estado inválida de " + 
                                           turno.getEstado() + " a REAGENDADO");
        }
    }

    /**
     * Valida si una transición de estado es permitida según las reglas de negocio
     */
    private boolean isValidStateTransition(EstadoTurno fromState, EstadoTurno toState) {
        if (fromState == null || toState == null) {
            return false;
        }

        switch (fromState) {
            case PROGRAMADO:
                // Desde PROGRAMADO se puede ir a cualquier estado
                return toState == EstadoTurno.CONFIRMADO || 
                       toState == EstadoTurno.CANCELADO || 
                       toState == EstadoTurno.REAGENDADO;
                       
            case CONFIRMADO:
                // Desde CONFIRMADO solo se puede cancelar o reagendar
                return toState == EstadoTurno.CANCELADO || 
                       toState == EstadoTurno.REAGENDADO;
                       
            case REAGENDADO:
                // Desde REAGENDADO solo se puede cancelar o confirmar
                return toState == EstadoTurno.CANCELADO || 
                       toState == EstadoTurno.CONFIRMADO;
                       
            case CANCELADO:
                // Desde CANCELADO no se puede ir a ningún otro estado
                return false;
                
            default:
                return false;
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
        dto.setStaffMedicoId(turno.getStaffMedico().getId());
        dto.setStaffMedicoNombre(turno.getStaffMedico().getMedico().getNombre());
        dto.setStaffMedicoApellido(turno.getStaffMedico().getMedico().getApellido());
        dto.setEspecialidadStaffMedico(turno.getStaffMedico().getMedico().getEspecialidad().getNombre());

        // Validar si consultorio no es null antes de acceder a sus propiedades
        if (turno.getConsultorio() != null) {
            dto.setConsultorioId(turno.getConsultorio().getId());
            dto.setConsultorioNombre(turno.getConsultorio().getNombre());
            dto.setCentroId(turno.getConsultorio().getCentroAtencion().getId());
            dto.setNombreCentro(turno.getConsultorio().getCentroAtencion().getNombre());
        } else {
            dto.setConsultorioId(null);
            dto.setConsultorioNombre(null);
            dto.setCentroId(null);
            dto.setNombreCentro(null);
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
        // Usar los métodos del repositorio en lugar de CriteriaBuilder
        if (filter.getEstado() != null && !filter.getEstado().isEmpty()) {
            try {
                EstadoTurno estadoEnum = EstadoTurno.valueOf(filter.getEstado().toUpperCase());
                return repository.findByEstado(estadoEnum).stream()
                    .map(this::toDTO)
                    .collect(Collectors.toList());
            } catch (IllegalArgumentException e) {
                // Estado inválido, retornar lista vacía
                return Collections.emptyList();
            }
        }
        
        if (filter.getPacienteId() != null) {
            return repository.findByPaciente_Id(filter.getPacienteId()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        }
        
        if (filter.getStaffMedicoId() != null) {
            return repository.findByStaffMedico_Id(filter.getStaffMedicoId()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        }
        
        if (filter.getFechaExacta() != null) {
            return repository.findByFecha(filter.getFechaExacta()).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
        }
        
        if (filter.getFechaDesde() != null && filter.getFechaHasta() != null) {
            return repository.findByFechaBetween(filter.getFechaDesde(), filter.getFechaHasta()).stream()
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
        EstadoTurno estadoEnum = null;
        if (filter.getEstado() != null && !filter.getEstado().isEmpty()) {
            try {
                estadoEnum = EstadoTurno.valueOf(filter.getEstado().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Si el estado no es válido, no se aplica este filtro
            }
        }
        
        // Crear el objeto Pageable para paginación y ordenamiento
        Sort sort = Sort.by(
            "DESC".equalsIgnoreCase(filter.getSortDirection()) ? 
                Sort.Direction.DESC : Sort.Direction.ASC, 
            filter.getSortBy()
        );
        org.springframework.data.domain.Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), sort);
        
        // Usar el método del repositorio con filtros
        Page<Turno> turnosPage = repository.findByFilters(
            estadoEnum,
            filter.getPacienteId(),
            filter.getStaffMedicoId(),
            filter.getEspecialidadId(),
            filter.getCentroAtencionId(),
            filter.getConsultorioId(),
            filter.getFechaDesde(),
            filter.getFechaHasta(),
            pageable
        );
        
        // Convertir a DTOs con información de auditoría
        return turnosPage.map(this::toDTOWithAuditInfo);
    }
    
    /**
     * Busca turnos para exportación (sin paginación)
     */
    public List<TurnoDTO> findForExport(TurnoFilterDTO filter) {
        EstadoTurno estadoEnum = null;
        if (filter.getEstado() != null && !filter.getEstado().isEmpty()) {
            try {
                estadoEnum = EstadoTurno.valueOf(filter.getEstado().toUpperCase());
            } catch (IllegalArgumentException e) {
                // Si el estado no es válido, no se aplica este filtro
            }
        }
        
        // Usar el método del repositorio para exportación
        List<Turno> turnos = repository.findByFiltersForExport(
            estadoEnum,
            filter.getPacienteId(),
            filter.getStaffMedicoId(),
            filter.getEspecialidadId(),
            filter.getCentroAtencionId(),
            filter.getConsultorioId(),
            filter.getFechaDesde(),
            filter.getFechaHasta()
        );
        
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
        
        // Agregar información de auditoría
        List<AuditLog> auditHistory = auditLogService.getTurnoAuditHistory(turno.getId());
        if (!auditHistory.isEmpty()) {
            // Obtener la última modificación
            AuditLog lastAudit = auditHistory.get(0); // Ya están ordenados por fecha desc
            dto.setUltimoUsuarioModificacion(lastAudit.getPerformedBy());
            dto.setFechaUltimaModificacion(lastAudit.getPerformedAt());
            dto.setMotivoUltimaModificacion(lastAudit.getReason());
            dto.setTotalModificaciones(auditHistory.size());
        } else {
            // Si no hay auditoría, significa que es un turno sin modificaciones
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
            EstadoTurno.CANCELADO
        );
        
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
            pageable
        );
        
        return turnosPage.map(this::toDTOWithAuditInfo);
    }
}
