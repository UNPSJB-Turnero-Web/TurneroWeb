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
import unpsjb.labprog.backend.dto.AgendaDTO;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.DisponibilidadMedico;
import unpsjb.labprog.backend.model.EsquemaTurno;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Paciente;
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

    public void cancelarAgendaYNotificarPacientes(int agendaId) {
        Agenda agenda = findById(agendaId);
        if (agenda == null)
            throw new IllegalArgumentException("Agenda no encontrada");

        // Buscar turnos pendientes de la agenda
        List<Turno> turnos = turnoRepository.findByAgenda_IdAndEstado(agendaId, EstadoTurno.PENDIENTE);

        // Notificar a cada paciente y sugerir alternativas
        for (Turno turno : turnos) {
            List<Agenda> alternativas = sugerirAlternativas(turno);
            notificacionService.notificarCancelacion(turno.getPaciente(), agenda, alternativas);
            turno.setEstado(EstadoTurno.CANCELADO);
            turnoRepository.save(turno);
        }

        // Inhabilitar agenda
        agenda.setHabilitado(false);
        agenda.setMotivoInhabilitacion("Cancelada por el médico");
        repository.save(agenda);
    }

    public List<Agenda> sugerirAlternativas(Turno turno) {
        // Acceder a consultorioId y especialidadId a través de StaffMedico y Medico
        Integer consultorioId = turno.getStaffMedico().getConsultorio().getId();
        Integer especialidadId = turno.getStaffMedico().getMedico().getEspecialidad().getId();
        return repository
                .findByEsquemaTurno_StaffMedico_Consultorio_IdAndEsquemaTurno_StaffMedico_Medico_Especialidad_IdAndHabilitadoTrue(
                        consultorioId,
                        especialidadId);
    }

    public List<AgendaDTO.SlotDTO> generarSlots(LocalDate fecha, LocalTime horaInicio, LocalTime horaFin, int intervalo,
            Integer centroAtencionId, String centroAtencionNombre, Integer consultorioId, String consultorioNombre,
            Integer medicoId, String medicoNombre) {
        List<AgendaDTO.SlotDTO> slots = new ArrayList<>();

        LocalTime slotStart = horaInicio;
        while (slotStart.isBefore(horaFin)) {
            LocalTime slotEnd = slotStart.plusMinutes(intervalo);
            if (slotEnd.isAfter(horaFin)) {
                break;
            }

            AgendaDTO.SlotDTO slot = new AgendaDTO.SlotDTO();
            slot.setFecha(fecha.toString());
            slot.setDiaSemana(fecha.getDayOfWeek().toString());
            slot.setHoraInicio(slotStart.toString());
            slot.setHoraFin(slotEnd.toString());
            slot.setInhabilitado(false); // Por defecto, los slots están habilitados
            slot.setCentroAtencionId(centroAtencionId);
            slot.setCentroAtencionNombre(centroAtencionNombre);
            slot.setConsultorioId(consultorioId);
            slot.setConsultorioNombre(consultorioNombre);
            slot.setMedicoId(medicoId);
            slot.setMedicoNombre(medicoNombre);

            slots.add(slot);
            slotStart = slotEnd; // Avanzar al siguiente slot
        }

        return slots;
    }

    public List<AgendaDTO> generarAgendaDesdeEsquemaTurno(EsquemaTurno esquemaTurno, int semanas) {
        List<AgendaDTO> agendas = new ArrayList<>();
        LocalDate hoy = LocalDate.now();

        // Obtener los horarios definidos en el esquema de turno
        List<EsquemaTurno.Horario> horarios = esquemaTurno.getHorarios(); // Ajustar para usar horarios del esquema

        for (EsquemaTurno.Horario horario : horarios) {
            DayOfWeek dayOfWeek = parseDiaSemana(horario.getDia());
            LocalDate fecha = hoy.with(TemporalAdjusters.nextOrSame(dayOfWeek));
            for (int i = 0; i < semanas; i++) {
                AgendaDTO agenda = new AgendaDTO();
                agenda.setDiaInicio(fecha.toString());
                agenda.setDiaFin(fecha.plusWeeks(i).toString());

                // Generar los slots para este día
                List<AgendaDTO.SlotDTO> slots = generarSlots(
                        fecha.plusWeeks(i),
                        horario.getHoraInicio(),
                        horario.getHoraFin(),
                        esquemaTurno.getIntervalo(),
                        esquemaTurno.getCentroAtencion().getId(),
                        esquemaTurno.getCentroAtencion().getNombre(),
                        null, // No necesitamos consultorioId
                        null, // No necesitamos consultorioNombre
                        esquemaTurno.getStaffMedico().getMedico().getId(),
                        esquemaTurno.getStaffMedico().getMedico().getNombre());

                AgendaDTO.DiaDTO diaDTO = new AgendaDTO.DiaDTO();
                diaDTO.setFecha(fecha.plusWeeks(i).toString());
                diaDTO.setDiaSemana(fecha.getDayOfWeek().toString());
                diaDTO.setApertura(horario.getHoraInicio().toString());
                diaDTO.setCierre(horario.getHoraFin().toString());
                diaDTO.setSlots(slots);

                agenda.setDias(List.of(diaDTO));
                agendas.add(agenda);
            }
        }

        return agendas;
    }

    private static DayOfWeek parseDiaSemana(String dia) {
        switch (dia.toUpperCase()) {
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

        // Obtener los horarios del esquema
        List<DisponibilidadMedico.DiaHorario> horarios = esquemaTurno.getDisponibilidadMedico().getHorarios();

        for (DisponibilidadMedico.DiaHorario horario : horarios) {
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

                    // Crear un DTO para el evento
                    TurnoDTO evento = new TurnoDTO();
                    evento.setFecha(fechaEvento);
                    evento.setHoraInicio(slotStart);
                    evento.setHoraFin(nextSlot);
                    evento.setTitulo("Turno (" + horario.getDia() + ")");

                    // Asignar datos del esquema
                    evento.setStaffMedicoId(esquemaTurno.getStaffMedico().getId());
                    evento.setStaffMedicoNombre(esquemaTurno.getStaffMedico().getMedico().getNombre());
                    evento.setConsultorioId(esquemaTurno.getStaffMedico().getConsultorio().getId());
                    evento.setConsultorioNombre(esquemaTurno.getStaffMedico().getConsultorio().getNombre());
                    evento.setCentroId(esquemaTurno.getStaffMedico().getCentroAtencion().getId());
                    evento.setNombreCentro(esquemaTurno.getStaffMedico().getCentroAtencion().getNombre());
                    eventos.add(evento);
                    slotStart = nextSlot;
                }
            }
        }

        return eventos;
    }

    public Turno guardarTurno(TurnoDTO turnoDTO, EsquemaTurno esquemaTurno) {
        Turno turno = new Turno();

        // Asignar datos básicos del turno
        turno.setFecha(turnoDTO.getFecha());
        turno.setHoraInicio(turnoDTO.getHoraInicio());
        turno.setHoraFin(turnoDTO.getHoraFin());
        turno.setEstado(EstadoTurno.PENDIENTE); // Estado inicial

        // Buscar y asignar el paciente
        if (turnoDTO.getPacienteId() != null) {
            Paciente paciente = pacienteRepository.findById(turnoDTO.getPacienteId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Paciente no encontrado con ID: " + turnoDTO.getPacienteId()));
            turno.setPaciente(paciente);
        }

        // Buscar y asignar el staff médico

        // Asignar el staff médico y consultorio directamente desde el EsquemaTurno
        turno.setStaffMedico(esquemaTurno.getStaffMedico());
        turno.setConsultorio(esquemaTurno.getStaffMedico().getConsultorio());

        return turnoRepository.save(turno);
    }

    public AgendaDTO generarAgendaConfigurablePorConsultorio(Integer consultorioId, LocalDate desde, LocalDate hasta) {
        // Obtener esquemas de turno asociados al consultorio
        List<EsquemaTurno> esquemasTurno = esquemaTurnoRepository.findByStaffMedicoId(consultorioId);

        AgendaDTO agendaDTO = new AgendaDTO();
        agendaDTO.setDiaInicio(desde.toString());
        agendaDTO.setDiaFin(hasta.toString());
        agendaDTO.setDias(new ArrayList<>());

        for (EsquemaTurno esquemaTurno : esquemasTurno) {
            List<DisponibilidadMedico.DiaHorario> horarios = esquemaTurno.getDisponibilidadMedico().getHorarios();
            for (DisponibilidadMedico.DiaHorario horario : horarios) {
                LocalDate fecha = desde;
                while (!fecha.isAfter(hasta)) {
                    if (fecha.getDayOfWeek() == parseDiaSemana(horario.getDia())) {
                        AgendaDTO.DiaDTO diaDTO = new AgendaDTO.DiaDTO();
                        diaDTO.setFecha(fecha.toString());
                        diaDTO.setDiaSemana(fecha.getDayOfWeek().toString());
                        diaDTO.setApertura(horario.getHoraInicio().toString());
                        diaDTO.setCierre(horario.getHoraFin().toString());

                        // Generar slots para el día
                        List<AgendaDTO.SlotDTO> slots = generarSlots(
                                fecha,
                                horario.getHoraInicio(),
                                horario.getHoraFin(),
                                esquemaTurno.getIntervalo(),
                                esquemaTurno.getStaffMedico().getConsultorio().getCentroAtencion().getId(),
                                esquemaTurno.getStaffMedico().getConsultorio().getCentroAtencion().getNombre(),
                                esquemaTurno.getStaffMedico().getConsultorio().getId(),
                                esquemaTurno.getStaffMedico().getConsultorio().getNombre(),
                                esquemaTurno.getStaffMedico().getMedico().getId(),
                                esquemaTurno.getStaffMedico().getMedico().getNombre());

                        diaDTO.setSlots(slots);
                        agendaDTO.getDias().add(diaDTO);
                    }
                    fecha = fecha.plusDays(1);
                }
            }
        }

        return agendaDTO;
    }
}