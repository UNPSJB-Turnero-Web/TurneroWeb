package unpsjb.labprog.backend.business.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import unpsjb.labprog.backend.business.repository.*;
import unpsjb.labprog.backend.dto.ListaEsperaDTO;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.model.*;
import unpsjb.labprog.backend.config.AuditContext;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.OptionalDouble;
import java.util.stream.Collectors;

@Service
public class ListaEsperaService {

    @Autowired
    private ListaEsperaRepository repository;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private AuditLogService auditLogService;

    @Autowired
    private PacienteRepository pacienteRepository;

    @Autowired
    private EspecialidadRepository especialidadRepository;

    @Autowired
    private CentroAtencionRepository centroAtencionRepository;

    @Autowired
    private MedicoRepository medicoRepository;

    @Autowired
    private TurnoRepository turnoRepository;

    /**
     * Obtiene todas las entradas de la lista de espera
     * 
     * @return Lista completa de solicitudes en espera
     */
    // Obtener todas las solicitudes de lista de espera
    public List<ListaEsperaDTO> findAll() {
        return repository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca una entrada específica por ID
     * 
     * @param id Identificador de la entrada
     * @return Optional con la entrada si existe
     */
    // Obtener por ID
    public Optional<ListaEsperaDTO> findById(Long id) {
        return repository.findById(id).map(this::convertToDTO);
    }

    /**
     * Agrega una nueva solicitud a la lista de espera
     * 
     * @param listaEspera Objeto con los datos de la solicitud
     * @return La solicitud guardada con su ID asignado
     */
    @Transactional
    public ListaEsperaDTO save(ListaEsperaDTO dto) {
        // Convertir DTO a entidad
        ListaEspera listaEspera = convertToEntity(dto);

        // Establece la fecha de solicitud automáticamente
        if (listaEspera.getFechaSolicitud() == null) {
            listaEspera.setFechaSolicitud(LocalDateTime.now());
        }

        // Establece el estado inicial si no está definido
        if (listaEspera.getEstado() == null || listaEspera.getEstado().isEmpty()) {
            listaEspera.setEstado("PENDIENTE");
        }

        // Validar la solicitud
        validarSolicitud(listaEspera);

        // Guardar y convertir resultado a DTO
        return convertToDTO(repository.save(listaEspera));
    }

    /**
     * Actualiza una entrada existente en la lista de espera
     * 
     * @param id          Identificador de la entrada a actualizar
     * @param listaEspera Datos actualizados
     * @return La entrada actualizada
     * @throws RuntimeException si no se encuentra la entrada
     */
    @Transactional
    public ListaEsperaDTO update(ListaEsperaDTO dto) {
        // Verificar que existe
        Optional<ListaEspera> existing = repository.findById(dto.getId());
        if (existing.isEmpty()) {
            throw new RuntimeException("Entrada de lista de espera no encontrada con ID: " + dto.getId());
        }

        // Convertir DTO a entidad manteniendo algunos datos existentes
        ListaEspera listaEspera = convertToEntity(dto);
        listaEspera.setFechaSolicitud(existing.get().getFechaSolicitud()); // Mantener fecha original

        // Validar la solicitud
        validarSolicitud(listaEspera);

        // Guardar y convertir resultado a DTO
        return convertToDTO(repository.save(listaEspera));
    }

    /**
     * Marca una entrada como resuelta
     * 
     * @param id Identificador de la entrada
     * @return La entrada actualizada como DTO
     */
    @Transactional
    public ListaEsperaDTO marcarComoResuelta(Long id) {
        Optional<ListaEspera> listaEsperaOpt = repository.findById(id);
        if (listaEsperaOpt.isEmpty()) {
            throw new RuntimeException("Entrada de lista de espera no encontrada con ID: " + id);
        }

        ListaEspera listaEspera = listaEsperaOpt.get();
        listaEspera.setEstado("RESUELTA");
        return convertToDTO(repository.save(listaEspera));
    }

    /**
     * Marca una entrada como cubierta
     * 
     * @param id Identificador de la entrada
     * @return La entrada actualizada como DTO
     */
    @Transactional
    public ListaEsperaDTO marcarComoCubierta(Long id) {
        Optional<ListaEspera> listaEsperaOpt = repository.findById(id);
        if (listaEsperaOpt.isEmpty()) {
            throw new RuntimeException("Entrada de lista de espera no encontrada con ID: " + id);
        }

        ListaEspera listaEspera = listaEsperaOpt.get();
        listaEspera.setEstado("CUBIERTA");
        return convertToDTO(repository.save(listaEspera));
    }

    /**
     * Elimina una entrada de la lista de espera
     * 
     * @param id Identificador de la entrada a eliminar
     */
    @Transactional
    public void delete(Long id) {
        if (!repository.existsById(id)) {
            throw new RuntimeException("Entrada de lista de espera no encontrada con ID: " + id);
        }
        repository.deleteById(id);
    }

    /**
     * Cuenta el total de solicitudes pendientes
     * 
     * @return Número de solicitudes con estado PENDIENTE
     */
    public long contarPendientes() {
        return repository.findAll().stream()
                .filter(le -> "PENDIENTE".equals(le.getEstado()))
                .count();
    }

    /**
     * Obtiene todas las solicitudes pendientes
     * 
     * @return Lista de solicitudes con estado PENDIENTE
     */
    public List<ListaEsperaDTO> findPendientes() {
        return repository.findAll().stream()
                .filter(le -> "PENDIENTE".equals(le.getEstado()))
                .map(this::convertToDTO)
                .toList();
    }

    /**
     * Obtiene todas las solicitudes urgentes
     * 
     * @return Lista de solicitudes marcadas como urgencia médica
     */
    public List<ListaEsperaDTO> findUrgentes() {
        return repository.findAll().stream()
                .filter(le -> le.getUrgenciaMedica() == ListaEspera.UrgenciaMedica.ALTA
                        || le.getUrgenciaMedica() == ListaEspera.UrgenciaMedica.URGENTE)
                .map(this::convertToDTO)
                .toList();
    }

    // Convertir DTO a entidad
    private ListaEspera convertToEntity(ListaEsperaDTO dto) {
        ListaEspera entity = new ListaEspera();

        // ID solo si existe
        if (dto.getId() != null) {
            entity.setId(dto.getId());
        }

        // Referencias a otras entidades
        entity.setPaciente(pacienteRepository.findById(dto.getPacienteId())
                .orElseThrow(() -> new RuntimeException("Paciente no encontrado: " + dto.getPacienteId())));

        entity.setEspecialidad(especialidadRepository.findById(dto.getEspecialidadId())
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada: " + dto.getEspecialidadId())));

        entity.setCentroAtencion(centroAtencionRepository.findById(dto.getCentroAtencionId())
                .orElseThrow(
                        () -> new RuntimeException("Centro de atención no encontrado: " + dto.getCentroAtencionId())));

        if (dto.getMedicoPreferidoId() != null) {
            entity.setMedicoPreferido(medicoRepository.findById(dto.getMedicoPreferidoId())
                    .orElseThrow(() -> new RuntimeException("Médico no encontrado: " + dto.getMedicoPreferidoId())));
        }

        // Fechas
        entity.setFechaDeseadaDesde(dto.getFechaDeseadaDesde());
        entity.setFechaDeseadaHasta(dto.getFechaDeseadaHasta());
        entity.setFechaSolicitud(dto.getFechaSolicitud() != null ? dto.getFechaSolicitud() : LocalDateTime.now());

        // Otros campos
        entity.setUrgenciaMedica(dto.getUrgenciaMedica() != null
                ? ListaEspera.UrgenciaMedica.valueOf(dto.getUrgenciaMedica())
                : ListaEspera.UrgenciaMedica.BAJA);
        entity.setEstado(dto.getEstado() != null ? dto.getEstado() : "PENDIENTE");

        return entity;
    }

    /**
     * Busca un paciente en la lista de espera para reasignar a un turno cancelado
     * 
     * @param turnoCancelado El turno que fue cancelado
     * @return true si se encontró y reasignó un paciente, false en caso contrario
     */
    @Transactional
    public boolean buscarPacienteParaReasignar(Turno turnoCancelado) {
        System.out
                .println("🔍 Buscando paciente en lista de espera para turno cancelado ID: " + turnoCancelado.getId());

        try {
            // 1. Buscar solicitudes pendientes que coincidan con el turno cancelado
            List<ListaEspera> candidatos = buscarCandidatosParaTurno(turnoCancelado);

            if (candidatos.isEmpty()) {
                System.out.println("ℹ️ No se encontraron pacientes en lista de espera que coincidan con el turno");
                return false;
            }

            // 2. Ordenar candidatos por prioridad (urgencia médica primero, luego por fecha
            // de solicitud)
            List<ListaEspera> candidatosOrdenados = candidatos.stream()
                    .sorted((a, b) -> {
                        // Primero por nivel de urgencia médica (URGENTE > ALTA > MEDIA > BAJA)
                        int urgenciaCompare = b.getUrgenciaMedica().compareTo(a.getUrgenciaMedica());
                        if (urgenciaCompare != 0) {
                            return urgenciaCompare;
                        }
                        // Luego por antigüedad de la solicitud
                        return a.getFechaSolicitud().compareTo(b.getFechaSolicitud());
                    })
                    .toList();

            // 3. Intentar reasignar al primer candidato válido
            for (ListaEspera solicitud : candidatosOrdenados) {
                ListaEsperaDTO dto = convertToDTO(solicitud);
                if (intentarReasignarTurno(solicitud, turnoCancelado)) {
                    System.out.println(
                            "✅ Turno reasignado exitosamente al paciente Nombre/Apellido: " + dto.getPacienteNombre()
                                    + " " + dto.getPacienteApellido());
                    return true;
                }
            }

            System.out.println("⚠️ No se pudo reasignar el turno a ningún candidato");
            return false;

        } catch (Exception e) {
            System.err.println("❌ ERROR al buscar paciente para reasignar: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    /**
     * Busca candidatos en la lista de espera que coincidan con el turno disponible
     * ordenados por prioridad (urgencia médica y tiempo de espera)
     */
    private List<ListaEspera> buscarCandidatosParaTurno(Turno turnoDisponible) {
        LocalDate fechaTurno = turnoDisponible.getFecha();
        Especialidad especialidad = turnoDisponible.getStaffMedico().getEspecialidad();
        CentroAtencion centroAtencion = turnoDisponible.getStaffMedico().getCentroAtencion();

        return repository.findAll().stream()
                .filter(le -> "PENDIENTE".equals(le.getEstado()))
                .filter(le -> especialidad.equals(le.getEspecialidad()))
                .filter(le -> centroAtencion == null || centroAtencion.equals(le.getCentroAtencion()))
                .filter(le -> esFechaCompatibleDTO(convertToDTO(le), fechaTurno))
                .filter(le -> esMedicoCompatibleDTO(convertToDTO(le), turnoDisponible.getStaffMedico().getMedico()))
                .sorted((a, b) -> {
                    // Primero por nivel de urgencia médica (URGENTE > ALTA > MEDIA > BAJA)
                    int urgenciaCompare = b.getUrgenciaMedica().compareTo(a.getUrgenciaMedica());
                    if (urgenciaCompare != 0) {
                        return urgenciaCompare;
                    }
                    // Luego por antigüedad de la solicitud
                    return a.getFechaSolicitud().compareTo(b.getFechaSolicitud());
                })
                .toList();
    }

    /**
     * Busca solicitudes por múltiples criterios con filtros avanzados
     */
    public List<ListaEsperaDTO> buscarConFiltros(
            Integer especialidadId,
            Integer centroAtencionId,
            Integer medicoId,
            String estado,
            String urgenciaMedica,
            LocalDate fechaDesde,
            LocalDate fechaHasta,
            Integer tiempoEsperaMinimo,
            Integer tiempoEsperaMaximo,
            String ordenamiento) {

        Especialidad especialidad = especialidadId != null ? especialidadRepository.findById(especialidadId)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada: " + especialidadId)) : null;

        CentroAtencion centroAtencion = centroAtencionId != null ? centroAtencionRepository.findById(centroAtencionId)
                .orElseThrow(() -> new RuntimeException("Centro de atención no encontrado: " + centroAtencionId))
                : null;

        Medico medico = medicoId != null ? medicoRepository.findById(medicoId)
                .orElseThrow(() -> new RuntimeException("Médico no encontrado: " + medicoId)) : null;

        LocalDate hoy = LocalDate.now();

        return repository.findAll().stream()
                .filter(le -> especialidad == null || especialidad.equals(le.getEspecialidad()))
                .filter(le -> centroAtencion == null || centroAtencion.equals(le.getCentroAtencion()))
                .filter(le -> medico == null || medico.equals(le.getMedicoPreferido()))
                .filter(le -> estado == null || estado.equals(le.getEstado()))
                .filter(le -> {
                    if (urgenciaMedica == null)
                        return true;
                    try {
                        ListaEspera.UrgenciaMedica urgenciaEnum = ListaEspera.UrgenciaMedica
                                .valueOf(urgenciaMedica.toUpperCase());
                        return urgenciaEnum.equals(le.getUrgenciaMedica());
                    } catch (IllegalArgumentException e) {
                        // Si el valor del string no coincide con ningún enum, ignorar filtro o
                        // manejarlo según tus reglas
                        System.err.println("⚠️ Valor de urgencia médica inválido: " + urgenciaMedica);
                        return true; // o false, si querés descartar en caso de valor inválido
                    }
                })
                .filter(le -> fechaDesde == null || !le.getFechaSolicitud().toLocalDate().isBefore(fechaDesde))
                .filter(le -> fechaHasta == null || !le.getFechaSolicitud().toLocalDate().isAfter(fechaHasta))
                .filter(le -> {
                    if (tiempoEsperaMinimo == null && tiempoEsperaMaximo == null)
                        return true;
                    long diasEspera = ChronoUnit.DAYS.between(le.getFechaSolicitud().toLocalDate(), hoy);
                    return (tiempoEsperaMinimo == null || diasEspera >= tiempoEsperaMinimo) &&
                            (tiempoEsperaMaximo == null || diasEspera <= tiempoEsperaMaximo);
                })
                .sorted((a, b) -> {
                    if ("URGENCIA_TIEMPO".equals(ordenamiento)) {
                        // Ordenar por urgencia primero, luego por tiempo de espera
                        int urgenciaCompare = b.getUrgenciaMedica().compareTo(a.getUrgenciaMedica());
                        if (urgenciaCompare != 0) {
                            return urgenciaCompare;
                        }
                        return a.getFechaSolicitud().compareTo(b.getFechaSolicitud());
                    } else if ("TIEMPO_ESPERA".equals(ordenamiento)) {
                        // Ordenar solo por tiempo de espera
                        return a.getFechaSolicitud().compareTo(b.getFechaSolicitud());
                    } else if ("URGENCIA".equals(ordenamiento)) {
                        // Ordenar solo por urgencia (URGENTE > ALTA > MEDIA > BAJA)
                        return b.getUrgenciaMedica().compareTo(a.getUrgenciaMedica());
                    }
                    // Por defecto, ordenar por fecha de solicitud
                    return a.getFechaSolicitud().compareTo(b.getFechaSolicitud());
                })
                .map(this::convertToDTO)
                .toList();
    }

    /**
     * Obtiene el ranking de pacientes en espera por especialidad
     */
    public List<Map<String, Object>> obtenerRankingEspera(Integer especialidadId) {
        Especialidad especialidad = especialidadRepository.findById(especialidadId)
                .orElseThrow(() -> new RuntimeException("Especialidad no encontrada: " + especialidadId));

        List<ListaEspera> solicitudes = repository.findAll().stream()
                .filter(le -> "PENDIENTE".equals(le.getEstado()))
                .filter(le -> especialidad.equals(le.getEspecialidad()))
                .sorted((a, b) -> {
                    // Ordenar por nivel de urgencia (URGENTE > ALTA > MEDIA > BAJA)
                    int urgenciaCompare = b.getUrgenciaMedica().compareTo(a.getUrgenciaMedica());
                    if (urgenciaCompare != 0) {
                        return urgenciaCompare;
                    }
                    return a.getFechaSolicitud().compareTo(b.getFechaSolicitud());
                })
                .toList();

        List<Map<String, Object>> ranking = new ArrayList<>();
        int posicion = 1;

        for (ListaEspera solicitud : solicitudes) {
            Map<String, Object> info = new HashMap<>();
            info.put("posicion", posicion++);
            info.put("solicitudId", solicitud.getId());
            info.put("pacienteId", solicitud.getPaciente().getId());
            info.put("pacienteNombre", solicitud.getPaciente().getNombre() + " " +
                    solicitud.getPaciente().getApellido());
            info.put("urgenciaMedica", solicitud.getUrgenciaMedica().name());
            info.put("urgenciaDescripcion", solicitud.getUrgenciaMedica().getDescripcion());
            info.put("diasEspera",
                    ChronoUnit.DAYS.between(
                            solicitud.getFechaSolicitud().toLocalDate(),
                            LocalDate.now()));
            info.put("fechaSolicitud", solicitud.getFechaSolicitud());
            ranking.add(info);
        }

        return ranking;
    }

    /**
     * Intenta reasignar el turno al paciente de la solicitud en una única
     * transacción
     */
    // ========== MÉTODO: intentarReasignarTurno ==========
    @Transactional
    private boolean intentarReasignarTurno(ListaEspera solicitud, Turno turnoDisponible) {
        try {
            System.out.println("🔄 Intentando reasignar turno al paciente ID: " + solicitud.getPaciente().getId());

            // 1. Verificar que la solicitud sigue pendiente
            if (!"PENDIENTE".equals(solicitud.getEstado())) {
                System.out.println("⚠️ La solicitud ya no está pendiente");
                return false;
            }

            // 2. Crear nuevo turno para el paciente (ahora retorna TurnoDTO)
            TurnoDTO nuevoTurnoDTO = crearNuevoTurno(solicitud, turnoDisponible);

            // 3. Marcar la solicitud como CUBIERTA
            solicitud.setEstado("CUBIERTA");
            solicitud = repository.save(solicitud);

            // 4. Registrar en auditoría (dentro de la misma transacción)
            registrarAuditoriaReasignacion(solicitud, nuevoTurnoDTO, turnoDisponible);

            // 5. Enviar notificación al paciente (fuera de la transacción para evitar
            // problemas)
            try {
                enviarNotificacionReasignacion(solicitud, nuevoTurnoDTO);
            } catch (Exception e) {
                // Log error pero no rollback la transacción
                System.err.println("⚠️ Error al enviar notificación: " + e.getMessage());
            }

            System.out.println("✅ Turno reasignado exitosamente");
            return true;

        } catch (Exception e) {
            System.err.println("❌ ERROR al intentar reasignar turno: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error al reasignar turno: " + e.getMessage());
        }
    }

    /**
     * Crea un nuevo turno basado en el turno cancelado y lo persiste
     */
    // ========== MÉTODO: crearNuevoTurno (ACTUALIZADO) ==========
    private TurnoDTO crearNuevoTurno(ListaEspera solicitud, Turno turnoCancelado) {
        try {
            // Crear la entidad Turno directamente sin pasar por TurnoService
            Turno nuevoTurno = new Turno();

            // Asignar paciente
            nuevoTurno.setPaciente(solicitud.getPaciente());

            // Asignar médico y especialidad
            nuevoTurno.setStaffMedico(turnoCancelado.getStaffMedico());
            nuevoTurno.setMedico(turnoCancelado.getStaffMedico().getMedico());
            nuevoTurno.setEspecialidad(turnoCancelado.getStaffMedico().getEspecialidad());
            nuevoTurno.setCentroAtencion(turnoCancelado.getStaffMedico().getCentroAtencion());

            // Asignar fecha y hora
            nuevoTurno.setFecha(turnoCancelado.getFecha());
            nuevoTurno.setHoraInicio(turnoCancelado.getHoraInicio());
            nuevoTurno.setHoraFin(turnoCancelado.getHoraFin());

            // Asignar consultorio
            nuevoTurno.setConsultorio(turnoCancelado.getConsultorio());

            // Estado inicial
            nuevoTurno.setEstado(EstadoTurno.PROGRAMADO);
            nuevoTurno.setObservaciones("Reasignado desde lista de espera");

            // Guardar directamente en el repositorio
            Turno turnoGuardado = turnoRepository.save(nuevoTurno);

            // Convertir a DTO usando el método privado de conversión
            return convertTurnoToDTO(turnoGuardado);

        } catch (Exception e) {
            System.err.println("Error al crear nuevo turno: " + e.getMessage());
            throw new RuntimeException("Error al crear nuevo turno: " + e.getMessage());
        }
    }

    // ========== MÉTODO AUXILIAR: Convertir Turno a TurnoDTO ==========
    private TurnoDTO convertTurnoToDTO(Turno turno) {
        TurnoDTO dto = new TurnoDTO();
        dto.setId(turno.getId());
        dto.setFecha(turno.getFecha());
        dto.setHoraInicio(turno.getHoraInicio());
        dto.setHoraFin(turno.getHoraFin());
        dto.setEstado(turno.getEstado().name());

        // Datos del paciente
        if (turno.getPaciente() != null) {
            dto.setPacienteId(turno.getPaciente().getId());
            dto.setNombrePaciente(turno.getPaciente().getNombre());
            dto.setApellidoPaciente(turno.getPaciente().getApellido());
        }

        // Datos del médico
        if (turno.getStaffMedico() != null) {
            dto.setStaffMedicoId(turno.getStaffMedico().getId());
            dto.setStaffMedicoNombre(turno.getStaffMedico().getMedico().getNombre());
            dto.setStaffMedicoApellido(turno.getStaffMedico().getMedico().getApellido());
            dto.setEspecialidadStaffMedico(turno.getStaffMedico().getEspecialidad().getNombre());
        }

        // Datos del consultorio y centro
        if (turno.getConsultorio() != null) {
            dto.setConsultorioId(turno.getConsultorio().getId());
            dto.setConsultorioNombre(turno.getConsultorio().getNombre());
            if (turno.getConsultorio().getCentroAtencion() != null) {
                dto.setCentroId(turno.getConsultorio().getCentroAtencion().getId());
                dto.setNombreCentro(turno.getConsultorio().getCentroAtencion().getNombre());
            }
        }

        dto.setObservaciones(turno.getObservaciones());

        return dto;
    }

    /**
     * Envía notificación al paciente sobre el nuevo turno asignado
     */
    private void enviarNotificacionReasignacion(ListaEspera solicitud, TurnoDTO nuevoTurnoDTO) {
        try {
            if (notificacionService != null) {
                String fechaTurno = nuevoTurnoDTO.getFecha().format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
                String horaTurno = nuevoTurnoDTO.getHoraInicio().format(DateTimeFormatter.ofPattern("HH:mm"));
                String nombreMedico = nuevoTurnoDTO.getStaffMedicoNombre() + " " +
                        nuevoTurnoDTO.getStaffMedicoApellido();
                String especialidad = nuevoTurnoDTO.getEspecialidadStaffMedico();

                notificacionService.crearNotificacionNuevoTurno(
                        solicitud.getPaciente().getId(),
                        nuevoTurnoDTO.getId(),
                        fechaTurno + " " + horaTurno,
                        especialidad,
                        nombreMedico);

                System.out.println("📧 Notificación enviada al paciente ID: " + solicitud.getPaciente().getId());
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error al enviar notificación: " + e.getMessage());
        }
    }

    /**
     * Registra en auditoría la reasignación del turno con información detallada
     */
    private void registrarAuditoriaReasignacion(ListaEspera solicitud, TurnoDTO nuevoTurnoDTO, Turno turnoDisponible) {
        try {
            if (auditLogService != null) {
                Map<String, Object> detalles = new HashMap<>();
                // Información de la solicitud
                detalles.put("listaEsperaId", solicitud.getId());
                detalles.put("fechaSolicitud", solicitud.getFechaSolicitud());
                detalles.put("diasEspera",
                        ChronoUnit.DAYS.between(solicitud.getFechaSolicitud().toLocalDate(), LocalDate.now()));
                detalles.put("urgenciaMedica", solicitud.getUrgenciaMedica().name());
                detalles.put("urgenciaDescripcion", solicitud.getUrgenciaMedica().getDescripcion());

                // Información del paciente
                detalles.put("pacienteId", solicitud.getPaciente().getId());
                detalles.put("pacienteNombre",
                        solicitud.getPaciente().getNombre() + " " + solicitud.getPaciente().getApellido());

                // Información del turno original y nuevo (usando DTO)
                detalles.put("turnoOriginalId", turnoDisponible.getId());
                detalles.put("nuevoTurnoId", nuevoTurnoDTO.getId());
                detalles.put("fechaTurno", nuevoTurnoDTO.getFecha());
                detalles.put("horaTurno", nuevoTurnoDTO.getHoraInicio());

                // Información de la especialidad y centro (desde DTO)
                detalles.put("especialidad", nuevoTurnoDTO.getEspecialidadStaffMedico());
                detalles.put("centroAtencion", nuevoTurnoDTO.getNombreCentro());
                detalles.put("consultorio", nuevoTurnoDTO.getConsultorioNombre());
                detalles.put("medico", nuevoTurnoDTO.getStaffMedicoNombre() + " " +
                        nuevoTurnoDTO.getStaffMedicoApellido());

                String mensaje = String.format(
                        "Turno reasignado automáticamente. Paciente en espera desde %s (días: %d). %s",
                        solicitud.getFechaSolicitud().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")),
                        ChronoUnit.DAYS.between(solicitud.getFechaSolicitud().toLocalDate(), LocalDate.now()),
                        solicitud.getUrgenciaMedica() == ListaEspera.UrgenciaMedica.URGENTE ? "CASO URGENTE" : "");

                auditLogService.logGenericAction(
                        "LISTA_ESPERA",
                        ((long) solicitud.getId()),
                        "TURNO_REASIGNADO",
                        AuditContext.getCurrentUser() != null ? AuditContext.getCurrentUser() : "SISTEMA_AUTOMATICO",
                        "PENDIENTE",
                        "CUBIERTA",
                        null,
                        detalles,
                        mensaje);

                System.out.println("📝 Auditoría detallada registrada para reasignación");
            }
        } catch (Exception e) {
            System.err.println("⚠️ Error al registrar auditoría: " + e.getMessage());
            // No lanzar excepción para no afectar la transacción principal
        }
    }

    /**
     * Obtiene estadísticas generales de la lista de espera
     */
    public Map<String, Object> obtenerEstadisticasGenerales() {
        Map<String, Object> estadisticas = new HashMap<>();
        List<ListaEspera> todas = repository.findAll();

        estadisticas.put("totalSolicitudes", todas.size());
        estadisticas.put("pendientes", contarPendientes());

        long urgentes = todas.stream()
                .filter(le -> "PENDIENTE".equals(le.getEstado()))
                .filter(le -> le.getUrgenciaMedica() == ListaEspera.UrgenciaMedica.ALTA
                        || le.getUrgenciaMedica() == ListaEspera.UrgenciaMedica.URGENTE)
                .count();
        estadisticas.put("urgentes", urgentes);

        // Agregar estadísticas por nivel de urgencia
        Map<String, Long> porNivel = todas.stream()
                .filter(le -> "PENDIENTE".equals(le.getEstado()))
                .collect(Collectors.groupingBy(
                        le -> le.getUrgenciaMedica().name(),
                        Collectors.counting()));
        estadisticas.put("porNivelUrgencia", porNivel);

        // Tiempo promedio de espera
        OptionalDouble tiempoPromedioEspera = todas.stream()
                .filter(le -> "PENDIENTE".equals(le.getEstado()))
                .mapToLong(le -> java.time.temporal.ChronoUnit.DAYS.between(
                        le.getFechaSolicitud().toLocalDate(),
                        LocalDate.now()))
                .average();

        estadisticas.put("tiempoPromedioEsperaDias",
                tiempoPromedioEspera.isPresent() ? tiempoPromedioEspera.getAsDouble() : 0);

        return estadisticas;
    }

    /**
     * Verifica si hay turnos disponibles que coincidan con solicitudes pendientes
     */
    public List<Map<String, Object>> verificarCoincidenciasDisponibles(LocalDate fechaInicio, LocalDate fechaFin) {
        List<Map<String, Object>> coincidencias = new ArrayList<>();
        List<ListaEsperaDTO> pendientes = findPendientes();

        pendientes.stream()
                .filter(dto -> esFechaCompatibleDTO(dto, fechaInicio) || esFechaCompatibleDTO(dto, fechaFin))
                .forEach(dto -> {
                    Map<String, Object> coincidencia = new HashMap<>();
                    coincidencia.put("solicitudId", dto.getId());
                    coincidencia.put("pacienteId", dto.getPacienteId());
                    coincidencia.put("pacienteNombre", dto.getPacienteNombre() + " " + dto.getPacienteApellido());
                    coincidencia.put("especialidad", dto.getEspecialidadNombre());
                    coincidencia.put("urgenciaMedica", dto.getUrgenciaMedica());
                    coincidencia.put("tiempoEsperaDias",
                            java.time.temporal.ChronoUnit.DAYS.between(
                                    dto.getFechaSolicitud().toLocalDate(),
                                    LocalDate.now()));
                    coincidencias.add(coincidencia);
                });

        return coincidencias;
    }

    /**
     * Verifica si la fecha coincide con las preferencias del paciente usando el DTO
     */
    private boolean esFechaCompatibleDTO(ListaEsperaDTO dto, LocalDate fecha) {
        if (dto.getFechaDeseadaDesde() == null && dto.getFechaDeseadaHasta() == null) {
            return true; // Sin preferencia de fecha
        }

        if (dto.getFechaDeseadaDesde() != null && fecha.isBefore(dto.getFechaDeseadaDesde())) {
            return false;
        }

        if (dto.getFechaDeseadaHasta() != null && fecha.isAfter(dto.getFechaDeseadaHasta())) {
            return false;
        }

        return true;
    }

    /**
     * Verifica si el médico es compatible con las preferencias del paciente usando
     * el DTO
     */
    private boolean esMedicoCompatibleDTO(ListaEsperaDTO dto, Medico medico) {
        if (dto.getMedicoPreferidoId() == null) {
            return true; // Sin preferencia de médico
        }

        return dto.getMedicoPreferidoId().equals(medico.getId());
    }

    /**
     * Cancela solicitudes que han expirado (fecha deseada hasta ha pasado)
     */
    @Transactional
    public int cancelarSolicitudesExpiradas() {
        LocalDate hoy = LocalDate.now();
        int canceladas = 0;

        List<ListaEsperaDTO> pendientes = repository.findAll().stream()
                .filter(le -> "PENDIENTE".equals(le.getEstado()))
                .filter(le -> le.getFechaDeseadaHasta() != null)
                .filter(le -> le.getFechaDeseadaHasta().isBefore(hoy))
                .map(this::convertToDTO)
                .toList();

        for (ListaEsperaDTO dto : pendientes) {
            ListaEspera solicitud = repository.findById(dto.getId())
                    .orElseThrow(() -> new RuntimeException("Solicitud no encontrada: " + dto.getId()));
            solicitud.setEstado("RESUELTA");
            repository.save(solicitud);

            // Notificar al paciente
            if (notificacionService != null) {
                try {
                    notificacionService.crearNotificacion(
                            dto.getPacienteId(),
                            "Solicitud en Lista de Espera Expirada",
                            "Su solicitud en lista de espera para " + dto.getEspecialidadNombre() +
                                    " ha expirado. Por favor, realice una nueva solicitud si aún requiere atención.",
                            TipoNotificacion.URGENTE,
                            null,
                            "SISTEMA");
                } catch (Exception e) {
                    System.err.println("Error al notificar expiración: " + e.getMessage());
                }
            }

            canceladas++;
        }

        System.out.println("✅ Se cancelaron " + canceladas + " solicitudes expiradas");
        return canceladas;
    }

    /**
     * Envía recordatorios a pacientes con solicitudes pendientes antiguas
     */
    @Transactional
    public int enviarRecordatoriosSolicitudesPendientes(int diasMinimos) {
        LocalDateTime fechaLimite = LocalDateTime.now().minusDays(diasMinimos);
        int recordatoriosEnviados = 0;

        List<ListaEsperaDTO> solicitudesAntiguas = repository.findAll().stream()
                .filter(le -> "PENDIENTE".equals(le.getEstado()))
                .filter(le -> le.getFechaSolicitud().isBefore(fechaLimite))
                .map(this::convertToDTO)
                .toList();

        for (ListaEsperaDTO dto : solicitudesAntiguas) {
            if (notificacionService != null) {
                try {
                    long diasEspera = java.time.temporal.ChronoUnit.DAYS.between(
                            dto.getFechaSolicitud().toLocalDate(),
                            LocalDate.now());

                    notificacionService.crearNotificacion(
                            dto.getPacienteId(),
                            "Recordatorio: Solicitud en Lista de Espera",
                            "Su solicitud para " + dto.getEspecialidadNombre() +
                                    " lleva " + diasEspera + " días en lista de espera. " +
                                    "Le notificaremos cuando haya un turno disponible.",
                            TipoNotificacion.RECORDATORIO,
                            null,
                            "SISTEMA");

                    recordatoriosEnviados++;
                } catch (Exception e) {
                    System.err.println("Error al enviar recordatorio: " + e.getMessage());
                }
            }
        }

        System.out.println("📧 Se enviaron " + recordatoriosEnviados + " recordatorios");
        return recordatoriosEnviados;
    }

    /**
     * Marca una solicitud como resuelta por otro medio (ej. teléfono)
     * 
     * @param id ID de la solicitud a marcar
     * @return DTO de la solicitud actualizada
     */
    @Transactional
    public ListaEsperaDTO marcarComoResueltaPorOtroMedio(Long id) {
        Optional<ListaEspera> listaEsperaOpt = repository.findById(id);
        if (listaEsperaOpt.isEmpty()) {
            throw new RuntimeException("Entrada de lista de espera no encontrada con ID: " + id);
        }

        ListaEspera listaEspera = listaEsperaOpt.get();

        // Verificar que la solicitud esté pendiente
        if (!"PENDIENTE".equals(listaEspera.getEstado())) {
            throw new RuntimeException("La solicitud no está en estado PENDIENTE");
        }

        // Cambiar estado y registrar fecha de resolución
        listaEspera.setEstado("RESUELTA_POR_OTRO_MEDIO");

        // Registrar en auditoría
        try {
            if (auditLogService != null) {
                Map<String, Object> detalles = new HashMap<>();
                detalles.put("fechaResolucion", LocalDateTime.now());
                detalles.put("resolutorId", AuditContext.getCurrentUser());
                detalles.put("pacienteId", listaEspera.getPaciente().getId());
                detalles.put("especialidadId", listaEspera.getEspecialidad().getId());

                auditLogService.logGenericAction(
                        "LISTA_ESPERA",
                        ((long) listaEspera.getId()),
                        "RESOLUCION_MANUAL",
                        AuditContext.getCurrentUser(),
                        "PENDIENTE",
                        "RESUELTA_POR_OTRO_MEDIO",
                        null,
                        detalles,
                        "Solicitud resuelta manualmente por " + AuditContext.getCurrentUser());
            }
        } catch (Exception e) {
            System.err.println("Error al registrar auditoría: " + e.getMessage());
        }

        return convertToDTO(repository.save(listaEspera));
    }

    /**
     * Obtiene estadísticas de demanda insatisfecha agrupada por especialidad
     * 
     * @param periodo Período de tiempo a considerar ("mes_actual",
     *                "ultimo_trimestre")
     * @return Mapa con especialidad como clave y cantidad de solicitudes como valor
     */
    public Map<String, Long> obtenerEstadisticasDemanda(String periodo) {
        LocalDate fechaInicio;
        LocalDate fechaActual = LocalDate.now();

        // Determinar fecha de inicio según el período
        switch (periodo.toLowerCase()) {
            case "mes_actual":
                fechaInicio = fechaActual.withDayOfMonth(1);
                break;
            case "ultimo_trimestre":
                fechaInicio = fechaActual.minusMonths(3);
                break;
            default:
                throw new RuntimeException("Período no válido. Use 'mes_actual' o 'ultimo_trimestre'");
        }

        // Filtrar solicitudes por fecha y estado, y agrupar por especialidad
        return repository.findAll().stream()
                .filter(le -> "PENDIENTE".equals(le.getEstado()))
                .filter(le -> !le.getFechaSolicitud().toLocalDate().isBefore(fechaInicio))
                .collect(Collectors.groupingBy(
                        le -> le.getEspecialidad().getNombre(),
                        Collectors.counting()));
    }

    /**
     * Valida si un paciente puede ser agregado a la lista de espera
     */
    public boolean validarSolicitud(ListaEspera solicitud) {
        // Verificar que el paciente no tenga ya una solicitud pendiente para la misma
        // especialidad, excluyendo la solicitud actual si es una edición
        List<ListaEsperaDTO> solicitudesPendientes = findPendientes();
        boolean tieneSolicitudDuplicada = solicitudesPendientes.stream()
                .filter(dto -> !dto.getId().equals(solicitud.getId())) // Excluir la solicitud actual si es edición
                .anyMatch(dto -> dto.getPacienteId().equals(solicitud.getPaciente().getId()) &&
                        dto.getEspecialidadId().equals(solicitud.getEspecialidad().getId()));

        if (tieneSolicitudDuplicada) {
            throw new RuntimeException("El paciente ya tiene una solicitud pendiente para esta especialidad");
        }

        // Validar fechas
        if (solicitud.getFechaDeseadaDesde() != null &&
                solicitud.getFechaDeseadaHasta() != null &&
                solicitud.getFechaDeseadaDesde().isAfter(solicitud.getFechaDeseadaHasta())) {
            throw new RuntimeException("La fecha desde no puede ser posterior a la fecha hasta");
        }

        return true;
    }

    // Convertir entidad a DTO
    private ListaEsperaDTO convertToDTO(ListaEspera entity) {
        ListaEsperaDTO dto = new ListaEsperaDTO();

        dto.setId(entity.getId());

        // Información del paciente
        dto.setPacienteId(entity.getPaciente().getId());
        dto.setPacienteNombre(entity.getPaciente().getNombre());
        dto.setPacienteApellido(entity.getPaciente().getApellido());
        dto.setPacienteDni(entity.getPaciente().getDni());
        dto.setPacienteTelefono(entity.getPaciente().getTelefono());
        dto.setPacienteEmail(entity.getPaciente().getEmail());

        // Información de la especialidad
        dto.setEspecialidadId(entity.getEspecialidad().getId());
        dto.setEspecialidadNombre(entity.getEspecialidad().getNombre());

        // Información del médico preferido
        if (entity.getMedicoPreferido() != null) {
            dto.setMedicoPreferidoId(entity.getMedicoPreferido().getId());
            dto.setMedicoPreferidoNombre(entity.getMedicoPreferido().getNombre() + " " +
                    entity.getMedicoPreferido().getApellido());
        }

        // Información del centro de atención
        dto.setCentroAtencionId(entity.getCentroAtencion().getId());
        dto.setCentroAtencionNombre(entity.getCentroAtencion().getNombre());

        // Fechas
        dto.setFechaDeseadaDesde(entity.getFechaDeseadaDesde());
        dto.setFechaDeseadaHasta(entity.getFechaDeseadaHasta());
        dto.setFechaSolicitud(entity.getFechaSolicitud());

        // Estado y urgencia
        dto.setUrgenciaMedica(entity.getUrgenciaMedica().name());
        dto.setEstado(entity.getEstado());

        // Calcular días en espera
        long diasEnEspera = ChronoUnit.DAYS.between(
                entity.getFechaSolicitud().toLocalDate(),
                LocalDateTime.now().toLocalDate());
        dto.setDiasEnEspera(diasEnEspera);

        return dto;
    }
}