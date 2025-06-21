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

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.business.repository.TurnoRepository;
import unpsjb.labprog.backend.dto.ConsultorioDTO;
import unpsjb.labprog.backend.dto.TurnoDTO;
import unpsjb.labprog.backend.model.ConfiguracionExcepcional;
import unpsjb.labprog.backend.model.Consultorio;
import unpsjb.labprog.backend.model.EsquemaTurno;
import unpsjb.labprog.backend.model.EstadoTurno;
import unpsjb.labprog.backend.model.Turno;

/**
 * Servicio refactorizado para Agenda aplicando principios SOLID.
 * Usa clases internas especializadas para cumplir SRP (Single Responsibility Principle).
 */
@Service
public class AgendaService {

    // === DEPENDENCIAS (DIP - Dependency Inversion Principle) ===
    private final TurnoRepository turnoRepository;
    private final EsquemaTurnoRepository esquemaTurnoRepository;
    private final ConsultorioService consultorioService;
    private final ConsultorioDistribucionService consultorioDistribucionService;
    private final ConfiguracionExcepcionalService configuracionExcepcionalService;

    // === COMPONENTES ESPECIALIZADOS (SRP) ===
    private final SlotGenerator slotGenerator;
    private final DisponibilidadValidator disponibilidadValidator;
    private final ConsultorioOptimizer consultorioOptimizer;
    private final ConflictResolver conflictResolver;
    private final ExceptionalConfigurationHandler exceptionalHandler;

    // Constructor injection (DIP)
    public AgendaService(
            TurnoRepository turnoRepository,
            EsquemaTurnoRepository esquemaTurnoRepository,
            ConsultorioService consultorioService,
            ConsultorioDistribucionService consultorioDistribucionService,
            ConfiguracionExcepcionalService configuracionExcepcionalService) {
        
        this.turnoRepository = turnoRepository;
        this.esquemaTurnoRepository = esquemaTurnoRepository;
        this.consultorioService = consultorioService;
        this.consultorioDistribucionService = consultorioDistribucionService;
        this.configuracionExcepcionalService = configuracionExcepcionalService;
        
        // Inicializar componentes especializados
        this.slotGenerator = new SlotGenerator();
        this.disponibilidadValidator = new DisponibilidadValidator();
        this.consultorioOptimizer = new ConsultorioOptimizer();
        this.conflictResolver = new ConflictResolver();
        this.exceptionalHandler = new ExceptionalConfigurationHandler();
    }

    // ===============================================
    // CLASES INTERNAS ESPECIALIZADAS (SRP)
    // ===============================================

    /**
     * Generador de slots especializado (SRP)
     */
    private class SlotGenerator {
        
        public List<TurnoDTO> generarSlotsParaHorario(LocalDate fecha, LocalTime inicio, LocalTime fin, 
                                                      EsquemaTurno esquemaTurno, Integer duracion,
                                                      int eventoIdCounter) {
            List<TurnoDTO> slots = new ArrayList<>();
            int intervalo = esquemaTurno.getIntervalo();
            int duracionSanitizacion = duracion != null ? duracion : 0;
            int intervaloConDuracion = intervalo + duracionSanitizacion;
            
            LocalTime slotStart = inicio;
            
            while (slotStart.isBefore(fin)) {
                LocalTime nextSlot = slotStart.plusMinutes(intervalo);
                
                if (nextSlot.isAfter(fin)) {
                    break;
                }

                SlotInfo slotInfo = crearSlotInfo(fecha, slotStart, esquemaTurno, intervalo);
                TurnoDTO evento = crearEventoDesdeSlotInfo(slotInfo, eventoIdCounter++);
                evento.setFecha(fecha);
                evento.setHoraInicio(slotStart);
                evento.setHoraFin(nextSlot);
                
                // Asignar datos del esquema usando el método especializado
                asignarDatosEsquema(evento, esquemaTurno);
                
                slots.add(evento);
                slotStart = slotStart.plusMinutes(intervaloConDuracion);
            }
            
            return slots;
        }
        
        private SlotInfo crearSlotInfo(LocalDate fecha, LocalTime slotStart, 
                                      EsquemaTurno esquemaTurno, int intervalo) {
            boolean slotOcupado = turnoRepository.existsByFechaAndHoraInicioAndStaffMedicoIdAndEstadoNot(
                fecha, slotStart, esquemaTurno.getStaffMedico().getId(), EstadoTurno.CANCELADO);

            boolean enMantenimiento = configuracionExcepcionalService.turnoEnConflictoConMantenimiento(
                fecha, esquemaTurno.getConsultorio().getId(), slotStart, intervalo);

            if (enMantenimiento) {
                slotOcupado = true;
            }

            String titulo = determinarTitulo(slotOcupado, enMantenimiento);
            
            return new SlotInfo(slotOcupado, enMantenimiento, titulo);
        }
        
        private String determinarTitulo(boolean slotOcupado, boolean enMantenimiento) {
            if (enMantenimiento) {
                return "Mantenimiento";
            } else if (slotOcupado) {
                return "Ocupado";
            } else {
                return "Disponible";
            }
        }
        
        private TurnoDTO crearEventoDesdeSlotInfo(SlotInfo slotInfo, int eventoId) {
            TurnoDTO evento = new TurnoDTO();
            evento.setId(eventoId);
            evento.setTitulo(slotInfo.titulo);
            evento.setEsSlot(true);
            evento.setOcupado(slotInfo.ocupado);
            evento.setEnMantenimiento(slotInfo.enMantenimiento);
            return evento;
        }
        
        public void asignarDatosEsquema(TurnoDTO evento, EsquemaTurno esquemaTurno) {
            evento.setStaffMedicoId(esquemaTurno.getStaffMedico().getId());
            evento.setStaffMedicoNombre(esquemaTurno.getStaffMedico().getMedico().getNombre());
            evento.setStaffMedicoApellido(esquemaTurno.getStaffMedico().getMedico().getApellido());
            evento.setEspecialidadStaffMedico(esquemaTurno.getStaffMedico().getMedico()
                    .getEspecialidad().getNombre());
            evento.setConsultorioId(esquemaTurno.getConsultorio().getId());
            evento.setConsultorioNombre(esquemaTurno.getConsultorio().getNombre());
            evento.setCentroId(esquemaTurno.getCentroAtencion().getId());
            evento.setNombreCentro(esquemaTurno.getCentroAtencion().getNombre());
        }
    }

    /**
     * Validador de disponibilidad especializado (SRP)
     */
    private class DisponibilidadValidator {
        
        public boolean validarDisponibilidad(LocalDate fecha, LocalTime horaInicio, Integer consultorioId,
                Integer staffMedicoId) {
            if (configuracionExcepcionalService.esFeriado(fecha)) {
                return false;
            }

            if (configuracionExcepcionalService.turnoEnConflictoConMantenimiento(fecha, consultorioId, horaInicio, 20)) {
                return false;
            }

            String diaSemana = fecha.getDayOfWeek().name();
            if (!consultorioService.consultorioDisponibleEnHorario(consultorioId, diaSemana, horaInicio)) {
                return false;
            }

            return !turnoRepository.existsByFechaAndHoraInicioAndStaffMedicoIdAndEstadoNot(
                    fecha, horaInicio, staffMedicoId, EstadoTurno.CANCELADO);
        }
        
        public boolean esFechaExcepcional(LocalDate fecha, Integer esquemaTurnoId) {
            return configuracionExcepcionalService.esFeriado(fecha) ||
                   configuracionExcepcionalService.tieneMantenimiento(fecha, esquemaTurnoId) ||
                   configuracionExcepcionalService.obtenerAtencionEspecial(fecha, esquemaTurnoId).isPresent();
        }
    }

    /**
     * Optimizador de consultorios especializado (SRP)
     */
    private class ConsultorioOptimizer {
        
        @Transactional
        public Map<Integer, Integer> optimizarDistribucionConsultorios(Integer centroAtencionId, LocalDate fecha) {
            String diaSemana = fecha.getDayOfWeek().name();
            
            Map<Integer, Integer> asignacion = consultorioDistribucionService.distribuirConsultorios(
                centroAtencionId, fecha, diaSemana);
            
            actualizarEsquemasConNuevaAsignacion(asignacion, diaSemana);
            
            return asignacion;
        }
        
        private void actualizarEsquemasConNuevaAsignacion(Map<Integer, Integer> asignacion, String diaSemana) {
            for (Map.Entry<Integer, Integer> entry : asignacion.entrySet()) {
                Integer staffMedicoId = entry.getKey();
                Integer consultorioId = entry.getValue();
                
                List<EsquemaTurno> esquemas = esquemaTurnoRepository.findByStaffMedicoId(staffMedicoId);
                
                for (EsquemaTurno esquema : esquemas) {
                    boolean incluyeEsteDia = esquema.getHorarios().stream()
                        .anyMatch(horario -> horario.getDia().equalsIgnoreCase(diaSemana));
                    
                    if (incluyeEsteDia) {
                        Consultorio consultorio = new Consultorio();
                        consultorio.setId(consultorioId);
                        esquema.setConsultorio(consultorio);
                        esquemaTurnoRepository.save(esquema);
                    }
                }
            }
        }
    }

    /**
     * Resolvedor de conflictos especializado (SRP)
     */
    private class ConflictResolver {
        
        @Transactional
        public void resolverConflictosConsultorios(Integer centroAtencionId, Integer especialidadId, LocalDate fecha) {
            String diaSemana = fecha.getDayOfWeek().name();
            
            List<EsquemaTurno> esquemas = esquemaTurnoRepository.findByStaffMedico_Medico_Especialidad_IdAndCentroAtencion_Id(
                especialidadId, centroAtencionId);
            
            Map<Integer, List<EsquemaTurno>> esquemasPorConsultorio = esquemas.stream()
                .collect(Collectors.groupingBy(e -> e.getConsultorio().getId()));
            
            for (Map.Entry<Integer, List<EsquemaTurno>> entry : esquemasPorConsultorio.entrySet()) {
                List<EsquemaTurno> esquemasMismoConsultorio = entry.getValue();
                
                if (esquemasMismoConsultorio.size() > 1) {
                    resolverConflictosMismoConsultorio(esquemasMismoConsultorio, diaSemana);
                }
            }
        }
        
        private void resolverConflictosMismoConsultorio(List<EsquemaTurno> esquemas, String diaSemana) {
            esquemas.sort((e1, e2) -> e1.getId().compareTo(e2.getId()));
            
            for (int i = 0; i < esquemas.size(); i++) {
                EsquemaTurno esquema1 = esquemas.get(i);
                
                List<EsquemaTurno.Horario> horariosEsquema1 = esquema1.getHorarios().stream()
                    .filter(h -> h.getDia().equalsIgnoreCase(diaSemana))
                    .collect(Collectors.toList());
                    
                if (horariosEsquema1.isEmpty()) {
                    continue;
                }
                
                for (int j = i + 1; j < esquemas.size(); j++) {
                    EsquemaTurno esquema2 = esquemas.get(j);
                    
                    if (tieneConflictoHorario(esquema1, esquema2, diaSemana)) {
                        reasignarConsultorio(esquema2);
                    }
                }
            }
        }
        
        private boolean tieneConflictoHorario(EsquemaTurno esquema1, EsquemaTurno esquema2, String diaSemana) {
            List<EsquemaTurno.Horario> horariosEsquema1 = esquema1.getHorarios().stream()
                .filter(h -> h.getDia().equalsIgnoreCase(diaSemana))
                .collect(Collectors.toList());
                
            List<EsquemaTurno.Horario> horariosEsquema2 = esquema2.getHorarios().stream()
                .filter(h -> h.getDia().equalsIgnoreCase(diaSemana))
                .collect(Collectors.toList());
            
            for (EsquemaTurno.Horario h1 : horariosEsquema1) {
                for (EsquemaTurno.Horario h2 : horariosEsquema2) {
                    if (h1.getHoraInicio().isBefore(h2.getHoraFin()) && 
                        h1.getHoraFin().isAfter(h2.getHoraInicio())) {
                        return true;
                    }
                }
            }
            return false;
        }
        
        private void reasignarConsultorio(EsquemaTurno esquema) {
            List<Consultorio> consultoriosDisponibles = consultorioService.findByCentroAtencionId(
                esquema.getCentroAtencion().getId())
                .stream()
                .filter(c -> !c.getId().equals(esquema.getConsultorio().getId()))
                .map(dto -> {
                    Consultorio c = new Consultorio();
                    c.setId(dto.getId());
                    return c;
                })
                .collect(Collectors.toList());
            
            if (!consultoriosDisponibles.isEmpty()) {
                esquema.setConsultorio(consultoriosDisponibles.get(0));
                esquemaTurnoRepository.save(esquema);
            }
        }
    }

    /**
     * Manejador de configuraciones excepcionales especializado (SRP)
     */
    private class ExceptionalConfigurationHandler {
        
        public List<TurnoDTO> generarSlotsParaDiaExcepcional(LocalDate fecha, LocalTime inicio, LocalTime fin, 
                                                             EsquemaTurno esquemaTurno, 
                                                             List<ConfiguracionExcepcional> configuraciones,
                                                             int eventoIdCounter) {
            List<TurnoDTO> slots = new ArrayList<>();
            int intervalo = esquemaTurno.getIntervalo();
            
            ExceptionalDayContext context = analizarConfiguracionesExcepcionales(configuraciones, esquemaTurno);
            
            LocalTime slotStart = inicio;
            
            while (slotStart.isBefore(fin)) {
                LocalTime nextSlot = slotStart.plusMinutes(intervalo);
                
                if (nextSlot.isAfter(fin)) {
                    break;
                }
                
                ExceptionalSlotInfo slotInfo = determinarTipoExcepcion(slotStart, nextSlot, context, fecha, esquemaTurno);
                TurnoDTO evento = crearEventoExcepcional(slotInfo, eventoIdCounter++, fecha, slotStart, nextSlot, esquemaTurno);
                
                slots.add(evento);
                slotStart = slotStart.plusMinutes(intervalo);
            }
            
            return slots;
        }
        
        private ExceptionalDayContext analizarConfiguracionesExcepcionales(List<ConfiguracionExcepcional> configuraciones, EsquemaTurno esquemaTurno) {
            Optional<ConfiguracionExcepcional> feriado = configuraciones.stream()
                .filter(c -> c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.FERIADO)
                .findFirst();
                
            Optional<ConfiguracionExcepcional> mantenimiento = configuraciones.stream()
                .filter(c -> c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.MANTENIMIENTO)
                .filter(c -> c.getConsultorio() != null && 
                           c.getConsultorio().getId().equals(esquemaTurno.getConsultorio().getId()))
                .findFirst();
                
            Optional<ConfiguracionExcepcional> atencionEspecial = configuraciones.stream()
                .filter(c -> c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.ATENCION_ESPECIAL)
                .filter(c -> c.getEsquemaTurno() != null && 
                           c.getEsquemaTurno().getId().equals(esquemaTurno.getId()))
                .findFirst();
                
            return new ExceptionalDayContext(feriado, mantenimiento, atencionEspecial);
        }
        
        private ExceptionalSlotInfo determinarTipoExcepcion(LocalTime slotStart, LocalTime nextSlot, 
                                                           ExceptionalDayContext context, LocalDate fecha, 
                                                           EsquemaTurno esquemaTurno) {
            boolean slotOcupado = turnoRepository.existsByFechaAndHoraInicioAndStaffMedicoIdAndEstadoNot(
                fecha, slotStart, esquemaTurno.getStaffMedico().getId(), EstadoTurno.CANCELADO);
            
            if (context.feriado.isPresent()) {
                return new ExceptionalSlotInfo("FERIADO", context.feriado.get().getDescripcion(), true, false);
            }
            
            if (context.mantenimiento.isPresent()) {
                ConfiguracionExcepcional mant = context.mantenimiento.get();
                if (mant.getHoraInicio() != null && mant.getHoraFin() != null) {
                    boolean seSuperpone = slotStart.isBefore(mant.getHoraFin()) && 
                                         nextSlot.isAfter(mant.getHoraInicio());
                    if (seSuperpone) {
                        return new ExceptionalSlotInfo("MANTENIMIENTO", mant.getDescripcion(), true, true);
                    }
                }
            }
            
            if (context.atencionEspecial.isPresent()) {
                ConfiguracionExcepcional atEsp = context.atencionEspecial.get();
                if (atEsp.getHoraInicio() != null && atEsp.getHoraFin() != null) {
                    boolean seSuperpone = slotStart.isBefore(atEsp.getHoraFin()) && 
                                         nextSlot.isAfter(atEsp.getHoraInicio());
                    if (seSuperpone) {
                        return new ExceptionalSlotInfo("ATENCION_ESPECIAL", atEsp.getDescripcion(), true, false);
                    }
                }
            }
            
            return new ExceptionalSlotInfo(null, null, slotOcupado, false);
        }
        
        private TurnoDTO crearEventoExcepcional(ExceptionalSlotInfo slotInfo, int eventoId, LocalDate fecha, 
                                               LocalTime slotStart, LocalTime nextSlot, EsquemaTurno esquemaTurno) {
            TurnoDTO evento = new TurnoDTO();
            evento.setId(eventoId);
            evento.setFecha(fecha);
            evento.setHoraInicio(slotStart);
            evento.setHoraFin(nextSlot);
            
            String titulo = construirTituloExcepcional(slotInfo);
            evento.setTitulo(titulo);
            evento.setEsSlot(true);
            evento.setOcupado(slotInfo.ocupado);
            evento.setEnMantenimiento(slotInfo.esMantenimiento);
            
            asignarDatosEsquema(evento, esquemaTurno);
            
            if (slotInfo.ocupado && slotInfo.tipoExcepcion == null) {
                asignarDatosPaciente(evento, fecha, slotStart, esquemaTurno);
            }
            
            return evento;
        }
        
        private String construirTituloExcepcional(ExceptionalSlotInfo slotInfo) {
            if (slotInfo.tipoExcepcion != null) {
                String titulo = slotInfo.tipoExcepcion;
                if (slotInfo.descripcion != null && !slotInfo.descripcion.isEmpty()) {
                    titulo += ": " + slotInfo.descripcion;
                }
                if (slotInfo.ocupado) {
                    titulo = "Ocupado (" + titulo + ")";
                }
                return titulo;
            } else {
                return slotInfo.ocupado ? "Ocupado" : "Disponible";
            }
        }
        
        private void asignarDatosEsquema(TurnoDTO evento, EsquemaTurno esquemaTurno) {
            evento.setStaffMedicoId(esquemaTurno.getStaffMedico().getId());
            evento.setStaffMedicoNombre(esquemaTurno.getStaffMedico().getMedico().getNombre());
            evento.setStaffMedicoApellido(esquemaTurno.getStaffMedico().getMedico().getApellido());
            evento.setEspecialidadStaffMedico(esquemaTurno.getStaffMedico().getMedico()
                    .getEspecialidad().getNombre());
            evento.setConsultorioId(esquemaTurno.getConsultorio().getId());
            evento.setConsultorioNombre(esquemaTurno.getConsultorio().getNombre());
            evento.setCentroId(esquemaTurno.getCentroAtencion().getId());
            evento.setNombreCentro(esquemaTurno.getCentroAtencion().getNombre());
        }
        
        private void asignarDatosPaciente(TurnoDTO evento, LocalDate fecha, LocalTime slotStart, EsquemaTurno esquemaTurno) {
            List<Turno> turnosEnFecha = turnoRepository.findByFechaAndStaffMedico_Id(
                fecha, esquemaTurno.getStaffMedico().getId());
            
            final LocalTime horaSlot = slotStart;
            Optional<Turno> turnoExistente = turnosEnFecha.stream()
                .filter(t -> t.getHoraInicio().equals(horaSlot))
                .filter(t -> t.getEstado() != EstadoTurno.CANCELADO)
                .findFirst();
            
            if (turnoExistente.isPresent()) {
                Turno turno = turnoExistente.get();
                evento.setPacienteId(turno.getPaciente().getId());
                evento.setNombrePaciente(turno.getPaciente().getNombre());
                evento.setApellidoPaciente(turno.getPaciente().getApellido());
            }
        }
    }

    // ===============================================
    // VALUE OBJECTS PARA DATOS (SRP)
    // ===============================================
    
    private static class SlotInfo {
        final boolean ocupado;
        final boolean enMantenimiento;
        final String titulo;
        
        SlotInfo(boolean ocupado, boolean enMantenimiento, String titulo) {
            this.ocupado = ocupado;
            this.enMantenimiento = enMantenimiento;
            this.titulo = titulo;
        }
    }
    
    private static class ExceptionalDayContext {
        final Optional<ConfiguracionExcepcional> feriado;
        final Optional<ConfiguracionExcepcional> mantenimiento;
        final Optional<ConfiguracionExcepcional> atencionEspecial;
        
        ExceptionalDayContext(Optional<ConfiguracionExcepcional> feriado, 
                             Optional<ConfiguracionExcepcional> mantenimiento,
                             Optional<ConfiguracionExcepcional> atencionEspecial) {
            this.feriado = feriado;
            this.mantenimiento = mantenimiento;
            this.atencionEspecial = atencionEspecial;
        }
    }
    
    private static class ExceptionalSlotInfo {
        final String tipoExcepcion;
        final String descripcion;
        final boolean ocupado;
        final boolean esMantenimiento;
        
        ExceptionalSlotInfo(String tipoExcepcion, String descripcion, boolean ocupado, boolean esMantenimiento) {
            this.tipoExcepcion = tipoExcepcion;
            this.descripcion = descripcion;
            this.ocupado = ocupado;
            this.esMantenimiento = esMantenimiento;
        }
    }

    // ===============================================
    // MÉTODOS PÚBLICOS (API FACADE)
    // ===============================================

    /**
     * Verificar si una fecha es excepcional usando el validador especializado
     */
    public boolean esFechaExcepcional(LocalDate fecha, Integer esquemaTurnoId) {
        return disponibilidadValidator.esFechaExcepcional(fecha, esquemaTurnoId);
    }

    /**
     * Validar disponibilidad usando el validador especializado
     */
    public boolean validarDisponibilidad(LocalDate fecha, LocalTime horaInicio, Integer consultorioId,
            Integer staffMedicoId) {
        return disponibilidadValidator.validarDisponibilidad(fecha, horaInicio, consultorioId, staffMedicoId);
    }
    
    /**
     * Método auxiliar para generar slots para un horario específico
     */
    private List<TurnoDTO> generarSlotsParaHorario(LocalDate fecha, LocalTime inicio, LocalTime fin, 
                                                  EsquemaTurno esquemaTurno, Integer duracion,
                                                  int eventoIdCounter) {
        return slotGenerator.generarSlotsParaHorario(fecha, inicio, fin, esquemaTurno, duracion, eventoIdCounter);
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

    /**
     * Convierte el día de la semana de inglés (Java) a español (BD)
     */
    private static String convertirDiaInglesToEspanol(String diaIngles) {
        return switch (diaIngles.toUpperCase()) {
            case "MONDAY" -> "LUNES";
            case "TUESDAY" -> "MARTES";
            case "WEDNESDAY" -> "MIERCOLES";
            case "THURSDAY" -> "JUEVES";
            case "FRIDAY" -> "VIERNES";
            case "SATURDAY" -> "SABADO";
            case "SUNDAY" -> "DOMINGO";
            default -> diaIngles; // Si ya está en español o es otro formato, devolverlo tal como está
        };
    }

    /**
     * Genera eventos (turnos) desde un esquema de turno para las próximas semanas especificadas.
     * Este método SOLO genera eventos basándose en el esquema existente, SIN ejecutar optimizaciones automáticas.
     * Los esquemas de turno ya deben tener asignados sus consultorios cuando se crean.
     */
    public List<TurnoDTO> generarEventosDesdeEsquemaTurno(EsquemaTurno esquemaTurno, int semanas) {
        List<TurnoDTO> eventos = new ArrayList<>();
        LocalDate hoy = LocalDate.now();
        int eventoIdCounter = 1; // Contador para generar IDs únicos
        
        // Crear una referencia final para usar en lambdas
        final EsquemaTurno esquemaTurnoFinal = esquemaTurno;

        // Obtener los horarios del esquema desde la tabla esquema_turno_horarios
        List<EsquemaTurno.Horario> horarios = esquemaTurnoFinal.getHorarios();
        Consultorio consultorio = esquemaTurnoFinal.getConsultorio();

        // Validar que el consultorio no sea null
        if (consultorio == null) {
            throw new IllegalStateException(
                    "El consultorio asociado al EsquemaTurno con ID " + esquemaTurnoFinal.getId() + " es nulo.");
        }

        for (EsquemaTurno.Horario horario : horarios) {
            DayOfWeek dayOfWeek = parseDiaSemana(horario.getDia());
            LocalDate fecha = hoy.with(TemporalAdjusters.nextOrSame(dayOfWeek));
            
            // System.out.println("=== PROCESANDO HORARIO ===");
            // System.out.println("Dia de horario: " + horario.getDia() + " (" + horario.getHoraInicio() + "-" + horario.getHoraFin() + ")");
            // System.out.println("DayOfWeek calculado: " + dayOfWeek);
            // System.out.println("Primera fecha para este dia: " + fecha);
            
            for (int i = 0; i < semanas; i++) {
                LocalDate fechaEvento = fecha.plusWeeks(i);
                
                // System.out.println("--- Procesando fecha: " + fechaEvento + " (semana " + i + ") ---");

                // Verificar si existe una configuración excepcional para esta fecha
                List<ConfiguracionExcepcional> configuracionesDelDia = configuracionExcepcionalService.obtenerConfiguraciones(fechaEvento);
                // System.out.println("Configuraciones excepcionales encontradas: " + configuracionesDelDia.size());
                
                // DEBUG: Mostrar detalles de las configuraciones
                for (ConfiguracionExcepcional config : configuracionesDelDia) {
                    // System.out.println("  Config ID: " + config.getId() + 
                    //                   ", Tipo: " + config.getTipo() + 
                    //                   ", Consultorio: " + (config.getConsultorio() != null ? config.getConsultorio().getId() : "NULL") +
                    //                   ", Horario: " + config.getHoraInicio() + "-" + config.getHoraFin() +
                    //                   ", Descripcion: " + config.getDescripcion());
                }
                
                // Verificar si es feriado (afecta todo el día)
                boolean esFeriado = configuracionesDelDia.stream()
                    .anyMatch(c -> c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.FERIADO);
                
                // System.out.println("Es feriado: " + esFeriado);
                
                if (esFeriado) {
                    // System.out.println("Generando slots excepcionales para feriado");
                    // Para feriados, generar slots especiales para todo el día
                    List<TurnoDTO> slotsFeriado = exceptionalHandler.generarSlotsParaDiaExcepcional(fechaEvento, horario.getHoraInicio(), horario.getHoraFin(), 
                        esquemaTurnoFinal, configuracionesDelDia, eventoIdCounter);
                    eventos.addAll(slotsFeriado);
                    // System.out.println(">>> Se generaron " + slotsFeriado.size() + " slots para feriado en " + fechaEvento);
                    eventoIdCounter += 50;
                    continue;
                }
                
                // NOTA: El mantenimiento se maneja slot por slot en generarSlotsParaHorario()
                // si está en conflicto con un horario de mantenimiento
                
                // Verificar si hay atención especial específica para este esquema
                Optional<ConfiguracionExcepcional> atencionEspecial = configuracionExcepcionalService.obtenerAtencionEspecial(fechaEvento, esquemaTurnoFinal.getId());
                // System.out.println("🔍 DEBUG ATENCIÓN ESPECIAL para Esquema ID: " + esquemaTurnoFinal.getId() + 
                //                   " (Médico: " + esquemaTurnoFinal.getStaffMedico().getMedico().getNombre() + " " + 
                //                   esquemaTurnoFinal.getStaffMedico().getMedico().getApellido() + ")");
                // System.out.println("Atencion especial presente: " + atencionEspecial.isPresent());
                if (atencionEspecial.isPresent()) {
                    ConfiguracionExcepcional config = atencionEspecial.get();
                    // System.out.println("  ✅ Config encontrada - ID: " + config.getId() + 
                    //                   ", EsquemaTurno asociado: " + (config.getEsquemaTurno() != null ? config.getEsquemaTurno().getId() : "NULL"));
                }
                
                if (atencionEspecial.isPresent()) {
                    ConfiguracionExcepcional config = atencionEspecial.get();
                    // System.out.println("Config atencion especial - Hora inicio: " + config.getHoraInicio() + ", Hora fin: " + config.getHoraFin());
                    if (config.getHoraInicio() != null && config.getHoraFin() != null) {
                        // System.out.println("Generando slots excepcionales para atencion especial");
                        // CORRECCIÓN: Solo pasar la configuración específica del esquema actual
                        List<ConfiguracionExcepcional> configuracionesEspecificas = configuracionesDelDia.stream()
                            .filter(c -> {
                                // Incluir feriados (aplican a todos)
                                if (c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.FERIADO) {
                                    return true;
                                }
                                // Incluir mantenimientos del consultorio específico
                                if (c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.MANTENIMIENTO &&
                                    c.getConsultorio() != null && 
                                    c.getConsultorio().getId().equals(esquemaTurnoFinal.getConsultorio().getId())) {
                                    return true;
                                }
                                // Incluir SOLO la atención especial del esquema específico
                                return c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.ATENCION_ESPECIAL &&
                                    c.getEsquemaTurno() != null && 
                                    c.getEsquemaTurno().getId().equals(esquemaTurnoFinal.getId());
                            })
                            .collect(Collectors.toList());
                        
                        List<TurnoDTO> slotsAtencionEspecial = exceptionalHandler.generarSlotsParaDiaExcepcional(fechaEvento, horario.getHoraInicio(), horario.getHoraFin(), 
                            esquemaTurnoFinal, configuracionesEspecificas, eventoIdCounter);
                        eventos.addAll(slotsAtencionEspecial);
                        eventoIdCounter += 50;
                        continue;
                    }
                }

                // Horario normal - obtener tiempo de sanitización
                int duracion = atencionEspecial.map(ConfiguracionExcepcional::getDuracion).orElse(0);
                
                // NUEVA VALIDACIÓN: Verificar horarios del consultorio y ajustar ventana temporal
                String diaSemana = convertirDiaInglesToEspanol(fechaEvento.getDayOfWeek().name());
                // System.out.println("Verificando disponibilidad consultorio " + consultorio.getId() + " para dia " + diaSemana + " (" + diaSemanaEspanol + ")");
                
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
                    } else {
                        // Si no hay horario específico para este día, usar el horario del esquema sin restricciones
                        // System.out.println(">>> No hay horario específico para " + diaSemana + " en consultorio " + consultorio.getId() + 
                        //                   ", usando horario del esquema sin restricciones del consultorio");
                    }
                } else {
                    // Si no hay horarios específicos configurados, usar el horario del esquema sin restricciones
                    // System.out.println(">>> Consultorio " + consultorio.getId() + " no tiene horarios específicos configurados, usando horario del esquema");
                }
                
                // Si no hay intersección válida, continuar con el siguiente horario
                if (slotStart.isAfter(slotEnd) || slotStart.equals(slotEnd)) {
                    // System.out.println(">>> No hay intersección válida entre horario del esquema (" + horario.getHoraInicio() + "-" + horario.getHoraFin() + 
                    //                   ") y consultorio (" + slotStart + "-" + slotEnd + ") para " + diaSemana);
                    continue;
                }
                
                // Generar slots usando el método estándar que maneja mantenimiento correctamente
                // System.out.println(">>> Generando slots para " + diaSemana + " (" + fechaEvento + ") de " + slotStart + " a " + slotEnd);
                List<TurnoDTO> slotsGenerados = generarSlotsParaHorario(fechaEvento, slotStart, slotEnd, 
                    esquemaTurnoFinal, duracion, eventoIdCounter);
                // System.out.println(">>> Se generaron " + slotsGenerados.size() + " slots para " + fechaEvento);
                eventos.addAll(slotsGenerados);
                eventoIdCounter += 50;
            }
        }

        // System.out.println("=== RESUMEN GENERACIÓN DE EVENTOS ===");
        // System.out.println("Total de eventos generados: " + eventos.size());
        // System.out.println("Esquema ID: " + esquemaTurnoFinal.getId() + ", Staff Médico: " + esquemaTurnoFinal.getStaffMedico().getId());
        
        return eventos;
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
        return consultorioOptimizer.optimizarDistribucionConsultorios(centroAtencionId, fecha);
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
        conflictResolver.resolverConflictosConsultorios(centroAtencionId, especialidadId, fecha);
    }
    
    /**
     * Resuelve conflictos de horario entre esquemas de turno que comparten consultorio.
     * 
     * @param esquemas Lista de esquemas que comparten consultorio
     * @param diaSemana Día de la semana para verificar conflictos
     */
 

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