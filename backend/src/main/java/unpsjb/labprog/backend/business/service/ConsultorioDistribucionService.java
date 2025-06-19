package unpsjb.labprog.backend.business.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.dto.ConsultorioDTO;
import unpsjb.labprog.backend.model.Consultorio;
import unpsjb.labprog.backend.model.DisponibilidadMedico;
import unpsjb.labprog.backend.model.EsquemaTurno;
import unpsjb.labprog.backend.model.StaffMedico;

/**
 * Servicio para la distribución inteligente de consultorios entre médicos.
 */
@Service
public class ConsultorioDistribucionService {

    @Autowired
    private StaffMedicoRepository staffMedicoRepository;

    @Autowired
    private ConsultorioRepository consultorioRepository;

    @Autowired
    private EsquemaTurnoRepository esquemaTurnoRepository;

    @Autowired
    private ConsultorioService consultorioService;
    
    private final Map<Integer, List<BloqueHorario>> asignacionesTemporales = new HashMap<>();
    private boolean procesoEnLoteActivo = false;

    public static class BloqueHorario {
        private String dia;
        private LocalTime inicio;
        private LocalTime fin;
        private Integer medicoId;
        private Integer consultorioId;

        public BloqueHorario(String dia, LocalTime inicio, LocalTime fin, Integer medicoId, Integer consultorioId) {
            this.dia = dia;
            this.inicio = inicio;
            this.fin = fin;
            this.medicoId = medicoId;
            this.consultorioId = consultorioId;
        }

        public String getDia() { return dia; }
        public void setDia(String dia) { this.dia = dia; }
        public LocalTime getInicio() { return inicio; }
        public void setInicio(LocalTime inicio) { this.inicio = inicio; }
        public LocalTime getFin() { return fin; }
        public void setFin(LocalTime fin) { this.fin = fin; }
        public Integer getMedicoId() { return medicoId; }
        public void setMedicoId(Integer medicoId) { this.medicoId = medicoId; }
        public Integer getConsultorioId() { return consultorioId; }
        public void setConsultorioId(Integer consultorioId) { this.consultorioId = consultorioId; }

        public boolean seSolapaCon(BloqueHorario otro) {
            if (!this.dia.equalsIgnoreCase(otro.dia)) {
                return false;
            }
            return this.inicio.isBefore(otro.fin) && this.fin.isAfter(otro.inicio);
        }

        @Override
        public String toString() {
            return String.format("%s %s-%s (Médico:%d, Consultorio:%d)", 
                dia, inicio, fin, medicoId, consultorioId);
        }
    }

    public static class ResultadoAsignacion {
        private final Integer medicoId;
        private final Integer consultorioId;
        private final List<BloqueHorario> bloquesAsignados;
        private final double puntuacion;
        private final String motivoAsignacion;

        public ResultadoAsignacion(Integer medicoId, Integer consultorioId, 
                                 List<BloqueHorario> bloquesAsignados, 
                                 double puntuacion, String motivoAsignacion) {
            this.medicoId = medicoId;
            this.consultorioId = consultorioId;
            this.bloquesAsignados = bloquesAsignados;
            this.puntuacion = puntuacion;
            this.motivoAsignacion = motivoAsignacion;
        }

        public Integer getMedicoId() { return medicoId; }
        public Integer getConsultorioId() { return consultorioId; }
        public List<BloqueHorario> getBloquesAsignados() { return bloquesAsignados; }
        public double getPuntuacion() { return puntuacion; }
        public String getMotivoAsignacion() { return motivoAsignacion; }
    }

    public void iniciarProcesoEnLote() {
        procesoEnLoteActivo = true;
        asignacionesTemporales.clear();
    }
    
    public void finalizarProcesoEnLote() {
        procesoEnLoteActivo = false;
        asignacionesTemporales.clear();
    }
    
    /**
     * Limpia todas las asignaciones de consultorios para médicos de un centro específico
     * CRÍTICO: Esto permite hacer una redistribución limpia desde cero
     * NUEVA VERSIÓN: Usa eliminación forzada con DELETE para garantizar limpieza completa
     */
    @Transactional
    public void limpiarAsignacionesConsultorios(Integer centroId) {
        try {
            System.out.println(String.format("🧹 LIMPIANDO ASIGNACIONES ANTERIORES - Centro: %d", centroId));
            
            // MÉTODO 1: Eliminar TODOS los esquemas de turno del centro (DELETE completo)
            List<StaffMedico> medicosDelCentro = staffMedicoRepository.findByCentroAtencionId(centroId);
            
            int esquemasEliminados = 0;
            int consultoriosLiberados = 0;
            
            for (StaffMedico medico : medicosDelCentro) {
                // Buscar TODOS los esquemas de turno para este médico
                List<EsquemaTurno> esquemasDelMedico = esquemaTurnoRepository.findByStaffMedicoId(medico.getId());
                
                System.out.println(String.format("   👨‍⚕️ Médico %s: %d esquemas encontrados", 
                    medico.getMedico().getNombre(), esquemasDelMedico.size()));
                
                for (EsquemaTurno esquema : esquemasDelMedico) {
                    if (esquema.getConsultorio() != null) {
                        System.out.println(String.format("   🗑️ ELIMINANDO asignación Consultorio %d → Médico %s", 
                            esquema.getConsultorio().getId(), medico.getMedico().getNombre()));
                        consultoriosLiberados++;
                    }
                    
                    // ELIMINAR completamente el esquema de turno
                    esquemaTurnoRepository.delete(esquema);
                    esquemasEliminados++;
                    
                    System.out.println(String.format("   ❌ Esquema ID %d ELIMINADO", esquema.getId()));
                }
            }
            
            // MÉTODO 2: Verificación adicional - eliminar cualquier esquema huérfano del centro
            System.out.println("🔍 VERIFICACIÓN ADICIONAL: Buscando esquemas huérfanos...");
            
            List<EsquemaTurno> todosEsquemas = esquemaTurnoRepository.findAll();
            int esquemasHuerfanos = 0;
            
            for (EsquemaTurno esquema : todosEsquemas) {
                if (esquema.getCentroAtencion() != null && 
                    esquema.getCentroAtencion().getId().equals(centroId)) {
                    
                    System.out.println(String.format("   🎯 Esquema huérfano encontrado ID %d - ELIMINANDO", esquema.getId()));
                    esquemaTurnoRepository.delete(esquema);
                    esquemasHuerfanos++;
                }
            }
            
            // Forzar flush de la transacción para asegurar eliminación inmediata
            esquemaTurnoRepository.flush();
            
            System.out.println(String.format("✅ LIMPIEZA RADICAL COMPLETADA - %d esquemas eliminados, %d consultorios liberados, %d huérfanos eliminados", 
                esquemasEliminados, consultoriosLiberados, esquemasHuerfanos));
            
        } catch (Exception e) {
            System.err.println(String.format("❌ ERROR en limpieza radical: %s", e.getMessage()));
            e.printStackTrace();
            throw new RuntimeException("Error al limpiar asignaciones de consultorios", e);
        }
    }
    
    /**
     * Distribuye consultorios para múltiples médicos manteniendo estado consistente
     */
    public Map<Integer, Integer> distribuirConsultorios(Integer centroId, LocalDate fecha, String diaSemana) {
        return distribuirConsultorios(centroId, fecha, diaSemana, false);
    }
    
    /**
     * Distribuye consultorios para múltiples médicos manteniendo estado consistente
     * @param limpiarAsignacionesPrevias Si true, elimina todas las asignaciones de consultorios anteriores
     */
    public Map<Integer, Integer> distribuirConsultorios(Integer centroId, LocalDate fecha, String diaSemana, boolean limpiarAsignacionesPrevias) {
        Map<Integer, Integer> asignacionFinal = new HashMap<>();
        
        try {
            // PASO OPCIONAL: Limpiar asignaciones anteriores
            if (limpiarAsignacionesPrevias) {
                limpiarAsignacionesConsultorios(centroId);
            }
            
            // Iniciar proceso en lote
            iniciarProcesoEnLote();
            
            List<StaffMedico> todosMedicos = obtenerMedicosConPorcentajes(centroId);
            
            System.out.println(String.format("🏥 DISTRIBUCIÓN MASIVA - Centro: %d, Médicos: %d (Limpieza previa: %s)", 
                centroId, todosMedicos.size(), limpiarAsignacionesPrevias ? "SÍ" : "NO"));
            
            // Asignar consultorios para cada médico manteniendo estado compartido
            for (StaffMedico medico : todosMedicos) {
                Integer consultorioId = asignarConsultorioSegunPorcentajes(medico.getId(), centroId);
                if (consultorioId != null) {
                    asignacionFinal.put(medico.getId(), consultorioId);
                }
            }
            
            System.out.println(String.format("✅ DISTRIBUCIÓN COMPLETADA - %d asignaciones exitosas", 
                asignacionFinal.size()));
            
        } finally {
            // Siempre finalizar el proceso en lote
            finalizarProcesoEnLote();
        }
        
        return asignacionFinal;
    }

    /**
     * Asigna un consultorio específico para un médico basado en algoritmo inteligente completo.
     * 
     * @param staffMedicoId ID del staff médico
     * @param centroId ID del centro de atención
     * @return ID del consultorio asignado o null si no se puede asignar
     */
    public Integer asignarConsultorioSegunPorcentajes(Integer staffMedicoId, Integer centroId) {
        try {
            System.out.println(String.format("🎯 INICIANDO ASIGNACIÓN INTELIGENTE - Médico: %d, Centro: %d", staffMedicoId, centroId));
            
            // 1. Validaciones básicas
            StaffMedico medico = validarYObtenerMedico(staffMedicoId);
            List<Consultorio> consultorios = validarYObtenerConsultorios(centroId);
            List<StaffMedico> todosMedicos = obtenerMedicosConPorcentajes(centroId);
            
            // 2. Ejecutar algoritmo completo
            ResultadoAsignacion resultado = ejecutarAlgoritmoCompleto(medico, todosMedicos, consultorios);
            
            if (resultado != null) {
                System.out.println(String.format("✅ ASIGNACIÓN EXITOSA - Médico: %s → Consultorio: %d (Puntuación: %.3f, Motivo: %s)", 
                    medico.getMedico().getNombre(), resultado.getConsultorioId(), 
                    resultado.getPuntuacion(), resultado.getMotivoAsignacion()));
                return resultado.getConsultorioId();
            } else {
                System.out.println("❌ NO SE PUDO ASIGNAR CONSULTORIO");
                return null;
            }
            
        } catch (Exception e) {
            System.err.println("💥 ERROR EN ASIGNACIÓN: " + e.getMessage());
            return null;
        }
    }

    /**
     * Algoritmo completo que ejecuta toda la lógica de asignación
     * Incluye manejo inteligente de escenarios con más médicos que consultorios
     */
    private ResultadoAsignacion ejecutarAlgoritmoCompleto(StaffMedico medico, List<StaffMedico> todosMedicos, List<Consultorio> consultorios) {
        // 1. Analizar la situación: médicos vs consultorios
        int numMedicos = todosMedicos.size();
        int numConsultorios = consultorios.size();
        
        System.out.println(String.format("📊 ANÁLISIS INICIAL - %d médicos, %d consultorios", numMedicos, numConsultorios));
        
        if (numMedicos > numConsultorios) {
            System.out.println("⚠️ ESCENARIO COMPLEJO: Más médicos que consultorios - aplicando algoritmo avanzado");
        }
        
        // 2. Obtener asignaciones actuales para evitar conflictos
        Map<Integer, List<BloqueHorario>> asignacionesActuales = obtenerAsignacionesActuales(todosMedicos);
        
        // 3. Obtener bloques de horario del médico
        List<BloqueHorario> bloquesDelMedico = extraerBloquesHorarioDelMedico(medico);
        if (bloquesDelMedico.isEmpty()) {
            System.out.println("⚠️ Médico sin disponibilidades horarias configuradas");
            return null;
        }
        
        // 4. Evaluar cada consultorio con VALIDACIONES ESTRICTAS
        List<ResultadoAsignacion> candidatosValidos = new ArrayList<>();
        List<ResultadoAsignacion> candidatosRechazados = new ArrayList<>();
        
        for (Consultorio consultorio : consultorios) {
            ResultadoAsignacion evaluacion = evaluarConsultorioParaMedicoConValidacionEstricta(
                medico, consultorio, bloquesDelMedico, asignacionesActuales, todosMedicos, consultorios);
            
            if (evaluacion != null && evaluacion.getPuntuacion() > 0) {
                candidatosValidos.add(evaluacion);
            } else if (evaluacion != null) {
                candidatosRechazados.add(evaluacion); // Guardar para posible búsqueda de alternativas
            }
        }
        
        // 5. PRIMERA PRIORIDAD: Consultorios que cumplen TODAS las validaciones estrictas
        if (!candidatosValidos.isEmpty()) {
            System.out.println(String.format("✅ Encontrados %d consultorios VÁLIDOS que cumplen todas las restricciones", 
                candidatosValidos.size()));
            
            ResultadoAsignacion asignacionSeleccionada;
            
            // Estrategia según escasez
            if (numMedicos > numConsultorios) {
                asignacionSeleccionada = aplicarEstrategiaEscasezConsultorios(candidatosValidos, medico, todosMedicos);
            } else {
                asignacionSeleccionada = candidatosValidos.stream()
                    .max(Comparator.comparing(ResultadoAsignacion::getPuntuacion))
                    .orElse(null);
            }
            
            // CRÍTICO: Actualizar asignaciones dinámicamente para próximas evaluaciones
            if (asignacionSeleccionada != null) {
                actualizarAsignacionesDinamicas(asignacionesActuales, asignacionSeleccionada);
            }
            
            return asignacionSeleccionada;
        }
        
        // 6. SEGUNDA PRIORIDAD: Búsqueda de alternativas si no hay candidatos válidos
        System.out.println(String.format("⚠️ NO se encontraron consultorios que cumplan TODAS las restricciones"));
        System.out.println("🔍 Iniciando búsqueda de ALTERNATIVAS...");
        
        ResultadoAsignacion alternativa = buscarConsultorioAlternativo(
            medico, consultorios, bloquesDelMedico, asignacionesActuales, candidatosRechazados);
        
        if (alternativa != null) {
            System.out.println(String.format("🎯 ALTERNATIVA encontrada: Consultorio %d con restricciones relajadas", 
                alternativa.getConsultorioId()));
            
            // CRÍTICO: También actualizar asignaciones para alternativas
            actualizarAsignacionesDinamicas(asignacionesActuales, alternativa);
            return alternativa;
        }
        
        System.out.println("❌ NO se encontraron consultorios compatibles ni alternativas viables");
        return null;
    }

    /**
     * Evalúa qué tan compatible es un consultorio específico para un médico con VALIDACIONES ESTRICTAS
     * NUEVA VERSIÓN: aplicación rigurosa de restricciones de horarios y conflictos
     */
    private ResultadoAsignacion evaluarConsultorioParaMedicoConValidacionEstricta(
            StaffMedico medico, Consultorio consultorio, List<BloqueHorario> bloquesDelMedico,
            Map<Integer, List<BloqueHorario>> asignacionesActuales, 
            List<StaffMedico> todosMedicos, List<Consultorio> consultorios) {
        
        try {
            ConsultorioDTO consultorioDTO = consultorioService.findById(consultorio.getId()).orElse(null);
            if (consultorioDTO == null) {
                return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                    new ArrayList<>(), 0.0, "DTO no encontrado");
            }
            
            // 1. RESTRICCIÓN CRÍTICA #1: Validar horarios de consultorio
            List<BloqueHorario> bloquesCompatibles = validarHorariosConsultorioEstricto(
                bloquesDelMedico, consultorioDTO);
            
            if (bloquesCompatibles.isEmpty()) {
                String motivo = String.format("RECHAZADO - Médico trabaja fuera de horarios del consultorio");
                return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                    new ArrayList<>(), 0.0, motivo);
            }
            
            // 2. RESTRICCIÓN CRÍTICA #2: Validar conflictos con otros médicos
            List<BloqueHorario> asignacionesConsultorio = asignacionesActuales.getOrDefault(consultorio.getId(), new ArrayList<>());
            List<BloqueHorario> bloquesSinConflicto = validarConflictosMedicosEstricto(
                bloquesCompatibles, asignacionesConsultorio, medico.getId());
            
            // 3. VALIDACIÓN CRÍTICA: SI HAY CONFLICTOS, RECHAZAR COMPLETAMENTE
            if (bloquesSinConflicto.size() != bloquesCompatibles.size()) {
                int bloquesConConflicto = bloquesCompatibles.size() - bloquesSinConflicto.size();
                String motivo = String.format("RECHAZADO - %d bloques con conflictos con otros médicos", bloquesConConflicto);
                return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                    bloquesSinConflicto, 0.0, motivo);
            }
            
            // 4. VALIDACIÓN ADICIONAL: Cobertura mínima requerida
            double cobertura = (double) bloquesSinConflicto.size() / bloquesDelMedico.size();
            if (cobertura < 0.8) { // Aumentar umbral a 80% para ser más estricto
                String motivo = String.format("RECHAZADO - Cobertura insuficiente (%.1f%% < 80%%)", cobertura * 100);
                return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                    bloquesSinConflicto, 0.0, motivo);
            }
            
            // 5. Si llegamos aquí, el consultorio es VÁLIDO - calcular puntuación
            double puntuacion = calcularPuntuacionCompleta(
                medico, consultorio, bloquesSinConflicto, bloquesDelMedico, 
                asignacionesActuales, todosMedicos, consultorios);
            
            String motivo = String.format("VÁLIDO - Cobertura: %.1f%% (%d/%d), Sin conflictos, Puntuación: %.3f", 
                cobertura * 100, bloquesSinConflicto.size(), bloquesDelMedico.size(), puntuacion);
            
            return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                bloquesSinConflicto, puntuacion, motivo);
            
        } catch (Exception e) {
            System.err.println(String.format("Error en evaluación estricta consultorio %d: %s", consultorio.getId(), e.getMessage()));
            return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                new ArrayList<>(), 0.0, "Error en evaluación: " + e.getMessage());
        }
    }

    // ===============================================
    // MÉTODOS DE VALIDACIÓN Y OBTENCIÓN DE DATOS
    // ===============================================

    private StaffMedico validarYObtenerMedico(Integer staffMedicoId) {
        Optional<StaffMedico> staffOpt = staffMedicoRepository.findById(staffMedicoId);
        if (!staffOpt.isPresent()) {
            throw new IllegalArgumentException("Staff médico no encontrado con ID: " + staffMedicoId);
        }
        
        StaffMedico staff = staffOpt.get();
        if (staff.getPorcentaje() == null || staff.getPorcentaje() <= 0) {
            throw new IllegalStateException("El médico no tiene porcentaje configurado o es inválido");
        }
        
        return staff;
    }

    private List<Consultorio> validarYObtenerConsultorios(Integer centroId) {
        List<Consultorio> consultorios = consultorioRepository.findByCentroAtencionId(centroId);
        if (consultorios.isEmpty()) {
            throw new IllegalStateException("No hay consultorios disponibles en el centro");
        }
        return consultorios;
    }

    private List<StaffMedico> obtenerMedicosConPorcentajes(Integer centroId) {
        return staffMedicoRepository.findByCentroAtencionId(centroId)
            .stream()
            .filter(s -> s.getPorcentaje() != null && s.getPorcentaje() > 0)
            .collect(Collectors.toList());
    }

    // ===============================================
    // MÉTODOS DE PROCESAMIENTO DE HORARIOS
    // ===============================================

    private List<BloqueHorario> extraerBloquesHorarioDelMedico(StaffMedico medico) {
        List<BloqueHorario> bloques = new ArrayList<>();
        
        try {
            // Verificar que el médico tenga disponibilidades configuradas
            if (medico.getDisponibilidad() == null || medico.getDisponibilidad().isEmpty()) {
                System.out.println(String.format("⚠️ Médico %s sin disponibilidades configuradas", 
                    medico.getMedico().getNombre()));
                return bloques;
            }
            
            int bloquesExtraidos = 0;
            
            for (DisponibilidadMedico disponibilidad : medico.getDisponibilidad()) {
                if (disponibilidad.getHorarios() != null && !disponibilidad.getHorarios().isEmpty()) {
                    for (DisponibilidadMedico.DiaHorario horario : disponibilidad.getHorarios()) {
                        // Validar que el horario tenga datos válidos
                        if (horario.getDia() != null && 
                            horario.getHoraInicio() != null && 
                            horario.getHoraFin() != null &&
                            horario.getHoraInicio().isBefore(horario.getHoraFin())) {
                            
                            BloqueHorario bloque = new BloqueHorario(
                                horario.getDia().toUpperCase(), // Normalizar días
                                horario.getHoraInicio(),
                                horario.getHoraFin(),
                                medico.getId(),
                                null // Se asignará después
                            );
                            bloques.add(bloque);
                            bloquesExtraidos++;
                        } else {
                            System.out.println(String.format("⚠️ Horario inválido ignorado para médico %s: %s %s-%s", 
                                medico.getMedico().getNombre(), 
                                horario.getDia(), 
                                horario.getHoraInicio(), 
                                horario.getHoraFin()));
                        }
                    }
                }
            }
            
            System.out.println(String.format("📅 Extraídos %d bloques horarios válidos para médico %s", 
                bloquesExtraidos, medico.getMedico().getNombre()));
            
        } catch (Exception e) {
            System.err.println(String.format("❌ Error extrayendo horarios del médico %s: %s", 
                medico.getMedico().getNombre(), e.getMessage()));
        }
        
        return bloques;
    }

    private boolean esBloqueCompatibleConConsultorio(BloqueHorario bloque, ConsultorioDTO consultorio) {
        try {
            if (consultorio.getHorariosSemanales() == null || consultorio.getHorariosSemanales().isEmpty()) {
                return false;
            }
            
            String diaBloque = normalizarDia(bloque.getDia());
            
            for (ConsultorioDTO.HorarioConsultorioDTO horarioConsultorio : consultorio.getHorariosSemanales()) {
                String diaConsultorio = normalizarDia(horarioConsultorio.getDiaSemana());
                
                if (diaConsultorio.equals(diaBloque)) {
                    if (!horarioConsultorio.getActivo()) {
                        return false;
                    }
                    
                    if (horarioConsultorio.getHoraApertura() == null || 
                        horarioConsultorio.getHoraCierre() == null) {
                        return false;
                    }
                    
                    LocalTime apertura = horarioConsultorio.getHoraApertura();
                    LocalTime cierre = horarioConsultorio.getHoraCierre();
                    
                    // Ajuste automático de horarios
                    LocalTime inicioAjustado = bloque.getInicio();
                    LocalTime finAjustado = bloque.getFin();
                    
                    if (inicioAjustado.isBefore(apertura)) {
                        inicioAjustado = apertura;
                    }
                    
                    if (finAjustado.isAfter(cierre)) {
                        finAjustado = cierre;
                    }
                    
                    if (!inicioAjustado.isBefore(finAjustado)) {
                        return false;
                    }
                    
                    // Aplicar ajuste al bloque
                    bloque.setInicio(inicioAjustado);
                    bloque.setFin(finAjustado);
                    
                    return true;
                }
            }
            
            return false;
            
        } catch (Exception e) {
            return false;
        }
    }
    
    /**
     * Normaliza nombres de días para comparación consistente
     */
    private String normalizarDia(String dia) {
        if (dia == null) return "";
        
        String diaNormalizado = dia.toUpperCase().trim();
        
        // Mapear diferentes formatos de días usando switch expression
        return switch (diaNormalizado) {
            case "LUNES", "MONDAY", "LUN", "MON" -> "LUNES";
            case "MARTES", "TUESDAY", "MAR", "TUE" -> "MARTES";
            case "MIERCOLES", "MIÉRCOLES", "WEDNESDAY", "MIE", "WED" -> "MIERCOLES";
            case "JUEVES", "THURSDAY", "JUE", "THU" -> "JUEVES";
            case "VIERNES", "FRIDAY", "VIE", "FRI" -> "VIERNES";
            case "SABADO", "SÁBADO", "SATURDAY", "SAB", "SAT" -> "SABADO";
            case "DOMINGO", "SUNDAY", "DOM", "SUN" -> "DOMINGO";
            default -> diaNormalizado;
        };
    }

    private List<BloqueHorario> filtrarBloquesSinConflictos(
            List<BloqueHorario> bloquesCompatibles, List<BloqueHorario> asignacionesEnConsultorio) {
        
        List<BloqueHorario> bloquesSinConflicto = new ArrayList<>();
        
        for (BloqueHorario bloque : bloquesCompatibles) {
            boolean tieneConflicto = false;
            
            for (BloqueHorario asignacionExistente : asignacionesEnConsultorio) {
                if (!asignacionExistente.getMedicoId().equals(bloque.getMedicoId())) {
                    boolean conflictoDetectado = verificarSolapamientoEstricto(bloque, asignacionExistente);
                    
                    if (conflictoDetectado) {
                        tieneConflicto = true;
                        break;
                    }
                }
            }
            
            if (!tieneConflicto) {
                bloquesSinConflicto.add(bloque);
            }
        }
        
        return bloquesSinConflicto;
    }
    
    private boolean verificarSolapamientoEstricto(BloqueHorario bloque1, BloqueHorario bloque2) {
        // Si no son del mismo día, no hay conflicto
        if (!normalizarDia(bloque1.getDia()).equals(normalizarDia(bloque2.getDia()))) {
            return false;
        }
        
        // Detectar solapamiento real excluyendo horarios adyacentes
        return bloque1.getInicio().isBefore(bloque2.getFin()) && 
               bloque1.getFin().isAfter(bloque2.getInicio());
    }

    /**
     * Obtiene las asignaciones actuales de todos los médicos por consultorio
     * Consulta esquemas de turno reales de la base de datos + asignaciones temporales en lote
     */
    private Map<Integer, List<BloqueHorario>> obtenerAsignacionesActuales(@SuppressWarnings("unused") List<StaffMedico> todosMedicos) {
        Map<Integer, List<BloqueHorario>> asignaciones = new HashMap<>();
        
        try {
            // Obtener todos los esquemas de turno con consultorios asignados desde la BD
            List<EsquemaTurno> esquemasExistentes = esquemaTurnoRepository.findAll()
                .stream()
                .filter(esquema -> esquema.getConsultorio() != null)
                .collect(Collectors.toList());
            
            // Mapear esquemas existentes a bloques horarios
            for (EsquemaTurno esquema : esquemasExistentes) {
                Integer consultorioId = esquema.getConsultorio().getId();
                Integer medicoId = esquema.getStaffMedico().getId();
                
                // Convertir horarios del esquema a bloques
                List<BloqueHorario> bloquesEsquema = esquema.getHorarios().stream()
                    .map(horario -> new BloqueHorario(
                        horario.getDia(),
                        horario.getHoraInicio(),
                        horario.getHoraFin(),
                        medicoId,
                        consultorioId
                    ))
                    .collect(Collectors.toList());
                
                asignaciones.computeIfAbsent(consultorioId, k -> new ArrayList<>()).addAll(bloquesEsquema);
            }
            
            // CRÍTICO: Agregar asignaciones temporales del proceso en lote
            if (procesoEnLoteActivo && !asignacionesTemporales.isEmpty()) {
                for (Map.Entry<Integer, List<BloqueHorario>> entry : asignacionesTemporales.entrySet()) {
                    Integer consultorioId = entry.getKey();
                    List<BloqueHorario> bloquesTemporales = entry.getValue();
                    asignaciones.computeIfAbsent(consultorioId, k -> new ArrayList<>()).addAll(bloquesTemporales);
                }
            }
            
        } catch (Exception e) {
            System.err.println("Error al obtener asignaciones actuales: " + e.getMessage());
        }
        
        return asignaciones;
    }

    // ===============================================
    // CÁLCULO DE PUNTUACIÓN
    // ===============================================

    /**
     * Calcula la puntuación completa considerando todos los factores
     */
    private double calcularPuntuacionCompleta(
            StaffMedico medico, Consultorio consultorio, 
            List<BloqueHorario> bloquesSinConflicto, List<BloqueHorario> bloquesTotales,
            Map<Integer, List<BloqueHorario>> asignacionesActuales,
            List<StaffMedico> todosMedicos, List<Consultorio> consultorios) {
        
        double puntuacion = 0.0;
        
        // FACTOR 1: Compatibilidad de horarios (35%)
        double compatibilidad = (double) bloquesSinConflicto.size() / bloquesTotales.size();
        puntuacion += compatibilidad * 0.35;
        
        // FACTOR 2: Distribución por porcentajes (30%)
        double factorPorcentaje = calcularFactorPorcentaje(medico, todosMedicos, consultorios);
        puntuacion += factorPorcentaje * 0.30;
        
        // FACTOR 3: Balance de carga entre consultorios (25%)
        double factorBalance = calcularFactorBalance(consultorio, asignacionesActuales, consultorios.size());
        puntuacion += factorBalance * 0.25;
        
        // FACTOR 4: Eficiencia de uso del consultorio (10%)
        double factorEficiencia = calcularFactorEficiencia(bloquesSinConflicto);
        puntuacion += factorEficiencia * 0.10;
        
        return puntuacion;
    }

    private double calcularFactorPorcentaje(StaffMedico medico, List<StaffMedico> todosMedicos, @SuppressWarnings("unused") List<Consultorio> consultorios) {
        double porcentajeMedico = medico.getPorcentaje();
        
        // Calcular la suma total de porcentajes para normalizar
        double totalPorcentajes = todosMedicos.stream()
            .mapToDouble(m -> {
                Double porcentaje = m.getPorcentaje();
                return (porcentaje != null) ? porcentaje : 0.0;
            })
            .sum();
        
        if (totalPorcentajes == 0) {
            return 0.5; // Valor neutro si no hay porcentajes configurados
        }
        
        // Calcular la proporción relativa de este médico
        double proporcionRelativa = porcentajeMedico / totalPorcentajes;
        
        // El factor de porcentaje favorece médicos con mayor porcentaje
        // Escala de 0.1 (mínimo) a 1.0 (máximo)
        double factor = 0.1 + (proporcionRelativa * 0.9);
        
        System.out.println(String.format("📊 Factor porcentaje - Médico %s: %.1f%% (%.3f de %.1f%% total) → Factor: %.3f", 
            medico.getMedico().getNombre(), porcentajeMedico, proporcionRelativa, totalPorcentajes, factor));
        
        return Math.min(1.0, factor);
    }

    private double calcularFactorBalance(Consultorio consultorio, Map<Integer, List<BloqueHorario>> asignacionesActuales, @SuppressWarnings("unused") int totalConsultorios) {
        // Obtener médicos únicos asignados a este consultorio
        Set<Integer> medicosEnEsteConsultorio = asignacionesActuales
            .getOrDefault(consultorio.getId(), new ArrayList<>())
            .stream()
            .map(BloqueHorario::getMedicoId)
            .collect(Collectors.toSet());
        
        int numMedicosActuales = medicosEnEsteConsultorio.size();
        
        // Calcular distribución de médicos por consultorio
        Map<Integer, Integer> distribucionMedicos = new HashMap<>();
        for (Map.Entry<Integer, List<BloqueHorario>> entry : asignacionesActuales.entrySet()) {
            Set<Integer> medicosUnicos = entry.getValue().stream()
                .map(BloqueHorario::getMedicoId)
                .collect(Collectors.toSet());
            distribucionMedicos.put(entry.getKey(), medicosUnicos.size());
        }
        
        // Calcular ocupación promedio
        double ocupacionPromedio = distribucionMedicos.values().stream()
            .mapToInt(Integer::intValue)
            .average()
            .orElse(0.0);
        
        // Factor de balance: favorece consultorios con menos médicos asignados
        double factor;
        if (numMedicosActuales == 0) {
            factor = 1.0; // Máximo para consultorios vacíos
        } else if (numMedicosActuales <= ocupacionPromedio) {
            // Favor moderado para consultorios con ocupación baja o promedio
            factor = 1.0 - (numMedicosActuales / (ocupacionPromedio + 1.0)) * 0.5;
        } else {
            // Penalización para consultorios sobrecargados
            double sobrecarga = (numMedicosActuales - ocupacionPromedio) / ocupacionPromedio;
            factor = Math.max(0.1, 0.5 - sobrecarga * 0.3);
        }
        
        return Math.max(0.0, Math.min(1.0, factor));
    }

    private double calcularFactorEficiencia(List<BloqueHorario> bloquesSinConflicto) {
        if (bloquesSinConflicto.isEmpty()) {
            return 0.0;
        }
        
        // Calcular horas totales que se pueden usar
        double horasTotales = bloquesSinConflicto.stream()
            .mapToDouble(bloque -> calcularDuracionHoras(bloque.getInicio(), bloque.getFin()))
            .sum();
        
        // Normalizar: más horas = mejor eficiencia
        return Math.min(1.0, horasTotales / 40.0); // Máximo 40 horas semanales
    }

    private double calcularDuracionHoras(LocalTime inicio, LocalTime fin) {
        return java.time.Duration.between(inicio, fin).toMinutes() / 60.0;
    }

    // ===============================================
    // MÉTODOS AUXILIARES Y DE COMPATIBILIDAD
    // ===============================================

    /**
     * Método de compatibilidad para asignar consultorio al crear esquema
     */
    public EsquemaTurno asignarConsultorioAlCrearEsquema(EsquemaTurno esquemaTurno) {
        if (esquemaTurno.getConsultorio() != null) {
            return esquemaTurno; // Ya tiene consultorio asignado
        }
        
        Integer consultorioAsignado = asignarConsultorioSegunPorcentajes(
            esquemaTurno.getStaffMedico().getId(),
            esquemaTurno.getCentroAtencion().getId()
        );
        
        if (consultorioAsignado != null) {
            Consultorio consultorio = new Consultorio();
            consultorio.setId(consultorioAsignado);
            esquemaTurno.setConsultorio(consultorio);
        }
        
        return esquemaTurno;
    }

    /**
     * Estrategia especializada para cuando hay más médicos que consultorios
     * Prioriza porcentajes y busca distribución más equitativa
     */
    private ResultadoAsignacion aplicarEstrategiaEscasezConsultorios(
            List<ResultadoAsignacion> candidatos, StaffMedico medico, List<StaffMedico> todosMedicos) {
        
        System.out.println(String.format("🎯 ESTRATEGIA ESCASEZ - Evaluando %d candidatos para médico %s (%.1f%%)", 
            candidatos.size(), medico.getMedico().getNombre(), medico.getPorcentaje()));
        
        // Ordenar candidatos por múltiples criterios
        candidatos.sort((a, b) -> {
            // 1. Priorizar por compatibilidad horaria (más bloques asignables)
            int bloquesComparacion = Integer.compare(
                b.getBloquesAsignados().size(), 
                a.getBloquesAsignados().size()
            );
            if (bloquesComparacion != 0) return bloquesComparacion;
            
            // 2. En caso de empate, priorizar por puntuación total
            return Double.compare(b.getPuntuacion(), a.getPuntuacion());
        });
        
        // Analizar si el médico tiene alto porcentaje y merece prioridad
        double porcentajeMedico = medico.getPorcentaje();
        double porcentajePromedio = todosMedicos.stream()
            .mapToDouble(m -> {
                Double porcentaje = m.getPorcentaje();
                return (porcentaje != null) ? porcentaje : 0.0;
            })
            .average()
            .orElse(0.0);
        
        boolean esMedicoAltoRango = porcentajeMedico > porcentajePromedio * 1.2;
        
        if (esMedicoAltoRango) {
            System.out.println(String.format("👑 Médico de alto rango detectado (%.1f%% vs %.1f%% promedio)", 
                porcentajeMedico, porcentajePromedio));
            
            // Para médicos de alto rango, buscar la mejor opción disponible
            return candidatos.get(0);
        } else {
            // Para médicos regulares, buscar balance entre calidad y disponibilidad
            ResultadoAsignacion mejorBalance = candidatos.stream()
                .filter(candidato -> !candidato.getBloquesAsignados().isEmpty())
                .max(Comparator.comparing(candidato -> 
                    candidato.getPuntuacion() * (candidato.getBloquesAsignados().size() / 10.0)
                ))
                .orElse(candidatos.get(0));
            
            System.out.println(String.format("⚖️ Selección balanceada para médico regular: Consultorio %d", 
                mejorBalance.getConsultorioId()));
            
            return mejorBalance;
        }
    }

    // ===============================================
    // MÉTODOS DE VALIDACIÓN ESTRICTA
    // ===============================================

    /**
     * Valida y ajusta automáticamente los bloques del médico a los horarios del consultorio
     * NUEVA FUNCIONALIDAD: Recorta horarios que excedan los límites del consultorio
     */
    private List<BloqueHorario> validarHorariosConsultorioEstricto(
            List<BloqueHorario> bloquesDelMedico, ConsultorioDTO consultorio) {
        
        List<BloqueHorario> bloquesValidos = new ArrayList<>();
        
        for (BloqueHorario bloque : bloquesDelMedico) {
            // Crear una copia del bloque para no modificar el original
            BloqueHorario bloqueAjustado = new BloqueHorario(
                bloque.getDia(), 
                bloque.getInicio(), 
                bloque.getFin(), 
                bloque.getMedicoId(), 
                bloque.getConsultorioId()
            );
            
            // Usar la lógica de ajuste automático
            if (esBloqueCompatibleConConsultorio(bloqueAjustado, consultorio)) {
                bloquesValidos.add(bloqueAjustado);
            }
        }
        
        return bloquesValidos;
    }

    /**
     * Valida que no haya conflictos con otros médicos en el mismo consultorio
     * NUEVA VERSIÓN: Usa la lógica optimizada de filtrado de conflictos
     */
    private List<BloqueHorario> validarConflictosMedicosEstricto(
            List<BloqueHorario> bloquesCompatibles, List<BloqueHorario> asignacionesConsultorio, @SuppressWarnings("unused") Integer medicoId) {
        
        // Usar la lógica de filtrado existente que ya está optimizada
        return filtrarBloquesSinConflictos(bloquesCompatibles, asignacionesConsultorio);
    }

    private ResultadoAsignacion buscarConsultorioAlternativo(
            StaffMedico medico, List<Consultorio> consultorios, List<BloqueHorario> bloquesDelMedico,
            Map<Integer, List<BloqueHorario>> asignacionesActuales, @SuppressWarnings("unused") List<ResultadoAsignacion> candidatosRechazados) {
        
        System.out.println(String.format("🔍 BÚSQUEDA DE ALTERNATIVAS para Médico %s", medico.getMedico().getNombre()));
        
        // ESTRATEGIA 1: Permitir menor cobertura pero mantener restricciones críticas
        List<ResultadoAsignacion> alternativasViables = new ArrayList<>();
        
        for (Consultorio consultorio : consultorios) {
            try {
                ConsultorioDTO consultorioDTO = consultorioService.findById(consultorio.getId()).orElse(null);
                if (consultorioDTO == null) continue;
                
                // Validar horarios estrictos (NO relajar esta restricción)
                List<BloqueHorario> bloquesCompatibles = validarHorariosConsultorioEstricto(
                    bloquesDelMedico, consultorioDTO);
                
                if (bloquesCompatibles.isEmpty()) {
                    System.out.println(String.format("   ❌ Consultorio %d: Sin horarios compatibles (restricción no relajable)", 
                        consultorio.getId()));
                    continue; // Esta restricción NUNCA se relaja
                }
                
                // Validar conflictos estrictos (NO relajar esta restricción)
                List<BloqueHorario> asignacionesConsultorio = asignacionesActuales.getOrDefault(consultorio.getId(), new ArrayList<>());
                List<BloqueHorario> bloquesSinConflicto = validarConflictosMedicosEstricto(
                    bloquesCompatibles, asignacionesConsultorio, medico.getId());
                
                if (bloquesSinConflicto.size() != bloquesCompatibles.size()) {
                    System.out.println(String.format("   ❌ Consultorio %d: Conflictos con otros médicos (restricción no relajable)", 
                        consultorio.getId()));
                    continue; // Esta restricción NUNCA se relaja
                }
                
                // RELAJAR SOLO: Umbral de cobertura (de 80% a 50%)
                double cobertura = (double) bloquesSinConflicto.size() / bloquesDelMedico.size();
                if (cobertura >= 0.5) { // Umbral relajado para alternativas
                    double puntuacion = calcularPuntuacionCompleta(
                        medico, consultorio, bloquesSinConflicto, bloquesDelMedico, 
                        asignacionesActuales, Collections.emptyList(), consultorios);
                    
                    String motivo = String.format("ALTERNATIVA - Cobertura: %.1f%% (umbral relajado)", cobertura * 100);
                    
                    ResultadoAsignacion alternativa = new ResultadoAsignacion(
                        medico.getId(), consultorio.getId(), bloquesSinConflicto, puntuacion, motivo);
                    
                    alternativasViables.add(alternativa);
                    
                    System.out.println(String.format("   ✅ Consultorio %d: %s", consultorio.getId(), motivo));
                }
                
            } catch (Exception e) {
                System.err.println(String.format("Error evaluando alternativa consultorio %d: %s", 
                    consultorio.getId(), e.getMessage()));
            }
        }
        
        // Retornar la mejor alternativa si existe
        if (!alternativasViables.isEmpty()) {
            ResultadoAsignacion mejorAlternativa = alternativasViables.stream()
                .max(Comparator.comparing(ResultadoAsignacion::getPuntuacion))
                .orElse(null);
            
            System.out.println(String.format("🎯 MEJOR ALTERNATIVA: Consultorio %d con puntuación %.3f", 
                mejorAlternativa.getConsultorioId(), mejorAlternativa.getPuntuacion()));
            
            return mejorAlternativa;
        }
        
        System.out.println("❌ NO se encontraron alternativas viables que mantengan las restricciones críticas");
        return null;
    }
    
    /**
     * Actualiza las asignaciones actuales agregando una nueva asignación
     * CRÍTICO: Mantiene la consistencia de datos durante el proceso de asignación
     */
    private void actualizarAsignacionesDinamicas(Map<Integer, List<BloqueHorario>> asignacionesActuales, 
                                                ResultadoAsignacion nuevaAsignacion) {
        
        Integer consultorioId = nuevaAsignacion.getConsultorioId();
        List<BloqueHorario> bloquesAsignados = nuevaAsignacion.getBloquesAsignados();
        
        // Actualizar el mapa de asignaciones actual (para esta evaluación)
        asignacionesActuales.computeIfAbsent(consultorioId, k -> new ArrayList<>()).addAll(bloquesAsignados);
        
        // CRÍTICO: Si estamos en proceso en lote, también actualizar asignaciones temporales
        if (procesoEnLoteActivo) {
            asignacionesTemporales.computeIfAbsent(consultorioId, k -> new ArrayList<>()).addAll(bloquesAsignados);
        }
    }
}


