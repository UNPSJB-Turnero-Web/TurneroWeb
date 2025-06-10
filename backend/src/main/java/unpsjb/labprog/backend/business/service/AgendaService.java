package unpsjb.labprog.backend.business.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.AgendaRepository;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.business.repository.PacienteRepository;
import unpsjb.labprog.backend.business.repository.TurnoRepository;
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
    private PacienteRepository pacienteRepository;

    @Autowired
    private EsquemaTurnoRepository esquemaTurnoRepository;

    @Autowired
    private NotificacionService notificacionService;

    @Autowired
    private PacienteService pacienteService;

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

    private boolean horariosSeSuperponen(LocalTime inicio1, LocalTime fin1, LocalTime inicio2, LocalTime fin2) {
        return !inicio1.isAfter(fin2) && !inicio2.isAfter(fin1);
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

        switch (diaNormalizado) {
            case "LUNES":
                return DayOfWeek.MONDAY;
            case "MARTES":
                return DayOfWeek.TUESDAY;
            case "MIERCOLES":
                return DayOfWeek.WEDNESDAY;
            case "JUEVES":
                return DayOfWeek.THURSDAY;
            case "VIERNES":
                return DayOfWeek.FRIDAY;
            case "SABADO":
                return DayOfWeek.SATURDAY;
            case "DOMINGO":
                return DayOfWeek.SUNDAY;
            default:
                throw new IllegalArgumentException("Día de semana inválido: " + dia);
        }
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
            LocalDate fecha = hoy.with(TemporalAdjusters.nextOrSame(dayOfWeek));

            for (int i = 0; i < semanas; i++) {
                LocalDate fechaEvento = fecha.plusWeeks(i);

                // Generar slots dentro del horario
                LocalTime slotStart = horario.getHoraInicio();
                LocalTime slotEnd = horario.getHoraFin();
                int intervalo = esquemaTurno.getIntervalo(); // Intervalo en minutos

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
                    slotStart = nextSlot;
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
                boolean esFuturo = slot.getFecha().isAfter(hoy) || 
                                 (slot.getFecha().equals(hoy) && slot.getHoraInicio().isAfter(ahora));
                
                if (!slot.getOcupado() && esFuturo && slot.getEsSlot()) {
                    slotsDisponibles.add(slot);
                }
            }
        }
        
        return slotsDisponibles;
    }

  
}