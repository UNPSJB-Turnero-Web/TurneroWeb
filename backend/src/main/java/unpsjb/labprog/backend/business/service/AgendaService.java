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
import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.dto.AgendaDTO;
import unpsjb.labprog.backend.model.Agenda;
import unpsjb.labprog.backend.model.BloqueHorario;
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
        if (agenda.getBloquesReservados() != null) {
            for (BloqueHorario bloque : agenda.getBloquesReservados()) {
                if (horariosSeSuperponen(agenda.getHoraInicio(), agenda.getHoraFin(), bloque.getHoraInicio(),
                        bloque.getHoraFin())) {
                    throw new IllegalArgumentException(
                            "Hay un bloque reservado (ej: " + bloque.getMotivo() + ") que se superpone con la agenda.");
                }
            }
        }

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
                    // Esto está bien si getHoraFin() y getHoraInicio() son LocalTime
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

    public Agenda saveFromDTO(AgendaDTO dto) {
        Agenda agenda = (dto.getId() != null) ? findById(dto.getId()) : new Agenda();

        // Mapear campos simples
        if (dto.getFecha() != null) {
            agenda.setFecha(LocalDate.parse(dto.getFecha())); // ISO yyyy-MM-dd
        }
        agenda.setHoraInicio(dto.getHoraInicio());
        agenda.setHoraFin(dto.getHoraFin());
        agenda.setHabilitado(dto.getHabilitado() != null ? dto.getHabilitado() : true);
        agenda.setMotivoInhabilitacion(dto.getMotivoInhabilitacion());
        agenda.setTiempoTolerancia(dto.getTiempoTolerancia());

        // Mapear relaciones
        if (dto.getEsquemaTurnoId() != null) {
            EsquemaTurno esquema = esquemaTurnoRepository.findById(dto.getEsquemaTurnoId()).orElse(null);
            agenda.setEsquemaTurno(esquema);
        }

        // Mapear bloques reservados
        if (dto.getBloquesReservados() != null) {
            List<BloqueHorario> bloques = new ArrayList<>();
            for (unpsjb.labprog.backend.dto.BloqueHorarioDTO bloqueDTO : dto.getBloquesReservados()) {
                BloqueHorario bloque = new BloqueHorario();
                bloque.setHoraInicio(bloqueDTO.getHoraInicio());
                bloque.setHoraFin(bloqueDTO.getHoraFin());
                bloque.setEsUrgencia(bloqueDTO.isEsUrgencia());
                bloque.setMotivo(bloqueDTO.getMotivo());
                bloque.setAgenda(agenda);
                bloques.add(bloque);
            }
            agenda.setBloquesReservados(bloques);
        }

        return save(agenda);
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

    public void generarSlotsTurnos(Agenda agenda) {
        EsquemaTurno esquemaTurno = agenda.getEsquemaTurno();
        if (esquemaTurno == null || esquemaTurno.getDisponibilidadMedico() == null) {
            throw new IllegalStateException("El esquema de turno o la disponibilidad médica no están configurados.");
        }

        agenda.getBloquesReservados().clear(); // Limpiar bloques existentes

        esquemaTurno.getDisponibilidadMedico().getHorarios().forEach(horario -> {
            LocalTime horaActual = horario.getHoraInicio();
            while (horaActual.isBefore(horario.getHoraFin())) {
                BloqueHorario bloque = new BloqueHorario();
                bloque.setAgenda(agenda);
                bloque.setHoraInicio(horaActual);
                bloque.setHoraFin(horaActual.plusMinutes(esquemaTurno.getIntervalo()));
                agenda.getBloquesReservados().add(bloque);
                horaActual = horaActual.plusMinutes(esquemaTurno.getIntervalo());
            }
        });
    }
}