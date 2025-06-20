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
 * Servicio simplificado para Agenda - solo maneja agendas operacionales.
 * Las configuraciones excepcionales se manejan en ConfiguracionExcepcionalService.
 */
@Service
public class AgendaService {


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
     * Verificar si una fecha es excepcional usando el nuevo servicio
     */
    public boolean esFechaExcepcional(LocalDate fecha, Integer esquemaTurnoId) {
        // Usar el nuevo servicio para verificar excepciones
        return configuracionExcepcionalService.esFeriado(fecha) ||
               configuracionExcepcionalService.tieneMantenimiento(fecha, esquemaTurnoId) ||
               configuracionExcepcionalService.obtenerAtencionEspecial(fecha, esquemaTurnoId).isPresent();
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

        // Verificar si hay mantenimiento que afecte específicamente este horario
        // Asumir duración de turno de 20 minutos (puede ser configurable)
        if (configuracionExcepcionalService.turnoEnConflictoConMantenimiento(fecha, consultorioId, horaInicio, 20)) {
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
                                                  EsquemaTurno esquemaTurno, Integer duracion,
                                                  int eventoIdCounter) {
        List<TurnoDTO> slots = new ArrayList<>();
        int intervalo = esquemaTurno.getIntervalo();
        int tiempoDuracion = duracion != null ? duracion : 0;
        int intervaloConDuracion = intervalo + duracion;
        
        LocalTime slotStart = inicio;
        
        while (slotStart.isBefore(fin)) {
            LocalTime nextSlot = slotStart.plusMinutes(intervalo);
            
            if (nextSlot.isAfter(fin)) {
                break;
            }

            boolean slotOcupado = turnoRepository.existsByFechaAndHoraInicioAndStaffMedicoIdAndEstadoNot(
                fecha, slotStart, esquemaTurno.getStaffMedico().getId(), EstadoTurno.CANCELADO);

            // Verificar si este slot específico está en conflicto con un mantenimiento
            boolean enMantenimiento = configuracionExcepcionalService.turnoEnConflictoConMantenimiento(
                fecha, esquemaTurno.getConsultorio().getId(), slotStart, intervalo);

            // DEBUG: Log para mantenimiento del 27 de junio
            if (fecha.toString().equals("2025-06-27")) {
                System.out.println("🔧 SLOT " + slotStart + "-" + nextSlot + " en consultorio " + esquemaTurno.getConsultorio().getId() + 
                                  " -> enMantenimiento: " + enMantenimiento);
            }

            // Si está en mantenimiento, marcar como ocupado y cambiar el título
            if (enMantenimiento) {
                slotOcupado = true;
            }

            TurnoDTO evento = new TurnoDTO();
            evento.setId(eventoIdCounter++);
            evento.setFecha(fecha);
            evento.setHoraInicio(slotStart);
            evento.setHoraFin(nextSlot);
            
            // Determinar el título según el estado
            String titulo;
            if (enMantenimiento) {
                titulo = "Mantenimiento";
            } else if (slotOcupado) {
                titulo = "Ocupado";
            } else {
                titulo = "Disponible";
            }
            
            evento.setTitulo(titulo);
            evento.setEsSlot(true);
            evento.setOcupado(slotOcupado);
            evento.setEnMantenimiento(enMantenimiento); // Nuevo campo para distinguir mantenimiento
            
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
            slotStart = slotStart.plusMinutes(intervaloConDuracion);
        }
        
        return slots;
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
            
            System.out.println("=== PROCESANDO HORARIO ===");
            System.out.println("Dia de horario: " + horario.getDia() + " (" + horario.getHoraInicio() + "-" + horario.getHoraFin() + ")");
            System.out.println("DayOfWeek calculado: " + dayOfWeek);
            System.out.println("Primera fecha para este dia: " + fecha);
            
            for (int i = 0; i < semanas; i++) {
                LocalDate fechaEvento = fecha.plusWeeks(i);
                
                System.out.println("--- Procesando fecha: " + fechaEvento + " (semana " + i + ") ---");

                // Verificar si existe una configuración excepcional para esta fecha
                List<ConfiguracionExcepcional> configuracionesDelDia = configuracionExcepcionalService.obtenerConfiguraciones(fechaEvento);
                System.out.println("Configuraciones excepcionales encontradas: " + configuracionesDelDia.size());
                
                // DEBUG: Mostrar detalles de las configuraciones
                for (ConfiguracionExcepcional config : configuracionesDelDia) {
                    System.out.println("  Config ID: " + config.getId() + 
                                      ", Tipo: " + config.getTipo() + 
                                      ", Consultorio: " + (config.getConsultorio() != null ? config.getConsultorio().getId() : "NULL") +
                                      ", Horario: " + config.getHoraInicio() + "-" + config.getHoraFin() +
                                      ", Descripcion: " + config.getDescripcion());
                }
                
                // Verificar si es feriado (afecta todo el día)
                boolean esFeriado = configuracionesDelDia.stream()
                    .anyMatch(c -> c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.FERIADO);
                
                System.out.println("Es feriado: " + esFeriado);
                
                if (esFeriado) {
                    System.out.println("Generando slots excepcionales para feriado");
                    // Para feriados, generar slots especiales para todo el día
                    List<TurnoDTO> slotsFeriado = generarSlotsParaDiaExcepcional(fechaEvento, horario.getHoraInicio(), horario.getHoraFin(), 
                        esquemaTurnoFinal, configuracionesDelDia, eventoIdCounter);
                    eventos.addAll(slotsFeriado);
                    System.out.println(">>> Se generaron " + slotsFeriado.size() + " slots para feriado en " + fechaEvento);
                    eventoIdCounter += 50;
                    continue;
                }
                
                // NOTA: El mantenimiento se maneja slot por slot en generarSlotsParaHorario()
                // si está en conflicto con un horario de mantenimiento
                
                // Verificar si hay atención especial específica para este esquema
                Optional<ConfiguracionExcepcional> atencionEspecial = configuracionExcepcionalService.obtenerAtencionEspecial(fechaEvento, esquemaTurnoFinal.getId());
                System.out.println("🔍 DEBUG ATENCIÓN ESPECIAL para Esquema ID: " + esquemaTurnoFinal.getId() + 
                                  " (Médico: " + esquemaTurnoFinal.getStaffMedico().getMedico().getNombre() + " " + 
                                  esquemaTurnoFinal.getStaffMedico().getMedico().getApellido() + ")");
                System.out.println("Atencion especial presente: " + atencionEspecial.isPresent());
                if (atencionEspecial.isPresent()) {
                    ConfiguracionExcepcional config = atencionEspecial.get();
                    System.out.println("  ✅ Config encontrada - ID: " + config.getId() + 
                                      ", EsquemaTurno asociado: " + (config.getEsquemaTurno() != null ? config.getEsquemaTurno().getId() : "NULL"));
                }
                
                if (atencionEspecial.isPresent()) {
                    ConfiguracionExcepcional config = atencionEspecial.get();
                    System.out.println("Config atencion especial - Hora inicio: " + config.getHoraInicio() + ", Hora fin: " + config.getHoraFin());
                    if (config.getHoraInicio() != null && config.getHoraFin() != null) {
                        System.out.println("Generando slots excepcionales para atencion especial");
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
                                if (c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.ATENCION_ESPECIAL &&
                                    c.getEsquemaTurno() != null && 
                                    c.getEsquemaTurno().getId().equals(esquemaTurnoFinal.getId())) {
                                    return true;
                                }
                                return false;
                            })
                            .collect(Collectors.toList());
                        
                        List<TurnoDTO> slotsAtencionEspecial = generarSlotsParaDiaExcepcional(fechaEvento, horario.getHoraInicio(), horario.getHoraFin(), 
                            esquemaTurnoFinal, configuracionesEspecificas, eventoIdCounter);
                        eventos.addAll(slotsAtencionEspecial);
                        eventoIdCounter += 50;
                        continue;
                    }
                }

                // Horario normal - obtener tiempo de sanitización
                int duracion = atencionEspecial.map(ConfiguracionExcepcional::getDuracion).orElse(0);
                
                // NUEVA VALIDACIÓN: Verificar horarios del consultorio y ajustar ventana temporal
                String diaSemana = fechaEvento.getDayOfWeek().name();
                String diaSemanaEspanol = convertirDiaInglesToEspanol(diaSemana);
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
                        System.out.println(">>> No hay horario específico para " + diaSemana + " en consultorio " + consultorio.getId() + 
                                          ", usando horario del esquema sin restricciones del consultorio");
                    }
                } else {
                    // Si no hay horarios específicos configurados, usar el horario del esquema sin restricciones
                    System.out.println(">>> Consultorio " + consultorio.getId() + " no tiene horarios específicos configurados, usando horario del esquema");
                }
                
                // Si no hay intersección válida, continuar con el siguiente horario
                if (slotStart.isAfter(slotEnd) || slotStart.equals(slotEnd)) {
                    System.out.println(">>> No hay intersección válida entre horario del esquema (" + horario.getHoraInicio() + "-" + horario.getHoraFin() + 
                                      ") y consultorio (" + slotStart + "-" + slotEnd + ") para " + diaSemana);
                    continue;
                }
                
                // Generar slots usando el método estándar que maneja mantenimiento correctamente
                System.out.println(">>> Generando slots para " + diaSemana + " (" + fechaEvento + ") de " + slotStart + " a " + slotEnd);
                List<TurnoDTO> slotsGenerados = generarSlotsParaHorario(fechaEvento, slotStart, slotEnd, 
                    esquemaTurnoFinal, duracion, eventoIdCounter);
                System.out.println(">>> Se generaron " + slotsGenerados.size() + " slots para " + fechaEvento);
                eventos.addAll(slotsGenerados);
                eventoIdCounter += 50;
            }
        }

        System.out.println("=== RESUMEN GENERACIÓN DE EVENTOS ===");
        System.out.println("Total de eventos generados: " + eventos.size());
        System.out.println("Esquema ID: " + esquemaTurnoFinal.getId() + ", Staff Médico: " + esquemaTurnoFinal.getStaffMedico().getId());
        
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
        String diaSemana = fecha.getDayOfWeek().name();
        
        // Usar el servicio especializado para distribuir consultorios
        // CRÍTICO: Limpiar asignaciones anteriores para redistribución limpia
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
    
    /**
     * Genera slots especiales para días con configuraciones excepcionales.
     * Este método crea slots que muestran información sobre feriados, mantenimientos
     * o atención especial, permitiendo que el frontend discrimine el tipo.
     */
    private List<TurnoDTO> generarSlotsParaDiaExcepcional(LocalDate fecha, LocalTime inicio, LocalTime fin, 
                                                         EsquemaTurno esquemaTurno, 
                                                         List<ConfiguracionExcepcional> configuraciones,
                                                         int eventoIdCounter) {
        List<TurnoDTO> slots = new ArrayList<>();
        int intervalo = esquemaTurno.getIntervalo();
        
        // Verificar si es feriado (afecta todo el día)
        Optional<ConfiguracionExcepcional> feriado = configuraciones.stream()
            .filter(c -> c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.FERIADO)
            .findFirst();
            
        // Obtener configuración de mantenimiento para este consultorio
        Optional<ConfiguracionExcepcional> mantenimiento = configuraciones.stream()
            .filter(c -> c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.MANTENIMIENTO)
            .filter(c -> c.getConsultorio() != null && 
                       c.getConsultorio().getId().equals(esquemaTurno.getConsultorio().getId()))
            .findFirst();
            
        // Obtener configuración de atención especial para este esquema
        Optional<ConfiguracionExcepcional> atencionEspecial = configuraciones.stream()
            .filter(c -> c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.ATENCION_ESPECIAL)
            .filter(c -> c.getEsquemaTurno() != null && 
                       c.getEsquemaTurno().getId().equals(esquemaTurno.getId()))
            .findFirst();
        
        LocalTime slotStart = inicio;
        
        while (slotStart.isBefore(fin)) {
            LocalTime nextSlot = slotStart.plusMinutes(intervalo);
            
            if (nextSlot.isAfter(fin)) {
                break;
            }

            // Verificar si existe un turno real en este horario
            boolean slotOcupado = turnoRepository.existsByFechaAndHoraInicioAndStaffMedicoIdAndEstadoNot(
                fecha, slotStart, esquemaTurno.getStaffMedico().getId(), EstadoTurno.CANCELADO);

            // Determinar el tipo de excepción para este slot específico
            String tipoExcepcion = null;
            String descripcionExcepcion = null;
            boolean esMantenimiento = false;
            
            // Verificar si es feriado (afecta todo el día)
            if (feriado.isPresent()) {
                tipoExcepcion = "FERIADO";
                descripcionExcepcion = feriado.get().getDescripcion();
                // CORRECCIÓN: Los slots en feriados deben marcarse como ocupados (no disponibles)
                slotOcupado = true;
            }
            // Verificar si este slot específico se solapa con el horario de mantenimiento
            else if (mantenimiento.isPresent()) {
                ConfiguracionExcepcional mant = mantenimiento.get();
                // Solo marcar como mantenimiento si el slot se solapa con el horario específico
                if (mant.getHoraInicio() != null && mant.getHoraFin() != null) {
                    // Verificar si hay solapamiento entre el slot y el horario de mantenimiento
                    boolean seSuperpone = slotStart.isBefore(mant.getHoraFin()) && 
                                         nextSlot.isAfter(mant.getHoraInicio());
                    if (seSuperpone) {
                        tipoExcepcion = "MANTENIMIENTO";
                        descripcionExcepcion = mant.getDescripcion();
                        esMantenimiento = true;
                        // CORRECCIÓN: Los slots en mantenimiento deben marcarse como ocupados (no disponibles)
                        slotOcupado = true;
                    }
                }
            }
            // Verificar si este slot se solapa con atención especial
            else if (atencionEspecial.isPresent()) {
                ConfiguracionExcepcional atEsp = atencionEspecial.get();
                if (atEsp.getHoraInicio() != null && atEsp.getHoraFin() != null) {
                    // Verificar si hay solapamiento entre el slot y el horario de atención especial
                    boolean seSuperpone = slotStart.isBefore(atEsp.getHoraFin()) && 
                                         nextSlot.isAfter(atEsp.getHoraInicio());
                    if (seSuperpone) {
                        tipoExcepcion = "ATENCION_ESPECIAL";
                        descripcionExcepcion = atEsp.getDescripcion();
                        // CORRECCIÓN: Los slots de atención especial deben marcarse como ocupados (no disponibles)
                        slotOcupado = true;
                    }
                }
            }

            TurnoDTO evento = new TurnoDTO();
            evento.setId(eventoIdCounter++);
            evento.setFecha(fecha);
            evento.setHoraInicio(slotStart);
            evento.setHoraFin(nextSlot);
            
            // Configurar el título según el tipo de excepción
            String titulo;
            if (tipoExcepcion != null) {
                titulo = tipoExcepcion;
                if (descripcionExcepcion != null && !descripcionExcepcion.isEmpty()) {
                    titulo += ": " + descripcionExcepcion;
                }
                if (slotOcupado) {
                    titulo = "Ocupado (" + titulo + ")";
                }
            } else {
                // Slot normal (sin excepción)
                titulo = slotOcupado ? "Ocupado" : "Disponible";
            }
            
            evento.setTitulo(titulo);
            evento.setEsSlot(true);
            evento.setOcupado(slotOcupado);
            evento.setEnMantenimiento(esMantenimiento);
            
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

            // Si hay un turno ocupado, obtener datos del paciente
            if (slotOcupado && tipoExcepcion == null) { // Solo para slots normales ocupados
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

            slots.add(evento);
            
            // Avanzar al siguiente slot
            slotStart = slotStart.plusMinutes(intervalo);
        }
        
        return slots;
    }
}