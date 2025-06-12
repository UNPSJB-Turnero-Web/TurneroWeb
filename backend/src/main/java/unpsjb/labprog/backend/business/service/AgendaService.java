package unpsjb.labprog.backend.business.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
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
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.Consultorio;
import unpsjb.labprog.backend.model.EsquemaTurno;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Turno;

@Service
public class AgendaService {

    @Autowired
    AgendaRepository repository;

    @Autowired
    private TurnoRepository turnoRepository;

    @Autowired
    private EsquemaTurnoRepository esquemaTurnoRepository;

    // Nuevos métodos para gestionar días excepcionales y sanitización

    /**
     * Crear una agenda excepcional (feriado, mantenimiento, atención especial)
     */
    @Transactional
    public Agenda crearAgendaExcepcional(LocalDate fecha, Agenda.TipoAgenda tipo, String descripcion,
            Integer esquemaTurnoId, LocalTime horaInicio, LocalTime horaFin, Integer tiempoSanitizacion) {
        
        EsquemaTurno esquemaTurno = null;
        
        // Para feriados, el esquemaTurno es opcional (afecta todo el sistema)
        if (tipo != Agenda.TipoAgenda.FERIADO) {
            if (esquemaTurnoId == null) {
                throw new IllegalArgumentException("EsquemaTurno es requerido para " + tipo);
            }
            esquemaTurno = esquemaTurnoRepository.findById(esquemaTurnoId)
                    .orElseThrow(() -> new IllegalArgumentException("EsquemaTurno no encontrado"));
        }

        Agenda agenda = new Agenda();
        agenda.setFecha(fecha);
        agenda.setTipoAgenda(tipo);
        agenda.setDescripcionExcepcion(descripcion);
        agenda.setEsquemaTurno(esquemaTurno);  // Puede ser null para feriados
        agenda.setHabilitado(tipo != Agenda.TipoAgenda.FERIADO && tipo != Agenda.TipoAgenda.MANTENIMIENTO);

        if (horaInicio != null && horaFin != null) {
            agenda.setHoraInicio(horaInicio);
            agenda.setHoraFin(horaFin);
        }

        if (tiempoSanitizacion != null) {
            agenda.setTiempoSanitizacion(tiempoSanitizacion);
        }

        if (!agenda.isHabilitado()) {
            agenda.setMotivoInhabilitacion(descripcion);
        }

        return repository.save(agenda);
    }

    /**
     * Configurar tiempo de sanitización para un esquema de turno
     */
    @Transactional
    public void configurarSanitizacion(Integer esquemaTurnoId, Integer tiempoSanitizacion) {
        // Actualizar todas las agendas normales de este esquema
        List<Agenda> agendas = repository.findByEsquemaTurno_Id(esquemaTurnoId);
        for (Agenda agenda : agendas) {
            if (agenda.getTipoAgenda() == Agenda.TipoAgenda.NORMAL) {
                agenda.setTiempoSanitizacion(tiempoSanitizacion);
                repository.save(agenda);
            }
        }
    }

    /**
     * Verificar si una fecha es excepcional
     */
    public boolean esFechaExcepcional(LocalDate fecha, Integer esquemaTurnoId) {
        Optional<Agenda> agenda = repository.findByFechaAndEsquemaTurno_Id(fecha, esquemaTurnoId);
        return agenda.isPresent() && agenda.get().getTipoAgenda() != Agenda.TipoAgenda.NORMAL;
    }

    /**
     * Obtener agendas excepcionales por rango de fechas
     */
    public List<Agenda> obtenerAgendasExcepcionales(LocalDate fechaInicio, LocalDate fechaFin, Integer centroId) {
        if (centroId != null) {
            // Buscar todas las agendas excepcionales (no normales) para un centro específico
            return repository.findByFechaBetweenAndTipoAgendaNotAndEsquemaTurno_CentroAtencion_Id(
                    fechaInicio, fechaFin, Agenda.TipoAgenda.NORMAL, centroId);
        } else {
            // Cuando no hay filtro de centro, necesitamos combinar feriados y agendas con esquema
            List<Agenda> resultado = new ArrayList<>();
            
            // Buscar feriados (no tienen esquema de turno)
            List<Agenda> feriados = repository.findByFechaBetweenAndTipoAgenda(fechaInicio, fechaFin, Agenda.TipoAgenda.FERIADO);
            resultado.addAll(feriados);
            
            // Buscar mantenimientos y atención especial (sí tienen esquema de turno)
            List<Agenda> mantenimientos = repository.findByFechaBetweenAndTipoAgenda(fechaInicio, fechaFin, Agenda.TipoAgenda.MANTENIMIENTO);
            resultado.addAll(mantenimientos);
            
            List<Agenda> atencionEspecial = repository.findByFechaBetweenAndTipoAgenda(fechaInicio, fechaFin, Agenda.TipoAgenda.ATENCION_ESPECIAL);
            resultado.addAll(atencionEspecial);
            
            return resultado;
        }
    }

    /**
     * Validar disponibilidad considerando días excepcionales
     */
    public boolean validarDisponibilidad(LocalDate fecha, LocalTime horaInicio, Integer consultorioId,
            Integer staffMedicoId) {
        // Verificar si es feriado
        if (repository.existsByFechaAndTipoAgenda(fecha, Agenda.TipoAgenda.FERIADO)) {
            return false;
        }

        // Verificar si hay mantenimiento en el consultorio
        List<EsquemaTurno> esquemas = esquemaTurnoRepository.findByConsultorioId(consultorioId);
        for (EsquemaTurno esquema : esquemas) {
            if (repository.existsByFechaAndTipoAgendaAndEsquemaTurno_Id(
                    fecha, Agenda.TipoAgenda.MANTENIMIENTO, esquema.getId())) {
                return false;
            }
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

                // Verificar si existe una agenda excepcional para esta fecha
                Optional<Agenda> agendaExcepcional = repository.findByFechaAndEsquemaTurno_Id(fechaEvento, esquemaTurno.getId());
                
                if (agendaExcepcional.isPresent() && 
                    agendaExcepcional.get().getTipoAgenda() != Agenda.TipoAgenda.NORMAL) {
                    
                    // Si es feriado o mantenimiento, saltar este día
                    if (agendaExcepcional.get().getTipoAgenda() == Agenda.TipoAgenda.FERIADO ||
                        agendaExcepcional.get().getTipoAgenda() == Agenda.TipoAgenda.MANTENIMIENTO) {
                        continue;
                    }
                    
                    // Si es atención especial, usar horarios específicos si están definidos
                    if (agendaExcepcional.get().getTipoAgenda() == Agenda.TipoAgenda.ATENCION_ESPECIAL) {
                        LocalTime inicioEspecial = agendaExcepcional.get().getHoraInicio();
                        LocalTime finEspecial = agendaExcepcional.get().getHoraFin();
                        if (inicioEspecial != null && finEspecial != null) {
                            // Generar slots con horario especial
                            eventos.addAll(generarSlotsParaHorario(fechaEvento, inicioEspecial, finEspecial, 
                                esquemaTurno, agendaExcepcional.get().getTiempoSanitizacion(), eventoIdCounter));
                            continue;
                        }
                    }
                }

                // Horario normal - obtener tiempo de sanitización
                int tiempoSanitizacion = agendaExcepcional.map(Agenda::getTiempoSanitizacion).orElse(0);
                
                // Generar slots dentro del horario normal
                LocalTime slotStart = horario.getHoraInicio();
                LocalTime slotEnd = horario.getHoraFin();
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
                    
                    // El frontend se encargará de aplicar los colores según el estado
                    // No configuramos colores en el backend

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
     * Obtiene solo los slots disponibles (no ocupados) para un médico específico
     */
    public List<TurnoDTO> obtenerSlotsDisponiblesPorMedico(Integer staffMedicoId, int semanas) {
        // Buscar esquemas de turno para el médico específico
        List<EsquemaTurno> esquemasMedico = esquemaTurnoRepository.findByStaffMedicoId(staffMedicoId);

        List<TurnoDTO> slotsDisponibles = new ArrayList<>();

        for (EsquemaTurno esquema : esquemasMedico) {
            List<TurnoDTO> todosLosSlots = generarEventosDesdeEsquemaTurno(esquema, semanas);

            // Filtrar solo los slots disponibles (no ocupados) y que sean del futuro
            LocalDate hoy = LocalDate.now();
            LocalTime ahora = LocalTime.now();

            for (TurnoDTO slot : todosLosSlots) {
                boolean esFuturo = slot.getFecha().isAfter(hoy)
                        || (slot.getFecha().equals(hoy) && slot.getHoraInicio().isAfter(ahora));

                if (!slot.getOcupado() && esFuturo && slot.getEsSlot()) {
                    slotsDisponibles.add(slot);
                }
            }
        }

        return slotsDisponibles;
    }
    
    /**
     * Elimina una agenda excepcional por su ID
     */
    public void eliminarAgendaExcepcional(Integer agendaId) {
        Agenda agenda = repository.findById(agendaId)
            .orElseThrow(() -> new RuntimeException("Agenda no encontrada con ID: " + agendaId));
        
        // Verificar que sea una agenda excepcional
        if (agenda.getTipoAgenda() == null || 
            (agenda.getTipoAgenda() != Agenda.TipoAgenda.FERIADO && 
             agenda.getTipoAgenda() != Agenda.TipoAgenda.MANTENIMIENTO && 
             agenda.getTipoAgenda() != Agenda.TipoAgenda.ATENCION_ESPECIAL)) {
            throw new RuntimeException("Solo se pueden eliminar agendas excepcionales");
        }
        
        // Verificar que no tenga turnos asociados
        // Verificamos si hay turnos activos en la fecha de la agenda excepcional para ese médico
        if (agenda.getEsquemaTurno() != null && agenda.getEsquemaTurno().getStaffMedico() != null) {
            boolean hasTurnos = turnoRepository.existsByFechaAndStaffMedico_Id(
                agenda.getFecha(), agenda.getEsquemaTurno().getStaffMedico().getId());
            if (hasTurnos) {
                throw new RuntimeException("No se puede eliminar la agenda porque tiene turnos asociados en esa fecha");
            }
        }
        
        repository.delete(agenda);
    }    
    /**
     * Convierte una lista de entidades Agenda a DTOs para días excepcionales
     */
    public List<AgendaDTO.DiaExcepcionalDTO> convertirADiasExcepcionalesDTO(List<Agenda> agendas) {
        return agendas.stream().map(this::convertirADiaExcepcionalDTO).collect(Collectors.toList());
    }
    
    /**
     * Convierte una entidad Agenda a DTO para día excepcional
     */
    public AgendaDTO.DiaExcepcionalDTO convertirADiaExcepcionalDTO(Agenda agenda) {
        AgendaDTO.DiaExcepcionalDTO dto = new AgendaDTO.DiaExcepcionalDTO();
        dto.setId(agenda.getId());
        dto.setFecha(agenda.getFecha().toString()); // Formato ISO yyyy-MM-dd
        dto.setTipoAgenda(agenda.getTipoAgenda() != null ? agenda.getTipoAgenda().toString() : null);
        dto.setDescripcion(agenda.getDescripcionExcepcion());
        
        if (agenda.getHoraInicio() != null) {
            dto.setApertura(agenda.getHoraInicio().toString()); // Formato HH:mm
        }
        if (agenda.getHoraFin() != null) {
            dto.setCierre(agenda.getHoraFin().toString()); // Formato HH:mm
        }
        
        // Mapear información del esquema de turno (si existe)
        if (agenda.getEsquemaTurno() != null) {
            EsquemaTurno esquema = agenda.getEsquemaTurno();
            
            // Centro de atención
            if (esquema.getCentroAtencion() != null) {
                dto.setCentroId(esquema.getCentroAtencion().getId());
                dto.setCentroNombre(esquema.getCentroAtencion().getNombre());
            }
            
            // Médico
            if (esquema.getStaffMedico() != null && esquema.getStaffMedico().getMedico() != null) {
                dto.setMedicoId(esquema.getStaffMedico().getMedico().getId());
                dto.setMedicoNombre(esquema.getStaffMedico().getMedico().getNombre());
                dto.setMedicoApellido(esquema.getStaffMedico().getMedico().getApellido());
                
                if (esquema.getStaffMedico().getMedico().getEspecialidad() != null) {
                    dto.setEspecialidad(esquema.getStaffMedico().getMedico().getEspecialidad().getNombre());
                }
            }
            
            // Consultorio
            if (esquema.getConsultorio() != null) {
                dto.setConsultorioId(esquema.getConsultorio().getId());
                dto.setConsultorioNombre(esquema.getConsultorio().getNombre());
            }
        }
        
        return dto;
    }

}