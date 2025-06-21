package unpsjb.labprog.backend.business.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.dto.ConsultorioDTO;
import unpsjb.labprog.backend.model.Consultorio;
import unpsjb.labprog.backend.model.DisponibilidadMedico;
import unpsjb.labprog.backend.model.EsquemaTurno;
import unpsjb.labprog.backend.model.StaffMedico;


@Service
public class ConsultorioDistribucionService {

    // Inversión de dependencias (DIP) - usar constructor injection
    private final StaffMedicoRepository staffMedicoRepository;
    private final ConsultorioRepository consultorioRepository;
    private final EsquemaTurnoRepository esquemaTurnoRepository;
    private final ConsultorioService consultorioService;
    
    // Delegación de responsabilidades específicas (SRP)
    private final AsignacionLoteManager asignacionLoteManager;
    private final ValidadorAsignacion validadorAsignacion;
    private final CalculadorPuntuacion calculadorPuntuacion;
    private final EstrategiaSeleccionConsultorio estrategiaSeleccion;

    public ConsultorioDistribucionService(
            StaffMedicoRepository staffMedicoRepository,
            ConsultorioRepository consultorioRepository,
            EsquemaTurnoRepository esquemaTurnoRepository,
            ConsultorioService consultorioService) {
        this.staffMedicoRepository = staffMedicoRepository;
        this.consultorioRepository = consultorioRepository;
        this.esquemaTurnoRepository = esquemaTurnoRepository;
        this.consultorioService = consultorioService;
        
        // Inicializar componentes especializados
        this.asignacionLoteManager = new AsignacionLoteManager();
        this.validadorAsignacion = new ValidadorAsignacion();
        this.calculadorPuntuacion = new CalculadorPuntuacion();
        this.estrategiaSeleccion = new EstrategiaSeleccionConsultorio();
    }

    // ===============================================
    // CLASES INTERNAS ESPECIALIZADAS (SRP)
    // ===============================================

    /**
     * Maneja el estado de asignaciones en lote (SRP)
     */
    private class AsignacionLoteManager {
        private final Map<Integer, List<BloqueHorario>> asignacionesTemporales = new HashMap<>();
        private boolean procesoEnLoteActivo = false;

        public void iniciarProcesoEnLote() {
            procesoEnLoteActivo = true;
            asignacionesTemporales.clear();
        }

        public void finalizarProcesoEnLote() {
            procesoEnLoteActivo = false;
            asignacionesTemporales.clear();
        }

        public boolean estaProcesoActivo() {
            return procesoEnLoteActivo;
        }

        public Map<Integer, List<BloqueHorario>> getAsignacionesTemporales() {
            return asignacionesTemporales;
        }

        public void agregarAsignacionTemporal(Integer consultorioId, List<BloqueHorario> bloques) {
            asignacionesTemporales.computeIfAbsent(consultorioId, k -> new ArrayList<>()).addAll(bloques);
        }
    }

    /**
     * Valida restricciones de asignación (SRP)
     */
    private class ValidadorAsignacion {
        
        public List<BloqueHorario> validarHorariosConsultorio(
                List<BloqueHorario> bloquesDelMedico, ConsultorioDTO consultorio) {
            List<BloqueHorario> bloquesValidos = new ArrayList<>();
            
            System.out.println(String.format(
                "=== VALIDANDO HORARIOS CONSULTORIO %s ===", 
                consultorio.getNombre()
            ));
            System.out.println(String.format("Bloques del médico a validar: %d", bloquesDelMedico.size()));
            
            for (BloqueHorario bloque : bloquesDelMedico) {
                System.out.println(String.format("Validando bloque: %s", bloque.toString()));
                
                BloqueHorario bloqueAjustado = new BloqueHorario(
                    bloque.getDia(), bloque.getInicio(), bloque.getFin(), 
                    bloque.getMedicoId(), bloque.getConsultorioId()
                );
                
                if (esBloqueCompatibleConConsultorio(bloqueAjustado, consultorio)) {
                    bloquesValidos.add(bloqueAjustado);
                    System.out.println("  ✓ Bloque ACEPTADO");
                } else {
                    System.out.println("  ✗ Bloque RECHAZADO - fuera de horarios del consultorio");
                }
            }
            
            System.out.println(String.format("Resultado: %d/%d bloques válidos", bloquesValidos.size(), bloquesDelMedico.size()));
            return bloquesValidos;
        }

        public List<BloqueHorario> validarConflictosMedicos(
                List<BloqueHorario> bloquesCompatibles, List<BloqueHorario> asignacionesConsultorio) {
            return bloquesCompatibles.stream()
                .filter(bloque -> !tieneConflictoConOtrosMedicos(bloque, asignacionesConsultorio))
                .collect(Collectors.toList());
        }

        private boolean tieneConflictoConOtrosMedicos(BloqueHorario bloque, List<BloqueHorario> asignaciones) {
            return asignaciones.stream()
                .filter(asignacion -> !asignacion.getMedicoId().equals(bloque.getMedicoId()))
                .anyMatch(asignacion -> verificarSolapamiento(bloque, asignacion));
        }
    }

    /**
     * Calcula puntuaciones para asignaciones (SRP)
     */
    private class CalculadorPuntuacion {
        
        public double calcularPuntuacionCompleta(
                StaffMedico medico, Consultorio consultorio, 
                List<BloqueHorario> bloquesSinConflicto, List<BloqueHorario> bloquesTotales,
                Map<Integer, List<BloqueHorario>> asignacionesActuales,
                List<StaffMedico> todosMedicos, List<Consultorio> consultorios) {
            
            double puntuacion = 0.0;
            
            // Factor 1: Compatibilidad de horarios (35%)
            double compatibilidad = (double) bloquesSinConflicto.size() / bloquesTotales.size();
            puntuacion += compatibilidad * 0.35;
            
            // Factor 2: Distribución por porcentajes (30%)
            double factorPorcentaje = calcularFactorPorcentaje(medico, todosMedicos);
            puntuacion += factorPorcentaje * 0.30;
            
            // Factor 3: Balance de carga entre consultorios (25%)
            double factorBalance = calcularFactorBalance(consultorio, asignacionesActuales);
            puntuacion += factorBalance * 0.25;
            
            // Factor 4: Eficiencia de uso del consultorio (10%)
            double factorEficiencia = calcularFactorEficiencia(bloquesSinConflicto);
            puntuacion += factorEficiencia * 0.10;
            
            return puntuacion;
        }

        private double calcularFactorPorcentaje(StaffMedico medico, List<StaffMedico> todosMedicos) {
            Double porcentajeMedico = medico.getPorcentaje();
            if (porcentajeMedico == null) return 0.5;
            
            double totalPorcentajes = todosMedicos.stream()
                .mapToDouble(m -> {
                    Double porcentaje = m.getPorcentaje();
                    return (porcentaje != null) ? porcentaje : 0.0;
                })
                .sum();
            
            if (totalPorcentajes == 0) return 0.5;
            
            double proporcionRelativa = porcentajeMedico / totalPorcentajes;
            return Math.min(1.0, 0.1 + (proporcionRelativa * 0.9));
        }

        private double calcularFactorBalance(Consultorio consultorio, Map<Integer, List<BloqueHorario>> asignacionesActuales) {
            Set<Integer> medicosEnEsteConsultorio = asignacionesActuales
                .getOrDefault(consultorio.getId(), new ArrayList<>())
                .stream()
                .map(BloqueHorario::getMedicoId)
                .collect(Collectors.toSet());
            
            int numMedicosActuales = medicosEnEsteConsultorio.size();
            
            if (numMedicosActuales == 0) return 1.0;
            
            // Calcular ocupación promedio
            double ocupacionPromedio = asignacionesActuales.entrySet().stream()
                .mapToDouble(entry -> entry.getValue().stream()
                    .map(BloqueHorario::getMedicoId)
                    .collect(Collectors.toSet()).size())
                .average()
                .orElse(0.0);
            
            if (numMedicosActuales <= ocupacionPromedio) {
                return 1.0 - (numMedicosActuales / (ocupacionPromedio + 1.0)) * 0.5;
            } else {
                double sobrecarga = (numMedicosActuales - ocupacionPromedio) / ocupacionPromedio;
                return Math.max(0.1, 0.5 - sobrecarga * 0.3);
            }
        }

        private double calcularFactorEficiencia(List<BloqueHorario> bloquesSinConflicto) {
            if (bloquesSinConflicto.isEmpty()) return 0.0;
            
            double horasTotales = bloquesSinConflicto.stream()
                .mapToDouble(bloque -> java.time.Duration.between(bloque.getInicio(), bloque.getFin()).toMinutes() / 60.0)
                .sum();
            
            return Math.min(1.0, horasTotales / 40.0);
        }
    }

    /**
     * Estrategias de selección de consultorios (SRP)
     */
    private class EstrategiaSeleccionConsultorio {
        
        public ResultadoAsignacion seleccionarMejorConsultorio(
                List<ResultadoAsignacion> candidatos, StaffMedico medico, List<StaffMedico> todosMedicos) {
            
            if (candidatos.isEmpty()) return null;
            
            // Determinar si hay escasez de consultorios
            boolean hayEscasez = todosMedicos.size() > candidatos.size();
            
            if (hayEscasez) {
                return aplicarEstrategiaEscasez(candidatos, medico, todosMedicos);
            } else {
                return candidatos.stream()
                    .max(Comparator.comparing(ResultadoAsignacion::getPuntuacion))
                    .orElse(null);
            }
        }

        private ResultadoAsignacion aplicarEstrategiaEscasez(
                List<ResultadoAsignacion> candidatos, StaffMedico medico, List<StaffMedico> todosMedicos) {
            
            candidatos.sort((a, b) -> {
                int bloquesComparacion = Integer.compare(
                    b.getBloquesAsignados().size(), 
                    a.getBloquesAsignados().size()
                );
                if (bloquesComparacion != 0) return bloquesComparacion;
                return Double.compare(b.getPuntuacion(), a.getPuntuacion());
            });
            
            Double porcentajeMedico = medico.getPorcentaje();
            if (porcentajeMedico == null) return candidatos.get(0);
            
            double porcentajePromedio = todosMedicos.stream()
                .mapToDouble(m -> {
                    Double porcentaje = m.getPorcentaje();
                    return (porcentaje != null) ? porcentaje : 0.0;
                })
                .average()
                .orElse(0.0);
            
            boolean esMedicoAltoRango = porcentajeMedico > porcentajePromedio * 1.2;
            
            if (esMedicoAltoRango) {
                return candidatos.get(0);
            } else {
                return candidatos.stream()
                    .filter(candidato -> !candidato.getBloquesAsignados().isEmpty())
                    .max(Comparator.comparing(candidato -> 
                        candidato.getPuntuacion() * (candidato.getBloquesAsignados().size() / 10.0)
                    ))
                    .orElse(candidatos.get(0));
            }
        }
    }

    // ===============================================
    // CLASES DE DATOS (Value Objects)
    // ===============================================

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

        // Getters and setters
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

        // Getters
        public Integer getMedicoId() { return medicoId; }
        public Integer getConsultorioId() { return consultorioId; }
        public List<BloqueHorario> getBloquesAsignados() { return bloquesAsignados; }
        public double getPuntuacion() { return puntuacion; }
        public String getMotivoAsignacion() { return motivoAsignacion; }
    }

    // ===============================================
    // MÉTODOS PÚBLICOS DE LA API
    // ===============================================

    public void iniciarProcesoEnLote() {
        asignacionLoteManager.iniciarProcesoEnLote();
    }
    
    public void finalizarProcesoEnLote() {
        asignacionLoteManager.finalizarProcesoEnLote();
    }

    /**
     * Valida si los horarios de un esquema de turno son compatibles con los horarios del consultorio.
     * Este método público puede ser usado por otros servicios para validar antes de crear esquemas.
     * 
     * @param horariosEsquema Lista de horarios del esquema de turno
     * @param consultorioId ID del consultorio a validar
     * @return Lista de mensajes de error. Si está vacía, todos los horarios son válidos.
     */
    public List<String> validarHorariosEsquemaContraConsultorio(List<EsquemaTurno.Horario> horariosEsquema, Integer consultorioId) {
        List<String> errores = new ArrayList<>();
        
        try {
            Optional<ConsultorioDTO> consultorioOpt = consultorioService.findById(consultorioId);
            if (!consultorioOpt.isPresent()) {
                errores.add("Consultorio no encontrado");
                return errores;
            }
            
            ConsultorioDTO consultorio = consultorioOpt.get();
            
            for (EsquemaTurno.Horario horario : horariosEsquema) {
                BloqueHorario bloque = new BloqueHorario(
                    horario.getDia(),
                    horario.getHoraInicio(),
                    horario.getHoraFin(),
                    null, // medicoId no necesario para validación
                    consultorioId
                );
                
                if (!esBloqueCompatibleConConsultorio(bloque, consultorio)) {
                    errores.add(String.format(
                        "El horario del %s de %s a %s está fuera del horario de atención del consultorio %s",
                        horario.getDia(),
                        horario.getHoraInicio(),
                        horario.getHoraFin(),
                        consultorio.getNombre()
                    ));
                }
            }
            
        } catch (Exception e) {
            errores.add("Error al validar horarios: " + e.getMessage());
        }
        
        return errores;
    }

    /**
     * Asigna un consultorio específico para un médico basado en algoritmo inteligente completo.
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
                System.out.println(String.format("✅ ASIGNACIÓN EXITOSA - Médico: %s → Consultorio: %d (Puntuación: %.3f)", 
                    medico.getMedico().getNombre(), resultado.getConsultorioId(), resultado.getPuntuacion()));
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
     * Distribuye consultorios para múltiples médicos manteniendo estado consistente
     */
    public Map<Integer, Integer> distribuirConsultorios(Integer centroId, LocalDate fecha, String diaSemana) {
        Map<Integer, Integer> asignacionFinal = new HashMap<>();
        
        try {
            iniciarProcesoEnLote();
            List<StaffMedico> todosMedicos = obtenerMedicosConPorcentajes(centroId);
            
            for (StaffMedico medico : todosMedicos) {
                Integer consultorioId = asignarConsultorioSegunPorcentajes(medico.getId(), centroId);
                if (consultorioId != null) {
                    asignacionFinal.put(medico.getId(), consultorioId);
                }
            }
            
        } finally {
            finalizarProcesoEnLote();
        }
        
        return asignacionFinal;
    }

    // ===============================================
    // MÉTODOS PRIVADOS DE LÓGICA DE NEGOCIO
    // ===============================================

    private ResultadoAsignacion ejecutarAlgoritmoCompleto(StaffMedico medico, List<StaffMedico> todosMedicos, List<Consultorio> consultorios) {
        Map<Integer, List<BloqueHorario>> asignacionesActuales = obtenerAsignacionesActuales();
        List<BloqueHorario> bloquesDelMedico = extraerBloquesHorarioDelMedico(medico);
        
        if (bloquesDelMedico.isEmpty()) {
            return null;
        }
        
        List<ResultadoAsignacion> candidatosValidos = new ArrayList<>();
        
        for (Consultorio consultorio : consultorios) {
            ResultadoAsignacion evaluacion = evaluarConsultorioParaMedico(
                medico, consultorio, bloquesDelMedico, asignacionesActuales, todosMedicos, consultorios);
            
            if (evaluacion != null && evaluacion.getPuntuacion() > 0) {
                candidatosValidos.add(evaluacion);
            }
        }
        
        if (!candidatosValidos.isEmpty()) {
            ResultadoAsignacion asignacionSeleccionada = estrategiaSeleccion.seleccionarMejorConsultorio(
                candidatosValidos, medico, todosMedicos);
            
            if (asignacionSeleccionada != null) {
                actualizarAsignacionesDinamicas(asignacionesActuales, asignacionSeleccionada);
            }
            
            return asignacionSeleccionada;
        }
        
        return null;
    }

    private ResultadoAsignacion evaluarConsultorioParaMedico(
            StaffMedico medico, Consultorio consultorio, List<BloqueHorario> bloquesDelMedico,
            Map<Integer, List<BloqueHorario>> asignacionesActuales, 
            List<StaffMedico> todosMedicos, List<Consultorio> consultorios) {
        
        try {
            ConsultorioDTO consultorioDTO = consultorioService.findById(consultorio.getId()).orElse(null);
            if (consultorioDTO == null) {
                return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                    new ArrayList<>(), 0.0, "DTO no encontrado");
            }
            
            // Validar horarios de consultorio
            List<BloqueHorario> bloquesCompatibles = validadorAsignacion.validarHorariosConsultorio(
                bloquesDelMedico, consultorioDTO);
            
            if (bloquesCompatibles.isEmpty()) {
                String mensaje = String.format(
                    "Los horarios del médico %s no están dentro de la disponibilidad del consultorio %s. " +
                    "Verifique que los horarios del esquema estén completamente contenidos dentro de los horarios de atención del consultorio.",
                    medico.getMedico().getNombre() + " " + medico.getMedico().getApellido(),
                    consultorioDTO.getNombre()
                );
                return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                    new ArrayList<>(), 0.0, mensaje);
            }
            
            // Validar conflictos con otros médicos
            List<BloqueHorario> asignacionesConsultorio = asignacionesActuales.getOrDefault(consultorio.getId(), new ArrayList<>());
            List<BloqueHorario> bloquesSinConflicto = validadorAsignacion.validarConflictosMedicos(
                bloquesCompatibles, asignacionesConsultorio);
            
            double cobertura = (double) bloquesSinConflicto.size() / bloquesDelMedico.size();
            if (cobertura < 0.5) { // Umbral mínimo
                return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                    bloquesSinConflicto, 0.0, "Cobertura insuficiente");
            }
            
            // Calcular puntuación
            double puntuacion = calculadorPuntuacion.calcularPuntuacionCompleta(
                medico, consultorio, bloquesSinConflicto, bloquesDelMedico, 
                asignacionesActuales, todosMedicos, consultorios);
            
            return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                bloquesSinConflicto, puntuacion, "Válido");
            
        } catch (Exception e) {
            return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                new ArrayList<>(), 0.0, "Error: " + e.getMessage());
        }
    }

    // ===============================================
    // MÉTODOS DE UTILIDAD
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

    private List<BloqueHorario> extraerBloquesHorarioDelMedico(StaffMedico medico) {
        List<BloqueHorario> bloques = new ArrayList<>();
        
        if (medico.getDisponibilidad() == null || medico.getDisponibilidad().isEmpty()) {
            return bloques;
        }
        
        for (DisponibilidadMedico disponibilidad : medico.getDisponibilidad()) {
            if (disponibilidad.getHorarios() != null && !disponibilidad.getHorarios().isEmpty()) {
                for (DisponibilidadMedico.DiaHorario horario : disponibilidad.getHorarios()) {
                    if (horario.getDia() != null && 
                        horario.getHoraInicio() != null && 
                        horario.getHoraFin() != null &&
                        horario.getHoraInicio().isBefore(horario.getHoraFin())) {
                        
                        BloqueHorario bloque = new BloqueHorario(
                            horario.getDia().toUpperCase(),
                            horario.getHoraInicio(),
                            horario.getHoraFin(),
                            medico.getId(),
                            null
                        );
                        bloques.add(bloque);
                    }
                }
            }
        }
        
        return bloques;
    }

    private Map<Integer, List<BloqueHorario>> obtenerAsignacionesActuales() {
        Map<Integer, List<BloqueHorario>> asignaciones = new HashMap<>();
        
        // Obtener asignaciones de la base de datos
        List<EsquemaTurno> esquemasExistentes = esquemaTurnoRepository.findAll()
            .stream()
            .filter(esquema -> esquema.getConsultorio() != null)
            .collect(Collectors.toList());
        
        for (EsquemaTurno esquema : esquemasExistentes) {
            Integer consultorioId = esquema.getConsultorio().getId();
            Integer medicoId = esquema.getStaffMedico().getId();
            
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
        
        // Agregar asignaciones temporales
        if (asignacionLoteManager.estaProcesoActivo()) {
            for (Map.Entry<Integer, List<BloqueHorario>> entry : asignacionLoteManager.getAsignacionesTemporales().entrySet()) {
                Integer consultorioId = entry.getKey();
                List<BloqueHorario> bloquesTemporales = entry.getValue();
                asignaciones.computeIfAbsent(consultorioId, k -> new ArrayList<>()).addAll(bloquesTemporales);
            }
        }
        
        return asignaciones;
    }

    private void actualizarAsignacionesDinamicas(Map<Integer, List<BloqueHorario>> asignacionesActuales, 
                                                ResultadoAsignacion nuevaAsignacion) {
        
        Integer consultorioId = nuevaAsignacion.getConsultorioId();
        List<BloqueHorario> bloquesAsignados = nuevaAsignacion.getBloquesAsignados();
        
        asignacionesActuales.computeIfAbsent(consultorioId, k -> new ArrayList<>()).addAll(bloquesAsignados);
        
        if (asignacionLoteManager.estaProcesoActivo()) {
            asignacionLoteManager.agregarAsignacionTemporal(consultorioId, bloquesAsignados);
        }
    }

    // ===============================================
    // MÉTODOS ESTÁTICOS DE UTILIDAD
    // ===============================================

    private static String normalizarDia(String dia) {
        if (dia == null) return "";
        
        String diaNormalizado = dia.toUpperCase().trim();
        
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

    private static boolean esBloqueCompatibleConConsultorio(BloqueHorario bloque, ConsultorioDTO consultorio) {
        if (consultorio.getHorariosSemanales() == null || consultorio.getHorariosSemanales().isEmpty()) {
            // Si no hay horarios específicos configurados, no es compatible
            return false;
        }
        
        String diaBloque = normalizarDia(bloque.getDia());
        
        for (ConsultorioDTO.HorarioConsultorioDTO horarioConsultorio : consultorio.getHorariosSemanales()) {
            String diaConsultorio = normalizarDia(horarioConsultorio.getDiaSemana());
            
            if (diaConsultorio.equals(diaBloque) && horarioConsultorio.getActivo()) {
                if (horarioConsultorio.getHoraApertura() != null && 
                    horarioConsultorio.getHoraCierre() != null) {
                    
                    // AJUSTE AUTOMÁTICO: Recortar el bloque del médico para que encaje en el consultorio
                    return ajustarBloqueAConsultorio(bloque, 
                        horarioConsultorio.getHoraApertura(), 
                        horarioConsultorio.getHoraCierre());
                }
            }
        }
        return false;
    }
    
    /**
     * Ajusta automáticamente un bloque horario para que encaje dentro del horario del consultorio
     */
    private static boolean ajustarBloqueAConsultorio(BloqueHorario bloque, LocalTime aperturaConsultorio, LocalTime cierreConsultorio) {
        LocalTime inicioBloque = bloque.getInicio();
        LocalTime finBloque = bloque.getFin();
        
        // Verificar si hay alguna intersección
        if (finBloque.isBefore(aperturaConsultorio) || inicioBloque.isAfter(cierreConsultorio)) {
            // No hay intersección posible
            System.out.println(String.format(
                "Bloque %s-%s del día %s NO tiene intersección con consultorio %s-%s - RECHAZADO", 
                inicioBloque, finBloque, bloque.getDia(), aperturaConsultorio, cierreConsultorio
            ));
            return false;
        }
        
        // Ajustar el inicio del bloque
        LocalTime nuevoInicio = inicioBloque.isBefore(aperturaConsultorio) ? aperturaConsultorio : inicioBloque;
        
        // Ajustar el fin del bloque
        LocalTime nuevoFin = finBloque.isAfter(cierreConsultorio) ? cierreConsultorio : finBloque;
        
        // Verificar que el bloque ajustado tenga al menos 30 minutos
        if (java.time.Duration.between(nuevoInicio, nuevoFin).toMinutes() < 30) {
            System.out.println(String.format(
                "Bloque ajustado %s-%s del día %s es muy corto (< 30 min) - RECHAZADO", 
                nuevoInicio, nuevoFin, bloque.getDia()
            ));
            return false;
        }
        
        // Aplicar los ajustes al bloque
        boolean seAjusto = !nuevoInicio.equals(inicioBloque) || !nuevoFin.equals(finBloque);
        bloque.setInicio(nuevoInicio);
        bloque.setFin(nuevoFin);
        
        System.out.println(String.format(
            "Bloque %s del día %s: %s%s-%s contra consultorio %s-%s: AJUSTADO %s", 
            seAjusto ? "AJUSTADO" : "ORIGINAL",
            bloque.getDia(),
            seAjusto ? inicioBloque + "→" : "",
            nuevoInicio, 
            nuevoFin,
            aperturaConsultorio, 
            cierreConsultorio,
            seAjusto ? "(se recortó para encajar)" : "(ya estaba dentro)"
        ));
        
        return true;
    }
    
    /**
     * Valida que un bloque horario esté completamente dentro del rango de horarios del consultorio
     */
    private static boolean validarBloqueEnRangoHorario(BloqueHorario bloque, LocalTime aperturaConsultorio, LocalTime cierreConsultorio) {
        LocalTime inicioBloque = bloque.getInicio();
        LocalTime finBloque = bloque.getFin();
        
        // El bloque debe empezar después o en el horario de apertura
        // y terminar antes o en el horario de cierre
        boolean inicioValidado = !inicioBloque.isBefore(aperturaConsultorio);
        boolean finValidado = !finBloque.isAfter(cierreConsultorio);
        
        boolean esValido = inicioValidado && finValidado;
        
        // Log para debugging (remover en producción)
        System.out.println(String.format(
            "Validando bloque %s-%s del día %s contra consultorio %s-%s: %s (inicio: %s, fin: %s)", 
            inicioBloque, finBloque, bloque.getDia(),
            aperturaConsultorio, cierreConsultorio, 
            esValido ? "VÁLIDO" : "INVÁLIDO",
            inicioValidado ? "OK" : "FUERA DE RANGO", 
            finValidado ? "OK" : "FUERA DE RANGO"
        ));
        
        return esValido;
    }

    private static boolean verificarSolapamiento(BloqueHorario bloque1, BloqueHorario bloque2) {
        if (!normalizarDia(bloque1.getDia()).equals(normalizarDia(bloque2.getDia()))) {
            return false;
        }
        return bloque1.getInicio().isBefore(bloque2.getFin()) && 
               bloque1.getFin().isAfter(bloque2.getInicio());
    }
}
