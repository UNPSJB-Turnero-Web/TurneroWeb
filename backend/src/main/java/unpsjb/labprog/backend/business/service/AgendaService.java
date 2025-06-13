package unpsjb.labprog.backend.business.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.AgendaRepository;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.dto.AgendaDTO;
import unpsjb.labprog.backend.dto.ConsultorioDTO;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.Consultorio;
import unpsjb.labprog.backend.model.EsquemaTurno;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Turno;
import unpsjb.labprog.backend.model.ConfiguracionExcepcional;

/**
 * Servicio simplificado para Agenda - solo maneja agendas operacionales.
 * Las configuraciones excepcionales se manejan en ConfiguracionExcepcionalService.
 */
@Service
public class AgendaService {

    @Autowired
    AgendaRepository repository;

    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private EsquemaTurnoRepository esquemaTurnoRepository;

    @Autowired
    private ConsultorioService consultorioService;
    
    @Autowired
    private ConsultorioDistribucionService consultorioDistribucionService;
    
    @Autowired
    private ConfiguracionExcepcionalService configuracionExcepcionalService;

    /**
     * Este método ahora es manejado por ConfiguracionExcepcionalService.
     * Se mantiene para compatibilidad pero delega a la nueva arquitectura.
     */
    @Transactional
    @Deprecated
    public Agenda crearAgendaExcepcional(LocalDate fecha, String tipoExcepcion, String descripcion,
            Integer esquemaTurnoId, LocalTime horaInicio, LocalTime horaFin, Integer tiempoSanitizacion) {
        
        // Delegar a ConfiguracionExcepcionalService basado en el tipo
        switch (tipoExcepcion.toUpperCase()) {
            case "FERIADO":
                configuracionExcepcionalService.crearFeriado(fecha, descripcion);
                break;
            case "MANTENIMIENTO":
                if (esquemaTurnoId != null) {
                    EsquemaTurno esquema = esquemaTurnoRepository.findById(esquemaTurnoId)
                            .orElseThrow(() -> new IllegalArgumentException("EsquemaTurno no encontrado"));
                    configuracionExcepcionalService.crearMantenimiento(fecha, descripcion, 
                            esquema.getConsultorio().getId(), tiempoSanitizacion);
                }
                break;
            case "ATENCION_ESPECIAL":
                if (esquemaTurnoId != null && horaInicio != null && horaFin != null) {
                    configuracionExcepcionalService.crearAtencionEspecial(fecha, descripcion, 
                            esquemaTurnoId, horaInicio, horaFin, tiempoSanitizacion);
                }
                break;
            default:
                throw new IllegalArgumentException("Tipo de excepción no válido: " + tipoExcepcion);
        }
        
        // Retornar una agenda básica para compatibilidad
        Agenda agenda = new Agenda();
        agenda.setFecha(fecha);
        agenda.setHabilitado(true);
        if (esquemaTurnoId != null) {
            EsquemaTurno esquemaTurno = esquemaTurnoRepository.findById(esquemaTurnoId)
                    .orElseThrow(() -> new IllegalArgumentException("EsquemaTurno no encontrado"));
            agenda.setEsquemaTurno(esquemaTurno);
        }
        return repository.save(agenda);
    }

    /**
     * Configurar tiempo de sanitización para un esquema de turno
     */
    @Transactional
    public void configurarSanitizacion(Integer esquemaTurnoId, Integer tiempoSanitizacion) {
        // Actualizar todas las agendas de este esquema
        List<Agenda> agendas = repository.findByEsquemaTurno_Id(esquemaTurnoId);
        for (Agenda agenda : agendas) {
            // Solo actualizar agendas operacionales (simplificadas)
            agenda.setTiempoSanitizacion(tiempoSanitizacion);
            repository.save(agenda);
        }
    }

    /**
     * Verificar si una fecha es excepcional usando el nuevo servicio
     */
    public boolean esFechaExcepcional(LocalDate fecha, Integer esquemaTurnoId) {
        // Usar el nuevo servicio para verificar excepciones
        return configuracionExcepcionalService.esFeriado(fecha) ||
               configuracionExcepcionalService.tieneMantenimiento(fecha, esquemaTurnoId) ||
               configuracionExcepcionalService.obtenerAtencionEspecial(fecha, esquemaTurnoId).isPresent();
    }

    /**
     * Obtener configuraciones excepcionales por rango de fechas usando el nuevo servicio
     */
    @Deprecated
    public List<Agenda> obtenerAgendasExcepcionales(LocalDate fechaInicio, LocalDate fechaFin, Integer centroId) {
        // Este método está deprecado. Use ConfiguracionExcepcionalService directamente.
        // Se mantiene para compatibilidad pero retorna una lista vacía.
        return new ArrayList<>();
    }

    /**
     * Validar disponibilidad considerando días excepcionales y horarios del consultorio
     */
    public boolean validarDisponibilidad(LocalDate fecha, LocalTime horaInicio, Integer consultorioId,
            Integer staffMedicoId) {
        // Verificar si es feriado usando el nuevo servicio
        if (configuracionExcepcionalService.esFeriado(fecha)) {
            return false;
        }

        // Verificar si hay mantenimiento en el consultorio
        if (configuracionExcepcionalService.tieneMantenimiento(fecha, consultorioId)) {
            return false;
        }

        // NUEVA VALIDACIÓN: Verificar horarios del consultorio
        String diaSemana = fecha.getDayOfWeek().name();
        if (!consultorioService.consultorioDisponibleEnHorario(consultorioId, diaSemana, horaInicio)) {
            return false;
        }

        // Verificar si ya existe un turno en ese horario
        return !turnoRepository.existsByFechaAndHoraInicioAndStaffMedicoIdAndEstadoNot(
                fecha, horaInicio, staffMedicoId, EstadoTurno.CANCELADO);
    }
    
    /**
     * Método auxiliar para generar slots para un horario específico
     */
    private List<TurnoDTO> generarSlotsParaHorario(LocalDate fecha, LocalTime inicio, LocalTime fin, 
                                                  EsquemaTurno esquemaTurno, Integer tiempoSanitizacion,
                                                  int eventoIdCounter) {
        List<TurnoDTO> slots = new ArrayList<>();
        int intervalo = esquemaTurno.getIntervalo();
        int tiempoSanitizacionSeguro = tiempoSanitizacion != null ? tiempoSanitizacion : 0;
        int intervaloConSanitizacion = intervalo + tiempoSanitizacionSeguro;
        
        LocalTime slotStart = inicio;
        
        while (slotStart.isBefore(fin)) {
            LocalTime nextSlot = slotStart.plusMinutes(intervalo);
            
            if (nextSlot.isAfter(fin)) {
                break;
            }

            boolean slotOcupado = turnoRepository.existsByFechaAndHoraInicioAndStaffMedicoIdAndEstadoNot(
                fecha, slotStart, esquemaTurno.getStaffMedico().getId(), EstadoTurno.CANCELADO);

            TurnoDTO evento = new TurnoDTO();
            evento.setId(eventoIdCounter++);
            evento.setFecha(fecha);
            evento.setHoraInicio(slotStart);
            evento.setHoraFin(nextSlot);
            evento.setTitulo(slotOcupado ? "Ocupado" : "Disponible");
            evento.setEsSlot(true);
            evento.setOcupado(slotOcupado);
            
            // Asignar datos del esquema
            evento.setStaffMedicoId(esquemaTurno.getStaffMedico().getId());
            evento.setStaffMedicoNombre(esquemaTurno.getStaffMedico().getMedico().getNombre());
            evento.setStaffMedicoApellido(esquemaTurno.getStaffMedico().getMedico().getApellido());
            evento.setEspecialidadStaffMedico(esquemaTurno.getStaffMedico().getMedico()
                    .getEspecialidad().getNombre());
            evento.setConsultorioId(esquemaTurno.getConsultorio().getId());
            evento.setConsultorioNombre(esquemaTurno.getConsultorio().getNombre());
            evento.setCentroId(esquemaTurno.getCentroAtencion().getId());
            evento.setNombreCentro(esquemaTurno.getCentroAtencion().getNombre());
            
            slots.add(evento);
            
            // Avanzar considerando sanitización
            slotStart = slotStart.plusMinutes(intervaloConSanitizacion);
        }
        
        return slots;
    }

    public List<Agenda> findAll() {
        List<Agenda> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Agenda findById(int id) {
        return repository.findById(id).orElse(null);
    }

    public Turno findTurnoById(int turnoId) {
        return turnoRepository.findById(turnoId).orElse(null);
    }

    public List<Agenda> findByConsultorio(Integer consultorioId) {
        return repository.findByEsquemaTurno_StaffMedico_Consultorio_Id(consultorioId);
    }

    public EsquemaTurno findEsquemaTurnoById(int esquemaTurnoId) {
        return esquemaTurnoRepository.findById(esquemaTurnoId)
                .orElseThrow(
                        () -> new IllegalArgumentException("EsquemaTurno no encontrado con ID: " + esquemaTurnoId));
    }

    public Page<Agenda> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    // public void cancelarAgendaYNotificarPacientes(int agendaId) {
    //     Agenda agenda = findById(agendaId);
    //     if (agenda == null)
    //         throw new IllegalArgumentException("Agenda no encontrada");

    //     // Buscar turnos programados de la agenda
    //     List<Turno> turnos = turnoRepository.findByAgenda_IdAndEstado(agendaId, EstadoTurno.PROGRAMADO);

    //     // Notificar a cada paciente y sugerir alternativas
    //     for (Turno turno : turnos) {
    //         List<Agenda> alternativas = sugerirAlternativas(turno);
    //         notificacionService.notificarCancelacion(turno.getPaciente(), agenda, alternativas);
    //         turno.setEstado(EstadoTurno.CANCELADO);
    //         turnoRepository.save(turno);
    //     }

    //     // Inhabilitar agenda
    //     agenda.setHabilitado(false);
    //     agenda.setMotivoInhabilitacion("Cancelada por el médico");
    //     repository.save(agenda);
    // }

    public List<Agenda> sugerirAlternativas(Turno turno) {
        // Acceder a consultorioId y especialidadId a través de StaffMedico y Medico
        Integer consultorioId = turno.getStaffMedico().getConsultorio().getId();
        Integer especialidadId = turno.getStaffMedico().getMedico().getEspecialidad().getId();
        return repository
                .findByEsquemaTurno_StaffMedico_Consultorio_IdAndEsquemaTurno_StaffMedico_Medico_Especialidad_IdAndHabilitadoTrue(
                        consultorioId,
                        especialidadId);
    }

    private static DayOfWeek parseDiaSemana(String dia) {
        // Eliminar acentos y convertir a mayúsculas
        String diaNormalizado = java.text.Normalizer.normalize(dia, java.text.Normalizer.Form.NFD)
                .replaceAll("[\\p{InCombiningDiacriticalMarks}]", "")
                .toUpperCase();

        return switch (diaNormalizado) {
            case "LUNES" -> DayOfWeek.MONDAY;
            case "MARTES" -> DayOfWeek.TUESDAY;
            case "MIERCOLES" -> DayOfWeek.WEDNESDAY;
            case "JUEVES" -> DayOfWeek.THURSDAY;
            case "VIERNES" -> DayOfWeek.FRIDAY;
            case "SABADO" -> DayOfWeek.SATURDAY;
            case "DOMINGO" -> DayOfWeek.SUNDAY;
            default -> throw new IllegalArgumentException("Día de semana inválido: " + dia);
        };
    }

    public List<TurnoDTO> generarEventosDesdeEsquemaTurno(EsquemaTurno esquemaTurno, int semanas) {
        List<TurnoDTO> eventos = new ArrayList<>();
        LocalDate hoy = LocalDate.now();
        int eventoIdCounter = 1; // Contador para generar IDs únicos
        
        // Ejecutar la optimización de distribución de consultorios si el esquema tiene centro de atención
        if (esquemaTurno.getCentroAtencion() != null) {
            optimizarDistribucionConsultorios(esquemaTurno.getCentroAtencion().getId(), hoy);
            
            // Si el médico tiene una especialidad, resolver posibles conflictos
            if (esquemaTurno.getStaffMedico() != null && 
                esquemaTurno.getStaffMedico().getMedico() != null && 
                esquemaTurno.getStaffMedico().getMedico().getEspecialidad() != null) {
                
                resolverConflictosConsultorios(
                    esquemaTurno.getCentroAtencion().getId(),
                    esquemaTurno.getStaffMedico().getMedico().getEspecialidad().getId(),
                    hoy
                );
            }
            
            // Recargar el esquema de turno para asegurarnos de tener la asignación de consultorio actualizada
            esquemaTurno = esquemaTurnoRepository.findById(esquemaTurno.getId())
                .orElseThrow(() -> new IllegalStateException("No se pudo recargar el esquema de turno"));
        }

        // Obtener los horarios del esquema desde la tabla esquema_turno_horarios
        List<EsquemaTurno.Horario> horarios = esquemaTurno.getHorarios();
        Consultorio consultorio = esquemaTurno.getConsultorio();

        // Validar que el consultorio no sea null
        if (consultorio == null) {
            throw new IllegalStateException(
                    "El consultorio asociado al EsquemaTurno con ID " + esquemaTurno.getId() + " es nulo.");
        }

        for (EsquemaTurno.Horario horario : horarios) {
            DayOfWeek dayOfWeek = parseDiaSemana(horario.getDia());
            LocalDate fecha = hoy.with(TemporalAdjusters.nextOrSame(dayOfWeek));            for (int i = 0; i < semanas; i++) {
                LocalDate fechaEvento = fecha.plusWeeks(i);

                // Verificar si existe una configuración excepcional para esta fecha usando el nuevo servicio
                boolean esFeriado = configuracionExcepcionalService.esFeriado(fechaEvento);
                boolean tieneMantenimiento = configuracionExcepcionalService.tieneMantenimiento(fechaEvento, consultorio.getId());
                Optional<ConfiguracionExcepcional> atencionEspecial = configuracionExcepcionalService.obtenerAtencionEspecial(fechaEvento, esquemaTurno.getId());
                
                // Si es feriado o mantenimiento, saltar este día
                if (esFeriado || tieneMantenimiento) {
                    continue;
                }
                
                // Si es atención especial, usar horarios específicos si están definidos
                if (atencionEspecial.isPresent()) {
                    ConfiguracionExcepcional config = atencionEspecial.get();
                    if (config.getHoraInicio() != null && config.getHoraFin() != null) {
                        // Generar slots con horario especial
                        eventos.addAll(generarSlotsParaHorario(fechaEvento, config.getHoraInicio(), config.getHoraFin(), 
                            esquemaTurno, config.getTiempoSanitizacion(), eventoIdCounter));
                        continue;
                    }
                }

                // Horario normal - obtener tiempo de sanitización
                int tiempoSanitizacion = atencionEspecial.map(ConfiguracionExcepcional::getTiempoSanitizacion).orElse(0);
                
                // NUEVA VALIDACIÓN: Verificar horarios del consultorio
                String diaSemana = fechaEvento.getDayOfWeek().name();
                if (!consultorioService.consultorioDisponibleEnHorario(consultorio.getId(), diaSemana, horario.getHoraInicio())) {
                    continue; // Saltar este día si el consultorio no está disponible
                }
                
                // Obtener información del consultorio
                Optional<ConsultorioDTO> consultorioOpt = consultorioService.findById(consultorio.getId());
                if (!consultorioOpt.isPresent()) {
                    continue; // Saltar si no se encuentra el consultorio
                }
                
                ConsultorioDTO consultorioDTO = consultorioOpt.get();
                
                // Generar slots dentro del horario intersección (esquema + consultorio)
                LocalTime slotStart = horario.getHoraInicio();
                LocalTime slotEnd = horario.getHoraFin();
                
                // Buscar el horario específico para este día de la semana
                if (consultorioDTO.getHorariosSemanales() != null && !consultorioDTO.getHorariosSemanales().isEmpty()) {
                    // Buscar el horario para este día de la semana
                    Optional<ConsultorioDTO.HorarioConsultorioDTO> horarioConsultorio = consultorioDTO.getHorariosSemanales().stream()
                        .filter(h -> h.getDiaSemana().equalsIgnoreCase(diaSemana) && h.getActivo())
                        .findFirst();
                    
                    // Aplicar restricciones de horario del consultorio
                    if (horarioConsultorio.isPresent()) {
                        ConsultorioDTO.HorarioConsultorioDTO hc = horarioConsultorio.get();
                        if (hc.getHoraApertura() != null && slotStart.isBefore(hc.getHoraApertura())) {
                            slotStart = hc.getHoraApertura();
                        }
                        if (hc.getHoraCierre() != null && slotEnd.isAfter(hc.getHoraCierre())) {
                            slotEnd = hc.getHoraCierre();
                        }
                    }
                } else if (consultorioDTO.getHoraAperturaDefault() != null && consultorioDTO.getHoraCierreDefault() != null) {
                    // Usar horarios por defecto si no hay horarios específicos
                    if (slotStart.isBefore(consultorioDTO.getHoraAperturaDefault())) {
                        slotStart = consultorioDTO.getHoraAperturaDefault();
                    }
                    if (slotEnd.isAfter(consultorioDTO.getHoraCierreDefault())) {
                        slotEnd = consultorioDTO.getHoraCierreDefault();
                    }
                }
                
                // Si no hay intersección válida, continuar con el siguiente horario
                if (slotStart.isAfter(slotEnd) || slotStart.equals(slotEnd)) {
                    continue;
                }
                
                int intervalo = esquemaTurno.getIntervalo(); // Intervalo en minutos
                int intervaloConSanitizacion = intervalo + tiempoSanitizacion;

                while (slotStart.isBefore(slotEnd)) {
                    LocalTime nextSlot = slotStart.plusMinutes(intervalo);

                    if (nextSlot.isAfter(slotEnd)) {
                        break;
                    }

                    // Verificar si existe un turno activo (no cancelado) para este slot
                    boolean slotOcupado = turnoRepository.existsByFechaAndHoraInicioAndStaffMedicoIdAndEstadoNot(
                            fechaEvento, slotStart, esquemaTurno.getStaffMedico().getId(), EstadoTurno.CANCELADO);

                    // Crear un DTO para el evento
                    TurnoDTO evento = new TurnoDTO();
                    evento.setId(eventoIdCounter++); // Asignar un ID único al evento
                    evento.setFecha(fechaEvento);
                    evento.setHoraInicio(slotStart);
                    evento.setHoraFin(nextSlot);
                    evento.setTitulo(slotOcupado ? "Ocupado" : "Disponible");

                    // Configurar campos de slot
                    evento.setEsSlot(true);
                    evento.setOcupado(slotOcupado);
                

                    // Asignar datos del esquema
                    evento.setStaffMedicoId(esquemaTurno.getStaffMedico().getId());
                    evento.setStaffMedicoNombre(esquemaTurno.getStaffMedico().getMedico().getNombre());
                    evento.setStaffMedicoApellido(esquemaTurno.getStaffMedico().getMedico().getApellido());
                    evento.setEspecialidadStaffMedico(esquemaTurno.getStaffMedico().getMedico()
                            .getEspecialidad().getNombre());
                    evento.setConsultorioId(consultorio.getId());
                    evento.setConsultorioNombre(consultorio.getNombre());
                    evento.setCentroId(esquemaTurno.getCentroAtencion().getId());
                    evento.setNombreCentro(esquemaTurno.getCentroAtencion().getNombre());
                    eventos.add(evento);
                    
                    // Avanzar considerando el tiempo de sanitización
                    slotStart = slotStart.plusMinutes(intervaloConSanitizacion);
                }
            }
        }

        return eventos;
    }

 
    /**
     * Este método ahora se maneja a través de ConfiguracionExcepcionalService.
     * Se mantiene para compatibilidad pero delega al nuevo servicio.
     */
    @Deprecated
    public void eliminarAgendaExcepcional(Integer agendaId) {
        // Este método está deprecado. 
        // Use ConfiguracionExcepcionalService.eliminarConfiguracion(configId) directamente.
        throw new UnsupportedOperationException("Use ConfiguracionExcepcionalService.eliminarConfiguracion() en su lugar");
    }    
    /**
     * Estos métodos están deprecados. Use ConfiguracionExcepcionalService para manejar días excepcionales.
     */
    @Deprecated
    public List<AgendaDTO.DiaExcepcionalDTO> convertirADiasExcepcionalesDTO(List<Agenda> agendas) {
        // Este método está deprecado.
        return new ArrayList<>();
    }
    
    /**
     * Este método está deprecado. Use ConfiguracionExcepcionalService para manejar días excepcionales.
     */
    @Deprecated
    public AgendaDTO.DiaExcepcionalDTO convertirADiaExcepcionalDTO(Agenda agenda) {
        // Este método está deprecado.
        AgendaDTO.DiaExcepcionalDTO dto = new AgendaDTO.DiaExcepcionalDTO();
        dto.setId(agenda.getId());
        dto.setFecha(agenda.getFecha().toString());
        // Los demás campos se manejan ahora en ConfiguracionExcepcionalService
        return dto;
    }

    /**
     * Asigna consultorios de manera equitativa entre especialidades.
     * Este método optimiza la distribución de consultorios entre médicos de diferentes 
     * especialidades en un centro médico específico.
     * 
     * @param centroAtencionId ID del centro de atención
     * @param fecha Fecha para la cual se realiza la distribución
     * @return Map con la asignación de consultorios (staffMedicoId -> consultorioId)
     */
    @Transactional
    public Map<Integer, Integer> optimizarDistribucionConsultorios(Integer centroAtencionId, LocalDate fecha) {
        String diaSemana = fecha.getDayOfWeek().name();
        
        // Usar el servicio especializado para distribuir consultorios
        Map<Integer, Integer> asignacion = consultorioDistribucionService.distribuirConsultorios(
            centroAtencionId, fecha, diaSemana);
        
        // Actualizar los EsquemaTurno con la nueva asignación de consultorios
        for (Map.Entry<Integer, Integer> entry : asignacion.entrySet()) {
            Integer staffMedicoId = entry.getKey();
            Integer consultorioId = entry.getValue();
            
            // Buscar todos los esquemas de turno para este médico
            List<EsquemaTurno> esquemas = esquemaTurnoRepository.findByStaffMedicoId(staffMedicoId);
            
            for (EsquemaTurno esquema : esquemas) {
                // Verificar si el horario del esquema incluye este día
                boolean incluyeEsteDia = esquema.getHorarios().stream()
                    .anyMatch(horario -> horario.getDia().equalsIgnoreCase(diaSemana));
                
                if (incluyeEsteDia) {
                    // Actualizar el consultorio asignado
                    Consultorio consultorio = new Consultorio();
                    consultorio.setId(consultorioId);
                    esquema.setConsultorio(consultorio);
                    esquemaTurnoRepository.save(esquema);
                }
            }
        }
        
        return asignacion;
    }
    
    /**
     * Resuelve conflictos cuando múltiples médicos de la misma especialidad
     * necesitan usar el mismo consultorio en horarios superpuestos.
     * 
     * @param centroAtencionId ID del centro de atención
     * @param especialidadId ID de la especialidad con conflictos
     * @param fecha Fecha para resolver conflictos
     */
    @Transactional
    public void resolverConflictosConsultorios(Integer centroAtencionId, Integer especialidadId, LocalDate fecha) {
        String diaSemana = fecha.getDayOfWeek().name();
        
        // Buscar todos los esquemas de turno para esta especialidad en este centro
        List<EsquemaTurno> esquemas = esquemaTurnoRepository.findByStaffMedico_Medico_Especialidad_IdAndCentroAtencion_Id(
            especialidadId, centroAtencionId);
        
        // Agrupar esquemas por consultorio
        Map<Integer, List<EsquemaTurno>> esquemasPorConsultorio = esquemas.stream()
            .collect(Collectors.groupingBy(e -> e.getConsultorio().getId()));
        
        // Para cada consultorio, verificar y resolver conflictos de horario
        for (Map.Entry<Integer, List<EsquemaTurno>> entry : esquemasPorConsultorio.entrySet()) {
            List<EsquemaTurno> esquemasMismoConsultorio = entry.getValue();
            
            // Si hay más de un esquema para el mismo consultorio, verificar conflictos
            if (esquemasMismoConsultorio.size() > 1) {
                resolverConflictosMismoConsultorio(esquemasMismoConsultorio, diaSemana);
            }
        }
    }
    
    /**
     * Resuelve conflictos de horario entre esquemas de turno que comparten consultorio.
     * 
     * @param esquemas Lista de esquemas que comparten consultorio
     * @param diaSemana Día de la semana para verificar conflictos
     */
    private void resolverConflictosMismoConsultorio(List<EsquemaTurno> esquemas, String diaSemana) {
        // Ordenar esquemas por prioridad (podría ser por cantidad de pacientes, antigüedad, etc.)
        // En este caso usamos el ID como criterio simple
        esquemas.sort((e1, e2) -> e1.getId().compareTo(e2.getId()));
        
        for (int i = 0; i < esquemas.size(); i++) {
            EsquemaTurno esquema1 = esquemas.get(i);
            
            // Solo procesar esquemas que tengan horarios para este día
            List<EsquemaTurno.Horario> horariosEsquema1 = esquema1.getHorarios().stream()
                .filter(h -> h.getDia().equalsIgnoreCase(diaSemana))
                .collect(Collectors.toList());
                
            if (horariosEsquema1.isEmpty()) {
                continue;
            }
            
            // Comparar con los demás esquemas de menor prioridad
            for (int j = i + 1; j < esquemas.size(); j++) {
                EsquemaTurno esquema2 = esquemas.get(j);
                
                List<EsquemaTurno.Horario> horariosEsquema2 = esquema2.getHorarios().stream()
                    .filter(h -> h.getDia().equalsIgnoreCase(diaSemana))
                    .collect(Collectors.toList());
                
                if (horariosEsquema2.isEmpty()) {
                    continue;
                }
                
                // Verificar si hay conflicto de horarios
                boolean hayConflicto = false;
                for (EsquemaTurno.Horario h1 : horariosEsquema1) {
                    for (EsquemaTurno.Horario h2 : horariosEsquema2) {
                        if (h1.getHoraInicio().isBefore(h2.getHoraFin()) && 
                            h1.getHoraFin().isAfter(h2.getHoraInicio())) {
                            hayConflicto = true;
                            break;
                        }
                    }
                    if (hayConflicto) break;
                }
                
                // Si hay conflicto, intentar reasignar el esquema de menor prioridad
                if (hayConflicto) {
                    // Buscar otro consultorio disponible
                    List<Consultorio> consultoriosDisponibles = consultorioService.findByCentroAtencionId(
                        esquema2.getCentroAtencion().getId())
                        .stream()
                        .filter(c -> !c.getId().equals(esquema2.getConsultorio().getId()))
                        .map(dto -> {
                            Consultorio c = new Consultorio();
                            c.setId(dto.getId());
                            return c;
                        })
                        .collect(Collectors.toList());
                    
                    if (!consultoriosDisponibles.isEmpty()) {
                        // Asignar el primer consultorio disponible
                        esquema2.setConsultorio(consultoriosDisponibles.get(0));
                        esquemaTurnoRepository.save(esquema2);
                    }
                    // Si no hay consultorios disponibles, queda en conflicto
                    // (se podría implementar una política más sofisticada)
                }
            }
        }
    }

    /**
     * Obtiene slots disponibles para un médico específico en las próximas semanas
     * 
     * @param staffMedicoId ID del staff médico
     * @param semanas Número de semanas a futuro para buscar slots
     * @return Lista de slots disponibles
     */
    public List<TurnoDTO> obtenerSlotsDisponiblesPorMedico(Integer staffMedicoId, int semanas) {
        List<TurnoDTO> slotsDisponibles = new ArrayList<>();
        
        // Buscar todos los esquemas de turno para este médico
        List<EsquemaTurno> esquemas = esquemaTurnoRepository.findByStaffMedicoId(staffMedicoId);
        
        if (esquemas.isEmpty()) {
            return slotsDisponibles;
        }
        
        // Generar slots para cada esquema en las próximas semanas
        LocalDate fechaInicio = LocalDate.now();
        
        for (EsquemaTurno esquema : esquemas) {
            List<TurnoDTO> slots = generarEventosDesdeEsquemaTurno(esquema, semanas);
            
            // Filtrar solo los slots disponibles (no ocupados)
            List<TurnoDTO> slotsLibres = slots.stream()
                .filter(slot -> slot.getOcupado() == null || !slot.getOcupado()) // Solo slots libres
                .filter(slot -> {
                    // Filtrar slots que sean de fechas futuras
                    LocalDate fechaSlot = slot.getFecha();
                    return !fechaSlot.isBefore(fechaInicio);
                })
                .collect(Collectors.toList());
            
            slotsDisponibles.addAll(slotsLibres);
        }
        
        // Ordenar por fecha y hora
        slotsDisponibles.sort((s1, s2) -> {
            int fechaComparison = s1.getFecha().compareTo(s2.getFecha());
            if (fechaComparison != 0) {
                return fechaComparison;
            }
            return s1.getHoraInicio().compareTo(s2.getHoraInicio());
        });
        
        return slotsDisponibles;
    }
}