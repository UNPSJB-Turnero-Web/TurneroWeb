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
     * PROPÓSITO: Mantener consistencia durante procesamiento de múltiples médicos
     * FUNCIONALIDAD: Evita conflictos al procesar asignaciones simultáneas
     */
    private class AsignacionLoteManager {
        // ESTADO TEMPORAL: Mapa de asignaciones en memoria durante el lote
        private final Map<Integer, List<BloqueHorario>> asignacionesTemporales = new HashMap<>();
        // BANDERA DE CONTROL: Indica si hay un proceso en lote activo
        private boolean procesoEnLoteActivo = false;

        /**
         * INICIO DE LOTE: Prepara el sistema para procesar múltiples asignaciones
         */
        public void iniciarProcesoEnLote() {
            procesoEnLoteActivo = true;
            asignacionesTemporales.clear(); // Limpia estado anterior
        }

        /**
         * FIN DE LOTE: Limpia el estado temporal y finaliza el proceso
         */
        public void finalizarProcesoEnLote() {
            procesoEnLoteActivo = false;
            asignacionesTemporales.clear(); // Libera memoria
        }

        /**
         * CONSULTA DE ESTADO: Verifica si hay un proceso en lote activo
         */
        public boolean estaProcesoActivo() {
            return procesoEnLoteActivo;
        }

        /**
         * ACCESO A DATOS: Obtiene las asignaciones temporales del lote actual
         */
        public Map<Integer, List<BloqueHorario>> getAsignacionesTemporales() {
            return asignacionesTemporales;
        }

        /**
         * ACTUALIZACIÓN TEMPORAL: Añade una asignación al estado temporal
         * FUNCIÓN: Permite que futuras evaluaciones consideren estas asignaciones
         */
        public void agregarAsignacionTemporal(Integer consultorioId, List<BloqueHorario> bloques) {
            asignacionesTemporales.computeIfAbsent(consultorioId, k -> new ArrayList<>()).addAll(bloques);
        }
    }

    /**
     * Valida restricciones de asignación (SRP)
     * PROPÓSITO: Verificar compatibilidad y detectar conflictos
     * RESPONSABILIDAD: Aplicar todas las reglas de validación del negocio
     */
    private class ValidadorAsignacion {
        
        /**
         * VALIDACIÓN DE HORARIOS DE CONSULTORIO
         * FUNCIÓN: Verifica que los bloques del médico encajen en los horarios del consultorio
         * CARACTERÍSTICA: Aplica ajuste automático cuando es posible
         */
        public List<BloqueHorario> validarHorariosConsultorio(
                List<BloqueHorario> bloquesDelMedico, ConsultorioDTO consultorio) {
            List<BloqueHorario> bloquesValidos = new ArrayList<>();
            
            System.out.println(String.format(
                "=== VALIDANDO HORARIOS CONSULTORIO %s ===", 
                consultorio.getNombre()
            ));
            System.out.println(String.format("Bloques del médico a validar: %d", bloquesDelMedico.size()));
            
            // PROCESAMIENTO INDIVIDUAL: Evalúa cada bloque del médico
            for (BloqueHorario bloque : bloquesDelMedico) {
                System.out.println(String.format("Validando bloque: %s", bloque.toString()));
                
                // CLONACIÓN DEL BLOQUE: Evita modificar el original durante validación
                BloqueHorario bloqueAjustado = new BloqueHorario(
                    bloque.getDia(), bloque.getInicio(), bloque.getFin(), 
                    bloque.getMedicoId(), bloque.getConsultorioId()
                );
                
                // VALIDACIÓN CON AJUSTE AUTOMÁTICO
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

        /**
         * VALIDACIÓN DE CONFLICTOS ENTRE MÉDICOS
         * FUNCIÓN: Elimina bloques que generarían solapamiento con otros médicos
         * LÓGICA: Un bloque es válido si NO se solapa con ningún bloque de otro médico
         */
        public List<BloqueHorario> validarConflictosMedicos(
                List<BloqueHorario> bloquesCompatibles, List<BloqueHorario> asignacionesConsultorio) {
            return bloquesCompatibles.stream()
                .filter(bloque -> !tieneConflictoConOtrosMedicos(bloque, asignacionesConsultorio))
                .collect(Collectors.toList());
        }

        /**
         * DETECCIÓN DE CONFLICTOS ESPECÍFICOS
         * FUNCIÓN: Verifica si un bloque específico tiene conflicto con otros médicos
         * EXCLUSIÓN: Ignora bloques del mismo médico (permitir múltiples bloques del mismo médico)
         */
        private boolean tieneConflictoConOtrosMedicos(BloqueHorario bloque, List<BloqueHorario> asignaciones) {
            return asignaciones.stream()
                .filter(asignacion -> !asignacion.getMedicoId().equals(bloque.getMedicoId())) // Excluir mismo médico
                .anyMatch(asignacion -> verificarSolapamiento(bloque, asignacion)); // Verificar solapamiento
        }
    }

    /**
     * Calcula puntuaciones para asignaciones (SRP)
     * PROPÓSITO: Aplicar algoritmo de puntuación multi-factor
     * METODOLOGÍA: Combina 4 factores con pesos específicos para optimizar asignaciones
     */
    private class CalculadorPuntuacion {
        
        /**
         * ALGORITMO DE PUNTUACIÓN COMPLETA
         * FÓRMULA: Puntuación = Factor1*0.35 + Factor2*0.30 + Factor3*0.25 + Factor4*0.10
         * RANGO: 0.0 a 1.0 (donde 1.0 es la asignación perfecta)
         */
        public double calcularPuntuacionCompleta(
                StaffMedico medico, Consultorio consultorio, 
                List<BloqueHorario> bloquesSinConflicto, List<BloqueHorario> bloquesTotales,
                Map<Integer, List<BloqueHorario>> asignacionesActuales,
                List<StaffMedico> todosMedicos, List<Consultorio> consultorios) {
            
            double puntuacion = 0.0;
            
            // FACTOR 1: COMPATIBILIDAD DE HORARIOS (35% del peso total)
            // Mide qué porcentaje de horarios del médico encajan en el consultorio
            double compatibilidad = (double) bloquesSinConflicto.size() / bloquesTotales.size();
            puntuacion += compatibilidad * 0.35;
            
            // FACTOR 2: DISTRIBUCIÓN POR PORCENTAJES (30% del peso total)
            // Prioriza médicos con mayor porcentaje de carga de trabajo configurado
            double factorPorcentaje = calcularFactorPorcentaje(medico, todosMedicos);
            puntuacion += factorPorcentaje * 0.30;
            
            // FACTOR 3: BALANCE DE CARGA ENTRE CONSULTORIOS (25% del peso total)
            // Evita sobrecargar consultorios específicos, promueve distribución equitativa
            double factorBalance = calcularFactorBalance(consultorio, asignacionesActuales);
            puntuacion += factorBalance * 0.25;
            
            // FACTOR 4: EFICIENCIA DE USO DEL CONSULTORIO (10% del peso total)
            // Favorece asignaciones que maximicen las horas de uso del consultorio
            double factorEficiencia = calcularFactorEficiencia(bloquesSinConflicto);
            puntuacion += factorEficiencia * 0.10;
            
            return puntuacion;
        }

        /**
         * FACTOR 2: CÁLCULO DE PUNTUACIÓN POR PORCENTAJES
         * LÓGICA: Médicos con mayor porcentaje obtienen mayor puntuación
         * NORMALIZACIÓN: Convierte porcentajes absolutos en puntuación relativa (0.0-1.0)
         */
        private double calcularFactorPorcentaje(StaffMedico medico, List<StaffMedico> todosMedicos) {
            Double porcentajeMedico = medico.getPorcentaje();
            if (porcentajeMedico == null) return 0.5; // Valor neutral si no hay datos
            
            // SUMA TOTAL: Calcula la suma de todos los porcentajes para normalización
            double totalPorcentajes = todosMedicos.stream()
                .mapToDouble(m -> {
                    Double porcentaje = m.getPorcentaje();
                    return (porcentaje != null) ? porcentaje : 0.0;
                })
                .sum();
            
            if (totalPorcentajes == 0) return 0.5; // Prevención de división por cero
            
            // PROPORCIÓN RELATIVA: Calcula qué porcentaje representa este médico del total
            double proporcionRelativa = porcentajeMedico / totalPorcentajes;
            
            // TRANSFORMACIÓN A PUNTUACIÓN: Convierte proporción en puntuación (0.1 a 1.0)
            return Math.min(1.0, 0.1 + (proporcionRelativa * 0.9));
        }

        /**
         * FACTOR 3: CÁLCULO DEL BALANCE DE CARGA
         * OBJETIVO: Distribuir equitativamente la carga entre consultorios
         * ESTRATEGIA: Penalizar consultorios sobrecargados, premiar consultorios infrautilizados
         */
        private double calcularFactorBalance(Consultorio consultorio, Map<Integer, List<BloqueHorario>> asignacionesActuales) {
            // CONTEO DE MÉDICOS ÚNICOS: Cuántos médicos diferentes están asignados a este consultorio
            Set<Integer> medicosEnEsteConsultorio = asignacionesActuales
                .getOrDefault(consultorio.getId(), new ArrayList<>())
                .stream()
                .map(BloqueHorario::getMedicoId)
                .collect(Collectors.toSet());
            
            int numMedicosActuales = medicosEnEsteConsultorio.size();
            
            // CASO ESPECIAL: Consultorio vacío obtiene máxima puntuación
            if (numMedicosActuales == 0) return 1.0;
            
            // CÁLCULO DE OCUPACIÓN PROMEDIO: Referencia para equilibrio
            double ocupacionPromedio = asignacionesActuales.entrySet().stream()
                .mapToDouble(entry -> entry.getValue().stream()
                    .map(BloqueHorario::getMedicoId)
                    .collect(Collectors.toSet()).size())
                .average()
                .orElse(0.0);
            
            // APLICACIÓN DE FÓRMULA DE BALANCE
            if (numMedicosActuales <= ocupacionPromedio) {
                // CONSULTORIOS INFRAUTILIZADOS: Puntuación favorable
                return 1.0 - (numMedicosActuales / (ocupacionPromedio + 1.0)) * 0.5;
            } else {
                // CONSULTORIOS SOBRECARGADOS: Penalización proporcional
                double sobrecarga = (numMedicosActuales - ocupacionPromedio) / ocupacionPromedio;
                return Math.max(0.1, 0.5 - sobrecarga * 0.3); // Mínimo 0.1 para evitar eliminación total
            }
        }

        /**
         * FACTOR 4: CÁLCULO DE EFICIENCIA DE USO
         * FUNCIÓN: Mide cuántas horas totales se utilizarían del consultorio
         * REFERENCIA: 40 horas semanales como uso óptimo de un consultorio
         */
        private double calcularFactorEficiencia(List<BloqueHorario> bloquesSinConflicto) {
            if (bloquesSinConflicto.isEmpty()) return 0.0;
            
            // SUMA DE HORAS: Calcula total de horas de todos los bloques
            double horasTotales = bloquesSinConflicto.stream()
                .mapToDouble(bloque -> java.time.Duration.between(bloque.getInicio(), bloque.getFin()).toMinutes() / 60.0)
                .sum();
            
            // NORMALIZACIÓN: Convierte horas a puntuación (máximo 1.0 a las 40 horas)
            return Math.min(1.0, horasTotales / 40.0);
        }
    }

    /**
     * Estrategias de selección de consultorios (SRP)
     * FUNCIÓN: Implementa diferentes estrategias para seleccionar el mejor consultorio según contexto
     */
    private class EstrategiaSeleccionConsultorio {
        
        /**
         * MÉTODO PRINCIPAL: Selecciona el mejor consultorio basándose en el contexto de disponibilidad
         * LÓGICA: Si hay escasez (más médicos que consultorios) → prioriza médicos con mayor porcentaje
         *        Si hay abundancia → selecciona por mayor puntuación
         */
        public ResultadoAsignacion seleccionarMejorConsultorio(
                List<ResultadoAsignacion> candidatos, StaffMedico medico, List<StaffMedico> todosMedicos) {
            
            // VALIDACIÓN BÁSICA: Sin candidatos, no hay asignación posible
            if (candidatos.isEmpty()) return null;
            
            // ANÁLISIS DE CONTEXTO: Determinar si hay escasez de consultorios
            boolean hayEscasez = todosMedicos.size() > candidatos.size();
            
            // ESTRATEGIA CONDICIONAL: Aplicar lógica según disponibilidad de recursos
            if (hayEscasez) {
                // MODO ESCASEZ: Priorizar médicos según jerarquía (porcentajes)
                return aplicarEstrategiaEscasez(candidatos, medico, todosMedicos);
            } else {
                // MODO NORMAL: Seleccionar por mayor puntuación algoritmica
                return candidatos.stream()
                    .max(Comparator.comparing(ResultadoAsignacion::getPuntuacion))
                    .orElse(null);
            }
        }

        /**
         * ESTRATEGIA DE ESCASEZ: Cuando hay más médicos que consultorios disponibles
         * OBJETIVO: Optimizar asignaciones dando prioridad a médicos con mayor jerarquía
         */
        private ResultadoAsignacion aplicarEstrategiaEscasez(
                List<ResultadoAsignacion> candidatos, StaffMedico medico, List<StaffMedico> todosMedicos) {
            
            // PASO 1: ORDENAMIENTO JERÁRQUICO
            // Ordena candidatos por cantidad de bloques asignados (descendente) y puntuación (descendente)
            candidatos.sort((a, b) -> {
                // CRITERIO PRIMARIO: Más bloques asignados = mejor opción
                int bloquesComparacion = Integer.compare(
                    b.getBloquesAsignados().size(), 
                    a.getBloquesAsignados().size()
                );
                // CRITERIO SECUNDARIO: En caso de empate, usar puntuación
                if (bloquesComparacion != 0) return bloquesComparacion;
                return Double.compare(b.getPuntuacion(), a.getPuntuacion());
            });
            
            // PASO 2: ANÁLISIS DEL PERFIL DEL MÉDICO
            // Verificar si el médico tiene porcentaje configurado
            Double porcentajeMedico = medico.getPorcentaje();
            if (porcentajeMedico == null) return candidatos.get(0); // Sin datos → asignar mejor opción
            
            // PASO 3: CÁLCULO DE JERARQUÍA RELATIVA
            // Determinar el porcentaje promedio de todos los médicos para establecer jerarquía
            double porcentajePromedio = todosMedicos.stream()
                .mapToDouble(m -> {
                    Double porcentaje = m.getPorcentaje();
                    return (porcentaje != null) ? porcentaje : 0.0;
                })
                .average()
                .orElse(0.0);
            
            // PASO 4: CLASIFICACIÓN JERÁRQUICA
            // Determinar si es médico de alto rango (20% superior al promedio)
            boolean esMedicoAltoRango = porcentajeMedico > porcentajePromedio * 1.2;
            
            // PASO 5: APLICACIÓN DE ESTRATEGIA SEGÚN RANGO
            if (esMedicoAltoRango) {
                // MÉDICOS ALTO RANGO: Obtienen la primera opción (mejor consultorio)
                return candidatos.get(0);
            } else {
                // MÉDICOS ESTÁNDAR: Optimización por balance entre puntuación y disponibilidad
                return candidatos.stream()
                    .filter(candidato -> !candidato.getBloquesAsignados().isEmpty()) // Solo candidatos válidos
                    .max(Comparator.comparing(candidato -> 
                        // FÓRMULA PONDERADA: Puntuación * factor de disponibilidad
                        candidato.getPuntuacion() * (candidato.getBloquesAsignados().size() / 10.0)
                    ))
                    .orElse(candidatos.get(0)); // Fallback: mejor opción disponible
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
     * Ajusta automáticamente los horarios de un esquema para que encajen dentro del horario del consultorio
     * @param horariosEsquema Lista de horarios del esquema que pueden ser modificados
     * @param consultorioId ID del consultorio a verificar
     * @return Lista de advertencias sobre los ajustes realizados
     */
    public List<String> ajustarHorariosEsquemaAConsultorio(List<EsquemaTurno.Horario> horariosEsquema, Integer consultorioId) {
        List<String> advertencias = new ArrayList<>();
        
        try {
            Optional<ConsultorioDTO> consultorioOpt = consultorioService.findById(consultorioId);
            if (!consultorioOpt.isPresent()) {
                advertencias.add("Consultorio no encontrado - no se realizaron ajustes");
                return advertencias;
            }
            
            ConsultorioDTO consultorio = consultorioOpt.get();
            System.out.println(String.format("🔧 AJUSTANDO HORARIOS DE ESQUEMA - Consultorio: %s", consultorio.getNombre()));
            
            // Crear una lista para horarios que no se pueden ajustar (muy cortos)
            List<EsquemaTurno.Horario> horariosAEliminar = new ArrayList<>();
            
            for (EsquemaTurno.Horario horario : horariosEsquema) {
                LocalTime horaInicioOriginal = horario.getHoraInicio();
                LocalTime horaFinOriginal = horario.getHoraFin();
                
                BloqueHorario bloque = new BloqueHorario(
                    horario.getDia(),
                    horaInicioOriginal,
                    horaFinOriginal,
                    null, // medicoId no necesario para ajuste
                    consultorioId
                );
                
                System.out.println(String.format("Ajustando horario %s: %s-%s", 
                    horario.getDia(), horaInicioOriginal, horaFinOriginal));
                
                // Usar el método que ajusta automáticamente
                boolean esCompatible = esBloqueCompatibleConConsultorio(bloque, consultorio);
                
                if (esCompatible) {
                    // El bloque fue ajustado automáticamente por esBloqueCompatibleConConsultorioResultadoA
                    LocalTime nuevaHoraInicio = bloque.getInicio();
                    LocalTime nuevaHoraFin = bloque.getFin();
                    
                    // Verificar si se realizó algún ajuste
                    boolean seAjusto = !horaInicioOriginal.equals(nuevaHoraInicio) || !horaFinOriginal.equals(nuevaHoraFin);
                    
                    if (seAjusto) {
                        // Aplicar los cambios al horario original
                        horario.setHoraInicio(nuevaHoraInicio);
                        horario.setHoraFin(nuevaHoraFin);
                        
                        advertencias.add(String.format(
                            "Horario del %s ajustado automáticamente: %s-%s → %s-%s (para encajar en consultorio)",
                            horario.getDia(),
                            horaInicioOriginal, horaFinOriginal,
                            nuevaHoraInicio, nuevaHoraFin
                        ));
                        
                        System.out.println(String.format("  ✓ AJUSTADO: %s-%s → %s-%s", 
                            horaInicioOriginal, horaFinOriginal, nuevaHoraInicio, nuevaHoraFin));
                    } else {
                        System.out.println("  ✓ SIN CAMBIOS: ya estaba dentro del rango");
                    }
                } else {
                    // El bloque no se pudo ajustar (probablemente muy corto después del ajuste)
                    horariosAEliminar.add(horario);
                    advertencias.add(String.format(
                        "Horario del %s (%s-%s) eliminado: no se pudo ajustar al horario del consultorio (resultaría muy corto)",
                        horario.getDia(), horaInicioOriginal, horaFinOriginal
                    ));
                    
                    System.out.println(String.format("  ✗ ELIMINADO: %s-%s (no se pudo ajustar)", 
                        horaInicioOriginal, horaFinOriginal));
                }
            }
            
            // Eliminar horarios que no se pudieron ajustar
            horariosEsquema.removeAll(horariosAEliminar);
            
            System.out.println(String.format("🔧 AJUSTE COMPLETADO - %d horarios finales, %d advertencias", 
                horariosEsquema.size(), advertencias.size()));
            
        } catch (Exception e) {
            advertencias.add("Error al ajustar horarios: " + e.getMessage());
            System.err.println("Error en ajustarHorariosEsquemaAConsultorio: " + e.getMessage());
        }
        
        return advertencias;
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

    // ===============================================
    // MÉTODO PRINCIPAL DEL ALGORITMO DE ASIGNACIÓN
    // ===============================================
    
    /**
     * ALGORITMO COMPLETO: Ejecuta todo el proceso de asignación inteligente
     * ENTRADA: Médico, lista de médicos, lista de consultorios
     * SALIDA: Mejor asignación basada en múltiples criterios
     */
    private ResultadoAsignacion ejecutarAlgoritmoCompleto(StaffMedico medico, List<StaffMedico> todosMedicos, List<Consultorio> consultorios) {
        // FASE 1: OBTENCIÓN DEL ESTADO ACTUAL
        // Recupera todas las asignaciones existentes (persistentes + temporales)
        Map<Integer, List<BloqueHorario>> asignacionesActuales = obtenerAsignacionesActuales();
        
        // FASE 2: EXTRACCIÓN DE DISPONIBILIDAD
        // Convierte la disponibilidad del médico en bloques horarios procesables
        List<BloqueHorario> bloquesDelMedico = extraerBloquesHorarioDelMedico(medico);
        
        // VALIDACIÓN CRÍTICA: Sin disponibilidad, no hay asignación posible
        if (bloquesDelMedico.isEmpty()) {
            return null;
        }
        
        // FASE 3: EVALUACIÓN EXHAUSTIVA DE CANDIDATOS
        // Recorre TODOS los consultorios y evalúa cada uno con el algoritmo completo
        List<ResultadoAsignacion> candidatosValidos = new ArrayList<>();
        
        for (Consultorio consultorio : consultorios) {
            // EVALUACIÓN INDIVIDUAL: Aplica algoritmo completo a cada consultorio
            ResultadoAsignacion evaluacion = evaluarConsultorioParaMedico(
                medico, consultorio, bloquesDelMedico, asignacionesActuales, todosMedicos, consultorios);
            
            // FILTRO DE CALIDAD: Solo candidatos con puntuación positiva son válidos
            if (evaluacion != null && evaluacion.getPuntuacion() > 0) {
                candidatosValidos.add(evaluacion);
            }
        }
        
        // FASE 4: SELECCIÓN DEL MEJOR CANDIDATO
        if (!candidatosValidos.isEmpty()) {
            // APLICACIÓN DE ESTRATEGIA: Selecciona según contexto (escasez vs abundancia)
            ResultadoAsignacion asignacionSeleccionada = estrategiaSeleccion.seleccionarMejorConsultorio(
                candidatosValidos, medico, todosMedicos);
            
            // FASE 5: ACTUALIZACIÓN DEL ESTADO DEL SISTEMA
            if (asignacionSeleccionada != null) {
                // Actualiza el mapa dinámico para futuras evaluaciones en el mismo lote
                actualizarAsignacionesDinamicas(asignacionesActuales, asignacionSeleccionada);
            }
            
            return asignacionSeleccionada;
        }
        
        // RESULTADO NULO: No se encontró asignación válida
        return null;
    }

    /**
     * EVALUACIÓN INDIVIDUAL DE CONSULTORIO: Aplica algoritmo completo para un consultorio específico
     * ENTRADA: Médico, consultorio, bloques del médico, estado actual, contexto completo
     * SALIDA: Resultado de evaluación con puntuación y análisis completo
     */
    private ResultadoAsignacion evaluarConsultorioParaMedico(
            StaffMedico medico, Consultorio consultorio, List<BloqueHorario> bloquesDelMedico,
            Map<Integer, List<BloqueHorario>> asignacionesActuales, 
            List<StaffMedico> todosMedicos, List<Consultorio> consultorios) {
        
        try {
            // PASO 1: OBTENCIÓN DE DATOS DEL CONSULTORIO
            // Convierte la entidad Consultorio a DTO con todos los horarios
            ConsultorioDTO consultorioDTO = consultorioService.findById(consultorio.getId()).orElse(null);
            if (consultorioDTO == null) {
                return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                    new ArrayList<>(), 0.0, "DTO no encontrado");
            }
            
            // PASO 2: VALIDACIÓN DE COMPATIBILIDAD HORARIA
            // Verifica que los horarios del médico encajen en los horarios del consultorio
            List<BloqueHorario> bloquesCompatibles = validadorAsignacion.validarHorariosConsultorio(
                bloquesDelMedico, consultorioDTO);
            
            // VERIFICACIÓN CRÍTICA: Sin horarios compatibles = asignación imposible
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
            
            // PASO 3: VALIDACIÓN DE CONFLICTOS CON OTROS MÉDICOS
            // Verifica que no haya solapamiento de horarios con médicos ya asignados
            List<BloqueHorario> asignacionesConsultorio = asignacionesActuales.getOrDefault(consultorio.getId(), new ArrayList<>());
            List<BloqueHorario> bloquesSinConflicto = validadorAsignacion.validarConflictosMedicos(
                bloquesCompatibles, asignacionesConsultorio);
            
            // PASO 4: ANÁLISIS DE COBERTURA MÍNIMA
            // Verifica que al menos 50% de los horarios del médico sean utilizables
            double cobertura = (double) bloquesSinConflicto.size() / bloquesDelMedico.size();
            if (cobertura < 0.5) { // Umbral mínimo del 50%
                return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                    bloquesSinConflicto, 0.0, "Cobertura insuficiente");
            }
            
            // PASO 5: CÁLCULO DE PUNTUACIÓN ALGORÍTMICA
            // Aplica el algoritmo de puntuación con los 4 factores ponderados
            double puntuacion = calculadorPuntuacion.calcularPuntuacionCompleta(
                medico, consultorio, bloquesSinConflicto, bloquesDelMedico, 
                asignacionesActuales, todosMedicos, consultorios);
            
            // RESULTADO EXITOSO: Retorna evaluación completa
            return new ResultadoAsignacion(medico.getId(), consultorio.getId(), 
                bloquesSinConflicto, puntuacion, "Válido");
            
        } catch (Exception e) {
            // MANEJO DE ERRORES: Retorna resultado con error controlado
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
    // MÉTODOS ESTÁTICOS DE UTILIDAD FUNDAMENTALES
    // ===============================================

    /**
     * NORMALIZACIÓN DE DÍAS DE LA SEMANA
     * FUNCIÓN: Convierte diferentes formatos de días a un formato estándar
     * SOPORTE: Español, inglés, abreviaciones comunes
     * SALIDA: Días en formato estándar español (LUNES, MARTES, etc.)
     */
    private static String normalizarDia(String dia) {
        if (dia == null) return "";
        
        String diaNormalizado = dia.toUpperCase().trim();
        
        // MAPEO EXHAUSTIVO: Convierte todas las variaciones posibles
        return switch (diaNormalizado) {
            case "LUNES", "MONDAY", "LUN", "MON" -> "LUNES";
            case "MARTES", "TUESDAY", "MAR", "TUE" -> "MARTES";
            case "MIERCOLES", "MIÉRCOLES", "WEDNESDAY", "MIE", "WED" -> "MIERCOLES";
            case "JUEVES", "THURSDAY", "JUE", "THU" -> "JUEVES";
            case "VIERNES", "FRIDAY", "VIE", "FRI" -> "VIERNES";
            case "SABADO", "SÁBADO", "SATURDAY", "SAB", "SAT" -> "SABADO";
            case "DOMINGO", "SUNDAY", "DOM", "SUN" -> "DOMINGO";
            default -> diaNormalizado; // Mantener formato original si no se reconoce
        };
    }

    /**
     * COMPATIBILIDAD DE BLOQUES CON CONSULTORIO (MÉTODO CENTRAL)
     * FUNCIÓN: Verifica y ajusta automáticamente horarios para que encajen
     * CARACTERÍSTICA CLAVE: Ajuste automático con recorte inteligente
     * RETORNO: true si es compatible (con o sin ajuste), false si incompatible
     */
    private static boolean esBloqueCompatibleConConsultorio(BloqueHorario bloque, ConsultorioDTO consultorio) {
        // VALIDACIÓN BÁSICA: Verificar que el consultorio tenga horarios configurados
        if (consultorio.getHorariosSemanales() == null || consultorio.getHorariosSemanales().isEmpty()) {
            // Sin horarios configurados = no compatible
            return false;
        }
        
        String diaBloque = normalizarDia(bloque.getDia());
        
        // BÚSQUEDA DE HORARIO CORRESPONDIENTE: Buscar horario del consultorio para el día específico
        for (ConsultorioDTO.HorarioConsultorioDTO horarioConsultorio : consultorio.getHorariosSemanales()) {
            String diaConsultorio = normalizarDia(horarioConsultorio.getDiaSemana());
            
            // VERIFICACIÓN DE COINCIDENCIA: Mismo día y horario activo
            if (diaConsultorio.equals(diaBloque) && horarioConsultorio.getActivo()) {
                if (horarioConsultorio.getHoraApertura() != null && 
                    horarioConsultorio.getHoraCierre() != null) {
                    
                    // APLICACIÓN DE AJUSTE AUTOMÁTICO: Intentar ajustar el bloque al consultorio
                    return ajustarBloqueAConsultorio(bloque, 
                        horarioConsultorio.getHoraApertura(), 
                        horarioConsultorio.getHoraCierre());
                }
            }
        }
        return false; // No se encontró horario compatible
    }
    
    /**
     * AJUSTE AUTOMÁTICO DE BLOQUES HORARIOS (ALGORITMO CRÍTICO)
     * FUNCIÓN: Modifica automáticamente los horarios del médico para que encajen en el consultorio
     * ESTRATEGIA: Recortar horarios preservando al menos 30 minutos de duración mínima
     * MODIFICACIÓN: Altera directamente el objeto BloqueHorario pasado por parámetro
     */
    private static boolean ajustarBloqueAConsultorio(BloqueHorario bloque, LocalTime aperturaConsultorio, LocalTime cierreConsultorio) {
        LocalTime inicioBloque = bloque.getInicio();
        LocalTime finBloque = bloque.getFin();
        
        // PASO 1: VERIFICACIÓN DE INTERSECCIÓN
        // Si no hay solapamiento temporal, la asignación es imposible
        if (finBloque.isBefore(aperturaConsultorio) || inicioBloque.isAfter(cierreConsultorio)) {
            System.out.println(String.format(
                "Bloque %s-%s del día %s NO tiene intersección con consultorio %s-%s - RECHAZADO", 
                inicioBloque, finBloque, bloque.getDia(), aperturaConsultorio, cierreConsultorio
            ));
            return false;
        }
        
        // PASO 2: CÁLCULO DE AJUSTES NECESARIOS
        // Ajustar inicio: Si empieza antes del consultorio, usar hora de apertura
        LocalTime nuevoInicio = inicioBloque.isBefore(aperturaConsultorio) ? aperturaConsultorio : inicioBloque;
        
        // Ajustar fin: Si termina después del consultorio, usar hora de cierre
        LocalTime nuevoFin = finBloque.isAfter(cierreConsultorio) ? cierreConsultorio : finBloque;
        
        // PASO 3: VALIDACIÓN DE DURACIÓN MÍNIMA
        // Verificar que el bloque ajustado sea útil (mínimo 30 minutos)
        if (java.time.Duration.between(nuevoInicio, nuevoFin).toMinutes() < 30) {
            System.out.println(String.format(
                "Bloque ajustado %s-%s del día %s es muy corto (< 30 min) - RECHAZADO", 
                nuevoInicio, nuevoFin, bloque.getDia()
            ));
            return false;
        }
        
        // PASO 4: APLICACIÓN DE CAMBIOS AL BLOQUE ORIGINAL
        // Modificar directamente el objeto para reflejar los ajustes
        boolean seAjusto = !nuevoInicio.equals(inicioBloque) || !nuevoFin.equals(finBloque);
        bloque.setInicio(nuevoInicio);
        bloque.setFin(nuevoFin);
        
        // LOGGING DETALLADO: Registrar el resultado del ajuste
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
        
        return true; // Ajuste exitoso
    }
    
    /**
     * OBTENCIÓN DE HORARIO ESPECÍFICO POR DÍA
     * FUNCIÓN: Busca y retorna el horario de un consultorio para un día específico
     * UTILIDAD: Método auxiliar para consultas específicas de horarios
     * NOTA: Aunque no se usa actualmente, facilita futuras implementaciones
     */

     /*   
      private static ConsultorioDTO.HorarioConsultorioDTO obtenerHorarioPorDia(ConsultorioDTO consultorio, String dia) {
        // VALIDACIÓN BÁSICA: Verificar que el consultorio tenga horarios configurados
        if (consultorio.getHorariosSemanales() == null || consultorio.getHorariosSemanales().isEmpty()) {
            return null; // Sin horarios configurados
        }
        
        String diaBloque = normalizarDia(dia);
        
        // BÚSQUEDA SECUENCIAL: Encontrar el horario correspondiente al día solicitado
        for (ConsultorioDTO.HorarioConsultorioDTO horario : consultorio.getHorariosSemanales()) {
            String diaConsultorio = normalizarDia(horario.getDiaSemana());
            if (diaConsultorio.equals(diaBloque)) {
                return horario; // Retornar horario encontrado
            }
        }
        
        return null; // No se encontró horario para el día solicitado
    }
    */

    /**
     * VERIFICACIÓN DE SOLAPAMIENTO: Detecta conflictos de horarios entre bloques
     * FUNCIÓN: Verifica si dos bloques horarios se superponen en el mismo día
     * LÓGICA: Dos bloques se solapan si inicio1 < fin2 Y fin1 > inicio2
     */
    private static boolean verificarSolapamiento(BloqueHorario bloque1, BloqueHorario bloque2) {
        // VERIFICACIÓN DE DÍA: Solo bloques del mismo día pueden solaparse
        if (!normalizarDia(bloque1.getDia()).equals(normalizarDia(bloque2.getDia()))) {
            return false;
        }
        
        // ALGORITMO DE SOLAPAMIENTO: Verificar intersección de intervalos temporales
        return bloque1.getInicio().isBefore(bloque2.getFin()) && 
               bloque1.getFin().isAfter(bloque2.getInicio());
    }
}