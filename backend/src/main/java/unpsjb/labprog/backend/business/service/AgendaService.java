package unpsjb.labprog.backend.business.service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Calendar;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.AgendaRepository;
import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.business.repository.EspecialidadRepository;
import unpsjb.labprog.backend.business.repository.MedicoRepository;
import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.dto.AgendaDTO;
import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.BloqueHorario;
import unpsjb.labprog.backend.model.Especialidad;
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
    private ConsultorioRepository consultorioRepository;
    @Autowired
    private MedicoRepository medicoRepository;
    @Autowired
    private EspecialidadRepository especialidadRepository;
    @Autowired
    private NotificacionService notificacionService; // Stub para notificaciones

    public List<Agenda> findAll() {
        List<Agenda> result = new ArrayList<>();
        repository.findAll().forEach(result::add);
        return result;
    }

    public Agenda findById(int id) {
        return repository.findById(id).orElse(null);
    }

    public Turno findTurnoById(int turnoId) {
        return turnoRepository.findById(Long.valueOf(turnoId)).orElse(null);
    }

    public List<Agenda> findByConsultorio(Long consultorioId) {
        return repository.findByConsultorioId(consultorioId);
    }

    public Agenda save(Agenda agenda) {
        // 1. Validar superposición de horarios en el consultorio
        List<Agenda> agendasConsultorio = repository.findByConsultorioId(Long.valueOf(agenda.getConsultorio().getId()));
        for (Agenda a : agendasConsultorio) {
            if (a.getId() != agenda.getId() && horariosSeSuperponen(a.getHoraInicio(), a.getHoraFin(),
                    agenda.getHoraInicio(), agenda.getHoraFin())) {
                throw new IllegalArgumentException("Ya existe una agenda en ese horario para este consultorio.");
            }
        }

        // 2. Validar médico no en dos consultorios al mismo tiempo
        List<Agenda> agendasMedico = repository.findByMedicoId(agenda.getMedico().getId());
        for (Agenda a : agendasMedico) {
            if (a.getId() != agenda.getId() && horariosSeSuperponen(a.getHoraInicio(), a.getHoraFin(),
                    agenda.getHoraInicio(), agenda.getHoraFin())) {
                throw new IllegalArgumentException("El médico ya tiene asignación en otro consultorio en ese horario.");
            }
        }

        // 3. Validar tiempo mínimo de consulta por especialidad
        int duracionMinima = obtenerDuracionMinimaPorEspecialidad(agenda.getEspecialidad());
        if (agenda.getHoraFin().minusMinutes(duracionMinima).isBefore(agenda.getHoraInicio())) {
            throw new IllegalArgumentException(
                    "La duración de la agenda es menor al mínimo permitido para la especialidad.");
        }

        // 4. Validar bloques reservados (cirugías, sanitización, etc.)
        if (agenda.getBloquesReservados() != null) {
            for (BloqueHorario bloque : agenda.getBloquesReservados()) {
                if (horariosSeSuperponen(agenda.getHoraInicio(), agenda.getHoraFin(), bloque.getHoraInicio(),
                        bloque.getHoraFin())) {
                    throw new IllegalArgumentException(
                            "Hay un bloque reservado (ej: " + bloque.getMotivo() + ") que se superpone con la agenda.");
                }
            }
        }

        // 5. Validar feriados y días excepcionales (puedes tener una lista de fechas
        // bloqueadas)
        // Ejemplo simple: si la agenda está inhabilitada por mantenimiento/sanitización
        if (!agenda.isHabilitado()) {
            throw new IllegalArgumentException(
                    "El consultorio está inhabilitado temporalmente: " + agenda.getMotivoInhabilitacion());
        }

        // 6. Validar tolerancia entre turnos (si tienes lógica de turnos, verifica que
        // entre agendas no haya menos de X minutos)
        // Ejemplo simple:
        int tolerancia = agenda.getTiempoTolerancia() != null ? agenda.getTiempoTolerancia() : 0;
        for (Agenda a : agendasConsultorio) {
            if (a.getId() != agenda.getId()) {
                if (Math.abs(a.getHoraFin().toSecondOfDay() - agenda.getHoraInicio().toSecondOfDay()) < tolerancia * 60
                        ||
                        Math.abs(agenda.getHoraFin().toSecondOfDay() - a.getHoraInicio().toSecondOfDay()) < tolerancia
                                * 60) {
                    throw new IllegalArgumentException(
                            "No se respeta el tiempo de tolerancia entre agendas en este consultorio.");
                }
            }
        }

        // 7. (Opcional) Validar que los bloques de urgencia o especialidad exclusiva no
        // se superpongan con agendas normales
        // ...

        return repository.save(agenda);
    }

    public Page<Agenda> findByPage(int page, int size) {
        return repository.findAll(PageRequest.of(page, size));
    }

    public void delete(int id) {
        repository.deleteById(id);
    }

    public void deleteAll() {
    repository.deleteAll();
}

    public Agenda saveFromDTO(AgendaDTO dto) {
        Agenda agenda = (dto.getId() != null) ? findById(dto.getId()) : new Agenda();
        // Mapear campos simples
        agenda.setHoraInicio(dto.getHoraInicio());
        agenda.setHoraFin(dto.getHoraFin());
        agenda.setHabilitado(dto.getHabilitado() != null ? dto.getHabilitado() : true);
        agenda.setMotivoInhabilitacion(dto.getMotivoInhabilitacion());
        // Mapear relaciones (consultorio, medico, especialidad) según tus repositorios
        agenda.setConsultorio(consultorioRepository.findById(dto.getConsultorioId()).orElse(null));
        agenda.setMedico(medicoRepository.findById(dto.getMedicoId() != null ? dto.getMedicoId().longValue() : null)
                .orElse(null));
        agenda.setEspecialidad(especialidadRepository.findById(dto.getEspecialidadId()).orElse(null));
        // Mapear listas y bloques reservados según tu modelo
        return save(agenda);
    }

    // Ejemplo de método auxiliar para duración mínima
    private int obtenerDuracionMinimaPorEspecialidad(Especialidad especialidad) {
        // Puedes obtenerlo de la entidad Especialidad o parametrizarlo
        // Ejemplo fijo:
        return 20; // minutos
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
            // Cambiar estado del turno si corresponde
            turno.setEstado(EstadoTurno.CANCELADO);
            turnoRepository.save(turno);
        }

        // Inhabilitar agenda
        agenda.setHabilitado(false);
        agenda.setMotivoInhabilitacion("Cancelada por el médico");
        repository.save(agenda);
    }

    public List<Agenda> sugerirAlternativas(Turno turno) {
        Long consultorioId = Long.valueOf(turno.getStaffMedico().getConsultorio().getId());
        Long especialidadId = Long.valueOf(turno.getStaffMedico().getEspecialidad().getId());
        return repository.findByConsultorioIdAndEspecialidadIdAndHabilitadoTrue(
                consultorioId,
                especialidadId);
    }

    public List<Agenda> generarAgendaDesdeEsquemaTurno(EsquemaTurno esquemaTurno, int semanas) {
        List<Agenda> agendas = new ArrayList<>();
        LocalDate hoy = LocalDate.now();

        for (String diaSemana : esquemaTurno.getDiasSemana()) {
            DayOfWeek dayOfWeek = parseDiaSemana(diaSemana);
            // Buscar el próximo día correspondiente
            LocalDate fecha = hoy.with(TemporalAdjusters.nextOrSame(dayOfWeek));
            for (int i = 0; i < semanas; i++) {
                Agenda agenda = new Agenda();
                agenda.setHoraInicio(esquemaTurno.getHoraInicio());
                agenda.setHoraFin(esquemaTurno.getHoraFin());
                agenda.setConsultorio(esquemaTurno.getDisponibilidadMedico().getStaffMedico().getConsultorio());
                agenda.setMedico(esquemaTurno.getDisponibilidadMedico().getStaffMedico().getMedico());
                agenda.setEspecialidad(esquemaTurno.getDisponibilidadMedico().getStaffMedico().getEspecialidad());
                agenda.setHabilitado(true);
                agenda.setMotivoInhabilitacion(null);
                Calendar cal = Calendar.getInstance();
                cal.setTime(java.sql.Date.valueOf(fecha.plusWeeks(i)));
                agenda.setFechaHora(cal);
                agendas.add(agenda);
            }
        }
        // Guardar todas las agendas generadas
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
}