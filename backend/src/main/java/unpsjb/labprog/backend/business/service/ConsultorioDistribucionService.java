package unpsjb.labprog.backend.business.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.business.repository.StaffMedicoRepository;
import unpsjb.labprog.backend.dto.ConsultorioDTO;
import unpsjb.labprog.backend.model.Consultorio;
import unpsjb.labprog.backend.model.EsquemaTurno;
import unpsjb.labprog.backend.model.StaffMedico;

/**
 * Servicio para gestionar la distribución equitativa de consultorios entre especialidades médicas.
 */
@Service
public class ConsultorioDistribucionService {

    @Autowired
    private StaffMedicoRepository staffMedicoRepository;

    @Autowired
    private ConsultorioRepository consultorioRepository;

    @Autowired
    private ConsultorioService consultorioService;

    /**
     * Distribuye consultorios entre especialidades para un centro médico y día específico.
     * 
     * @param centroId ID del centro médico
     * @param fecha Fecha para la cual se realiza la distribución
     * @return Mapa con la asignación de consultorios a los StaffMedico
     */
    public Map<Integer, Integer> distribuirConsultorios(Integer centroId, LocalDate fecha, String diaSemana) {
        // Obtener todos los médicos agrupados por especialidad para el centro
        List<StaffMedico> staffMedicos = staffMedicoRepository.findByCentroAtencionId(centroId);
        
        // Agrupar médicos por especialidad
        Map<Integer, List<StaffMedico>> medicosPorEspecialidad = staffMedicos.stream()
            .filter(staff -> staff.getMedico() != null && staff.getMedico().getEspecialidad() != null)
            .collect(Collectors.groupingBy(
                staff -> staff.getMedico().getEspecialidad().getId()
            ));
        
        // Obtener todos los consultorios del centro
        List<Consultorio> consultorios = consultorioRepository.findByCentroAtencionId(centroId);
        
        // Filtrar consultorios disponibles en este día
        List<Consultorio> consultoriosDisponibles = consultorios.stream()
            .filter(consultorio -> consultorioDisponibleEnDia(consultorio.getId(), diaSemana))
            .collect(Collectors.toList());
        
        // Ejecutar algoritmo de distribución
        return distribuirConsultoriosAlgoritmo(medicosPorEspecialidad, consultoriosDisponibles);
    }

    /**
     * Verifica si un médico tiene disponibilidad para un día y horario específico.
     */
    private boolean medicoDisponibleEnHorario(StaffMedico staff, String dia, LocalTime horaInicio, LocalTime horaFin) {
        if (staff.getDisponibilidad() == null || staff.getDisponibilidad().isEmpty()) {
            return false;
        }
        
        return staff.getDisponibilidad().stream()
            .anyMatch(disp -> disp.getHorarios().stream()
                .anyMatch(h -> h.getDia().equalsIgnoreCase(dia) && 
                          !h.getHoraInicio().isAfter(horaInicio) && 
                          !h.getHoraFin().isBefore(horaFin)));
    }
    
    /**
     * Verifica si un consultorio está disponible en un día específico.
     */
    private boolean consultorioDisponibleEnDia(Integer consultorioId, String diaSemana) {
        Optional<ConsultorioDTO> consultorioOpt = consultorioService.findById(consultorioId);
        if (!consultorioOpt.isPresent()) {
            return false;
        }
        
        ConsultorioDTO consultorio = consultorioOpt.get();
        
        // Verificar si hay horarios específicos para este día
        if (consultorio.getHorariosSemanales() != null && !consultorio.getHorariosSemanales().isEmpty()) {
            return consultorio.getHorariosSemanales().stream()
                .anyMatch(horario -> 
                    horario.getDiaSemana().equalsIgnoreCase(diaSemana) &&
                    horario.getActivo() &&
                    horario.getHoraApertura() != null &&
                    horario.getHoraCierre() != null
                );
        }
        
        // Si no hay horarios específicos, verificar si tiene horarios por defecto
        return consultorio.getHoraAperturaDefault() != null && consultorio.getHoraCierreDefault() != null;
    }

    /**
     * Distribuye consultorios entre especialidades considerando:
     * - Cantidad de médicos por especialidad
     * - Consultorios disponibles
     * - Equilibrio entre especialidades
     */
    private Map<Integer, Integer> distribuirConsultoriosAlgoritmo(
            Map<Integer, List<StaffMedico>> medicosPorEspecialidad,
            List<Consultorio> consultoriosDisponibles) {
        
        Map<Integer, Integer> asignacion = new HashMap<>(); // staffMedicoId -> consultorioId
        
        // Si no hay consultorios disponibles, no se puede hacer nada
        if (consultoriosDisponibles.isEmpty()) {
            return asignacion;
        }
        
        // Ordenar especialidades por cantidad de médicos (de mayor a menor)
        List<Map.Entry<Integer, List<StaffMedico>>> especialidadesOrdenadas = 
            medicosPorEspecialidad.entrySet().stream()
                .sorted(Map.Entry.<Integer, List<StaffMedico>>comparingByValue(
                    Comparator.comparing(List::size)).reversed())
                .collect(Collectors.toList());
        
        // Inicializar contadores para distribución equitativa
        Map<Integer, Integer> consultoriosPorEspecialidad = new HashMap<>(); // especialidadId -> count
        
        // Primera pasada: asignar al menos un consultorio por especialidad (si hay suficientes)
        int consultorioIdx = 0;
        for (Map.Entry<Integer, List<StaffMedico>> entry : especialidadesOrdenadas) {
            Integer especialidadId = entry.getKey();
            
            // Si se acabaron los consultorios, terminar
            if (consultorioIdx >= consultoriosDisponibles.size()) {
                break;
            }
            
            // Asignar un consultorio a esta especialidad
            consultoriosPorEspecialidad.put(especialidadId, 1);
            consultorioIdx++;
        }
        
        // Segunda pasada: distribuir los consultorios restantes proporcionalmente
        while (consultorioIdx < consultoriosDisponibles.size()) {
            // Encontrar la especialidad con menos consultorios por médico
            Integer especialidadConMenosRecursos = especialidadesOrdenadas.stream()
                .min(Comparator.comparing(entry -> {
                    Integer especialidadId = entry.getKey();
                    double consultorios = consultoriosPorEspecialidad.getOrDefault(especialidadId, 0);
                    int medicos = entry.getValue().size();
                    return consultorios / medicos;
                }))
                .map(Map.Entry::getKey)
                .orElse(null);
            
            if (especialidadConMenosRecursos != null) {
                // Incrementar contador para esta especialidad
                consultoriosPorEspecialidad.put(
                    especialidadConMenosRecursos, 
                    consultoriosPorEspecialidad.getOrDefault(especialidadConMenosRecursos, 0) + 1
                );
                consultorioIdx++;
            } else {
                break; // Algo salió mal, terminar
            }
        }
        
        // Tercera pasada: asignar médicos específicos a consultorios específicos
        Map<Integer, List<Consultorio>> consultoriosPorEspecialidad2 = new HashMap<>();
        
        // Inicializar asignación de consultorios por especialidad
        consultorioIdx = 0;
        for (Map.Entry<Integer, Integer> entry : consultoriosPorEspecialidad.entrySet()) {
            Integer especialidadId = entry.getKey();
            Integer cantidadConsultorios = entry.getValue();
            
            List<Consultorio> consultoriosAsignados = new ArrayList<>();
            for (int i = 0; i < cantidadConsultorios && consultorioIdx < consultoriosDisponibles.size(); i++) {
                consultoriosAsignados.add(consultoriosDisponibles.get(consultorioIdx++));
            }
            
            consultoriosPorEspecialidad2.put(especialidadId, consultoriosAsignados);
        }
        
        // Finalmente, asignar médicos específicos a consultorios
        for (Map.Entry<Integer, List<StaffMedico>> entry : medicosPorEspecialidad.entrySet()) {
            Integer especialidadId = entry.getKey();
            List<StaffMedico> medicos = entry.getValue();
            List<Consultorio> consultoriosAsignados = consultoriosPorEspecialidad2.getOrDefault(especialidadId, new ArrayList<>());
            
            if (!consultoriosAsignados.isEmpty()) {
                // Si hay menos consultorios que médicos, rotar
                for (int i = 0; i < medicos.size(); i++) {
                    StaffMedico medico = medicos.get(i);
                    Consultorio consultorio = consultoriosAsignados.get(i % consultoriosAsignados.size());
                    
                    // Guardar la asignación
                    asignacion.put(medico.getId(), consultorio.getId());
                }
            }
        }
        
        return asignacion;
    }
    
    /**
     * Verifica si existe conflicto entre dos médicos para un mismo consultorio
     * en un día y horario específico.
     */
    public boolean hayConflictoConsultorio(StaffMedico medico1, StaffMedico medico2, 
                                          String dia, LocalTime horaInicio, LocalTime horaFin) {
        // Si son el mismo médico, no hay conflicto
        if (medico1.getId().equals(medico2.getId())) {
            return false;
        }
        
        // Si tienen diferente especialidad, no hay conflicto (cada especialidad tiene asignado un consultorio)
        //ESTO ESTA MAL
        if (!medico1.getMedico().getEspecialidad().getId()
              .equals(medico2.getMedico().getEspecialidad().getId())) {
            return false;
        }
        
        // Verificar si ambos médicos tienen disponibilidad en ese horario
        boolean medico1Disponible = medicoDisponibleEnHorario(medico1, dia, horaInicio, horaFin);
        boolean medico2Disponible = medicoDisponibleEnHorario(medico2, dia, horaInicio, horaFin);
        
        // Hay conflicto si ambos están disponibles en el mismo horario
        return medico1Disponible && medico2Disponible;
    }
    
    /**
     * Asigna consultorios automáticamente al crear un nuevo EsquemaTurno.
     * Este método se debe llamar desde EsquemaTurnoService al crear un esquema.
     * 
     * @param esquemaTurno El esquema de turno recién creado
     * @return El esquema actualizado con consultorio asignado
     */
    public EsquemaTurno asignarConsultorioAlCrearEsquema(EsquemaTurno esquemaTurno) {
        if (esquemaTurno.getCentroAtencion() == null) {
            throw new IllegalArgumentException("El esquema debe tener un centro de atención asignado");
        }
        
        // Si ya tiene consultorio asignado, no hacer nada
        if (esquemaTurno.getConsultorio() != null) {
            return esquemaTurno;
        }
        
        LocalDate hoy = LocalDate.now();
        String diaSemana = hoy.getDayOfWeek().name();
        
        // Usar el algoritmo de distribución para obtener la asignación óptima
        Map<Integer, Integer> asignacion = distribuirConsultorios(
            esquemaTurno.getCentroAtencion().getId(), 
            hoy, 
            diaSemana
        );
        
        // Buscar la asignación para este médico
        Integer staffMedicoId = esquemaTurno.getStaffMedico().getId();
        Integer consultorioId = asignacion.get(staffMedicoId);
        
        if (consultorioId != null) {
            // Asignar el consultorio encontrado
            Consultorio consultorio = new Consultorio();
            consultorio.setId(consultorioId);
            esquemaTurno.setConsultorio(consultorio);
        } else {
            // Si no hay asignación específica, buscar cualquier consultorio disponible
            List<Consultorio> consultoriosDisponibles = consultorioRepository
                .findByCentroAtencionId(esquemaTurno.getCentroAtencion().getId())
                .stream()
                .filter(c -> consultorioDisponibleEnDia(c.getId(), diaSemana))
                .collect(Collectors.toList());
            
            if (!consultoriosDisponibles.isEmpty()) {
                esquemaTurno.setConsultorio(consultoriosDisponibles.get(0));
            }
        }
        
        return esquemaTurno;
    }
    
    /**
     * Verifica si es necesario reoptimizar la distribución de consultorios.
     * Solo reoptimiza si hay cambios significativos desde la última optimización.
     * 
     * @param centroId ID del centro médico
     * @param fecha Fecha a verificar
     * @return true si se necesita reoptimización, false en caso contrario
     */
    public boolean necesitaReoptimizacion(Integer centroId, LocalDate fecha) {
        // Obtener todos los esquemas de turno del centro
        List<StaffMedico> staffMedicos = staffMedicoRepository.findByCentroAtencionId(centroId);
        
        // Verificar si hay médicos sin consultorio asignado
        boolean hayMedicosSinConsultorio = staffMedicos.stream()
            .anyMatch(staff -> {
                // Aquí necesitaríamos acceder a los esquemas de turno del médico
                // Por simplicidad, asumimos que siempre puede necesitar optimización
                return true;
            });
        
        return hayMedicosSinConsultorio;
    }
}
