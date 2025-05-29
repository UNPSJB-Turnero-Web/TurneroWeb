package unpsjb.labprog.backend.business.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.AgendaRepository;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.dto.AgendaDTO;
import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.DisponibilidadMedico;
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

    public Agenda save(Agenda agenda) {
        // 1. Validar superposición de horarios en el consultorio
        Integer consultorioId = agenda.getEsquemaTurno() != null && agenda.getEsquemaTurno().getStaffMedico() != null
                && agenda.getEsquemaTurno().getStaffMedico().getConsultorio() != null
                ? agenda.getEsquemaTurno().getStaffMedico().getConsultorio().getId()
                : null;
        if (consultorioId != null) {
            List<Agenda> agendasConsultorio = repository.findByEsquemaTurno_StaffMedico_Consultorio_Id(consultorioId);
            for (Agenda a : agendasConsultorio) {
                if (!a.getId().equals(agenda.getId()) && horariosSeSuperponen((LocalTime) a.getHoraInicio(), (LocalTime) a.getHoraFin(),
                        (LocalTime) agenda.getHoraInicio(), (LocalTime) agenda.getHoraFin())) {
                    throw new IllegalArgumentException("Ya existe una agenda en ese horario para este consultorio.");
                }
            }
        }

        // 2. Validar médico no en dos consultorios al mismo tiempo
        Integer medicoId = agenda.getEsquemaTurno() != null && agenda.getEsquemaTurno().getStaffMedico() != null
                && agenda.getEsquemaTurno().getStaffMedico().getMedico() != null
                ? agenda.getEsquemaTurno().getStaffMedico().getMedico().getId()
                : null;
        if (medicoId != null) {
            List<Agenda> agendasMedico = repository.findByEsquemaTurno_StaffMedico_Medico_Id(medicoId);
            for (Agenda a : agendasMedico) {
                if (!a.getId().equals(agenda.getId()) && horariosSeSuperponen((LocalTime) a.getHoraInicio(), (LocalTime) a.getHoraFin(),
                        (LocalTime) agenda.getHoraInicio(), (LocalTime) agenda.getHoraFin())) {
                    throw new IllegalArgumentException("El médico ya tiene asignación en otro consultorio en ese horario.");
                }
            }
        }

        // 3. Validar tiempo mínimo de consulta por especialidad
        // Si tu modelo Agenda no tiene especialidad directa, puedes omitir esta validación o tomarla del staffMedico
        // int duracionMinima = obtenerDuracionMinimaPorEspecialidad(...);

        // 4. Validar bloques reservados (cirugías, sanitización, etc.)
        // Eliminado: No se usa más BloqueHorario ni getBloquesReservados()

        // 5. Validar feriados y días excepcionales
        if (!agenda.isHabilitado()) {
            throw new IllegalArgumentException(
                    "El consultorio está inhabilitado temporalmente: " + agenda.getMotivoInhabilitacion());
        }

        // 6. Validar tolerancia entre turnos
        int tolerancia = agenda.getTiempoTolerancia() != null ? agenda.getTiempoTolerancia() : 0;
        if (consultorioId != null) {
            List<Agenda> agendasConsultorio = repository.findByEsquemaTurno_StaffMedico_Consultorio_Id(consultorioId);
            for (Agenda a : agendasConsultorio) {
                if (!a.getId().equals(agenda.getId())) {
                    if (a.getHoraFin() != null && agenda.getHoraInicio() != null) {
                        if (a.getHoraFin() != null && agenda.getHoraInicio() != null &&
                            Math.abs(((LocalTime) a.getHoraFin()).toSecondOfDay() - ((LocalTime) agenda.getHoraInicio()).toSecondOfDay()) < tolerancia * 60
                                || Math.abs(((LocalTime) agenda.getHoraFin()).toSecondOfDay() - ((LocalTime) a.getHoraInicio()).toSecondOfDay()) < tolerancia * 60) {
                            throw new IllegalArgumentException(
                                    "No se respeta el tiempo de tolerancia entre agendas en este consultorio.");
                        }
                    }
                }
            }
        }

        return repository.save(agenda);
    }

    public Page<Agenda> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    public void delete(Integer id) {
        repository.deleteById(id);
    }

    public void deleteAll() {
        repository.deleteAll();
    }

    // ADAPTADO: Usa solo SlotDTO como bloque/slot
    public List<Agenda> saveFromDTO(AgendaDTO dto) {
        List<Agenda> agendas = new ArrayList<>();
        if (dto.getDias() != null) {
            for (AgendaDTO.DiaDTO diaDTO : dto.getDias()) {
                Agenda agenda = new Agenda();
                agenda.setFecha(LocalDate.parse(diaDTO.getFecha()));
                agenda.setHoraInicio(LocalTime.parse(diaDTO.getApertura()));
                agenda.setHoraFin(LocalTime.parse(diaDTO.getCierre()));
                agenda.setHabilitado(diaDTO.getInhabilitado() != null ? !diaDTO.getInhabilitado() : true);
                agenda.setMotivoInhabilitacion(diaDTO.getMotivoInhabilitacion());

                // Si quieres guardar los slots como JSON o en otra tabla, deberás adaptar aquí.
                // Si no, simplemente ignora los slots en la entidad Agenda.

                agendas.add(agenda);
            }
        }
        List<Agenda> saved = new ArrayList<>();
        repository.saveAll(agendas).forEach(saved::add);
        return saved;
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
        return repository.findByEsquemaTurno_StaffMedico_Consultorio_IdAndEsquemaTurno_StaffMedico_Medico_Especialidad_IdAndHabilitadoTrue(
                consultorioId,
                especialidadId);
    }

    public List<Agenda> generarAgendaDesdeEsquemaTurno(EsquemaTurno esquemaTurno, int semanas) {
        List<Agenda> agendas = new ArrayList<>();
        LocalDate hoy = LocalDate.now();

        // Obtener los horarios de la disponibilidad médica asociada al esquema de turno
        List<DisponibilidadMedico.DiaHorario> horarios = esquemaTurno.getDisponibilidadMedico().getHorarios();

        for (DisponibilidadMedico.DiaHorario horario : horarios) {
            DayOfWeek dayOfWeek = parseDiaSemana(horario.getDia());
            LocalDate fecha = hoy.with(TemporalAdjusters.nextOrSame(dayOfWeek));
            for (int i = 0; i < semanas; i++) {
                Agenda agenda = new Agenda();
                agenda.setHoraInicio(horario.getHoraInicio());
                agenda.setHoraFin(horario.getHoraFin());
                agenda.setFecha(fecha.plusWeeks(i));
                agenda.setEsquemaTurno(esquemaTurno);
                agenda.setHabilitado(true);
                agenda.setMotivoInhabilitacion(null);
                agendas.add(agenda);
            }
        }

        List<Agenda> saved = new ArrayList<>();
        repository.saveAll(agendas).forEach(saved::add);
        return saved;
    }

    private static DayOfWeek parseDiaSemana(String dia) {
        switch (dia.toUpperCase()) {
            case "LUNES": return DayOfWeek.MONDAY;
            case "MARTES": return DayOfWeek.TUESDAY;
            case "MIERCOLES": return DayOfWeek.WEDNESDAY;
            case "JUEVES": return DayOfWeek.THURSDAY;
            case "VIERNES": return DayOfWeek.FRIDAY;
            case "SABADO": return DayOfWeek.SATURDAY;
            case "DOMINGO": return DayOfWeek.SUNDAY;
            default: throw new IllegalArgumentException("Día de semana inválido: " + dia);
        }
    }

   

    public AgendaDTO getAgendaConfigurablePorConsultorio(Integer consultorioId, LocalDate desde, LocalDate hasta) {
        List<Agenda> agendas = repository.findByEsquemaTurno_StaffMedico_Consultorio_Id(consultorioId)
            .stream()
            .filter(a -> !a.getFecha().isBefore(desde) && !a.getFecha().isAfter(hasta))
            .collect(Collectors.toList());

        AgendaDTO dto = new AgendaDTO();
        dto.setDiaInicio(desde.toString());
        dto.setDiaFin(hasta.toString());
        dto.setDias(new ArrayList<>());

        for (Agenda agenda : agendas) {
            AgendaDTO.DiaDTO diaDTO = new AgendaDTO.DiaDTO();
            diaDTO.setFecha(agenda.getFecha().toString());
            diaDTO.setDiaSemana(agenda.getFecha().getDayOfWeek().toString());
            diaDTO.setApertura(agenda.getHoraInicio() != null ? agenda.getHoraInicio().toString() : null);
            diaDTO.setCierre(agenda.getHoraFin() != null ? agenda.getHoraFin().toString() : null);
            diaDTO.setInhabilitado(!agenda.isHabilitado());
            diaDTO.setMotivoInhabilitacion(agenda.getMotivoInhabilitacion());
            diaDTO.setSlots(new ArrayList<>()); // Si quieres exponer slots, deberás generarlos aquí

            // Si tienes lógica para generar slots a partir de la agenda, agrégala aquí.
            // Por ejemplo, podrías calcular los slots en base a la horaInicio, horaFin e intervalo.

            dto.getDias().add(diaDTO);
        }

        if (!agendas.isEmpty() && agendas.get(0).getEsquemaTurno() != null) {
            dto.setEspecialidadId(agendas.get(0).getEsquemaTurno().getStaffMedico().getMedico().getEspecialidad().getId());
            dto.setEspecialidadNombre(agendas.get(0).getEsquemaTurno().getStaffMedico().getMedico().getEspecialidad().getNombre());
        }

        return dto;
    }
}