package unpsjb.labprog.backend.business.service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.CentroAtencionRepository;
import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.business.repository.DisponibilidadMedicoRepository;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.dto.EsquemaTurnoDTO;
import unpsjb.labprog.backend.model.DisponibilidadMedico;
import unpsjb.labprog.backend.model.EsquemaTurno;

@Service
public class EsquemaTurnoService {

    @Autowired
    private EsquemaTurnoRepository esquemaTurnoRepository;

    @Autowired
    private DisponibilidadMedicoRepository disponibilidadMedicoRepository;

    @Autowired
    private CentroAtencionRepository centroAtencionRepository;

    @Autowired
    private ConsultorioRepository consultorioRepository;
    
    @Autowired
    private ConsultorioDistribucionService consultorioDistribucionService;

    public List<EsquemaTurnoDTO> findAll() {
        return esquemaTurnoRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Optional<EsquemaTurnoDTO> findById(Integer id) {
        return esquemaTurnoRepository.findById(id).map(this::toDTO);
    }

    public Page<EsquemaTurnoDTO> findByPage(int page, int size) {
        return esquemaTurnoRepository.findAll(PageRequest.of(page, size))
                .map(this::toDTO);
    }

    @Transactional
    public EsquemaTurnoDTO saveOrUpdate(EsquemaTurnoDTO dto) {
        // Validación: Staff Médico
        if (dto.getStaffMedicoId() == null) {
            throw new IllegalArgumentException("El campo staffMedicoId es obligatorio.");
        }

        // Validación: Consultorio (opcional para permitir distribución automática)
        if (dto.getConsultorioId() != null && !consultorioRepository.existsById(dto.getConsultorioId())) {
            throw new IllegalArgumentException("El consultorio especificado no existe.");
        }

        // Validación: Intervalo
        if (dto.getIntervalo() <= 0) {
            throw new IllegalArgumentException("El intervalo debe ser positivo.");
        }       

        // Validación: Horarios específicos del esquema de turno
        if (dto.getHorarios() == null || dto.getHorarios().isEmpty()) {
            throw new IllegalArgumentException("Los horarios son obligatorios.");
        }
        for (EsquemaTurnoDTO.DiaHorarioDTO horario : dto.getHorarios()) {
            if (horario.getHoraInicio().isAfter(horario.getHoraFin())) {
                throw new IllegalArgumentException("La hora de inicio no puede ser mayor a la hora de fin.");
            }
        }

        EsquemaTurno esquemaTurno = toEntity(dto);
        
        
        

        // Validación: Conflictos entre esquemas de turnos existentes
        List<EsquemaTurno> existentes = esquemaTurnoRepository.findByStaffMedicoId(esquemaTurno.getStaffMedico().getId());
        for (EsquemaTurno existente : existentes) {
            Integer nuevoId = esquemaTurno.getId();
            Integer existenteId = existente.getId();

            // Si ambos IDs son null, consideramos que son distintos (nuevo registro)
            boolean mismoId = (nuevoId != null && nuevoId.equals(existenteId));
            if (!mismoId && esquemaTurno.getDisponibilidadMedico().getId()
                    .equals(existente.getDisponibilidadMedico().getId())) {
                throw new IllegalStateException("Conflicto: Esquema ya existe.");
            }
        }

        // Validación: Disponibilidad del médico
        List<DisponibilidadMedico> disponibilidades = disponibilidadMedicoRepository.findByStaffMedicoId(dto.getStaffMedicoId());
        for (EsquemaTurnoDTO.DiaHorarioDTO horario : dto.getHorarios()) {
            System.out.println("Validando horario: " + horario.getDia() + " " + horario.getHoraInicio() + " - " + horario.getHoraFin());
            for (DisponibilidadMedico disponibilidad : disponibilidades) {
                System.out.println("Disponibilidad: ");
                disponibilidad.getHorarios().forEach(diaHorario -> 
                    System.out.println("Día: " + diaHorario.getDia() + ", Inicio: " + diaHorario.getHoraInicio() + ", Fin: " + diaHorario.getHoraFin())
                );
            }

            boolean disponible = disponibilidades.stream().anyMatch(disponibilidad -> 
                disponibilidad.getHorarios().stream().anyMatch(diaHorario -> 
                    diaHorario.getDia().equalsIgnoreCase(horario.getDia()) &&
                    (horario.getHoraInicio().equals(diaHorario.getHoraInicio()) || !horario.getHoraInicio().isBefore(diaHorario.getHoraInicio())) &&
                    (horario.getHoraFin().equals(diaHorario.getHoraFin()) || !horario.getHoraFin().isAfter(diaHorario.getHoraFin()))
                )
            );

            if (!disponible) {
                throw new IllegalArgumentException("El médico no tiene disponibilidad para el día " + horario.getDia() +
                        " entre " + horario.getHoraInicio() + " y " + horario.getHoraFin() + ".");
            }
        }

        // Validación: Conflictos de horarios en el mismo consultorio
        // Si hay conflicto, intentar usar el algoritmo de distribución automáticamente
        List<EsquemaTurno> esquemasEnConsultorio = esquemaTurnoRepository.findByConsultorioId(dto.getConsultorioId());
        boolean hayConflictoConsultorio = esquemasEnConsultorio.stream().anyMatch(existente ->
                !esquemaTurno.getId().equals(existente.getId()) &&
                hayConflictoDeHorarios(existente.getHorarios(), dto.getHorarios()));
        
        if (hayConflictoConsultorio) {
            // Intentar resolver automáticamente usando el algoritmo de distribución
            Integer consultorioAlternativo = resolverConflictoConsultorioAutomaticamente(esquemaTurno);
            
            if (consultorioAlternativo != null) {
                // Actualizar el DTO y la entidad con el consultorio alternativo
                dto.setConsultorioId(consultorioAlternativo);
                esquemaTurno.setConsultorio(consultorioRepository.findById(consultorioAlternativo)
                    .orElseThrow(() -> new IllegalArgumentException("Consultorio alternativo no encontrado")));
                
                System.out.println("🔄 CONFLICTO RESUELTO: Se asignó automáticamente el consultorio " + 
                                 consultorioAlternativo + " al médico " + 
                                 esquemaTurno.getStaffMedico().getMedico().getNombre());
            } else {
                throw new IllegalStateException("Conflicto: No se encontró consultorio disponible para resolver el conflicto de horarios.");
            }
        }

        // Validación: Conflictos de horarios para el mismo médico en diferentes consultorios
        List<EsquemaTurno> esquemasDelMedico = esquemaTurnoRepository.findByStaffMedicoId(dto.getStaffMedicoId());
        if (esquemasDelMedico.stream().anyMatch(existente ->
                !esquemaTurno.getId().equals(existente.getId()) &&
                hayConflictoDeHorarios(existente.getHorarios(), dto.getHorarios()))) {
            throw new IllegalStateException("Conflicto: El médico ya está asignado a otro consultorio en este horario.");
        }

        // NUEVA VALIDACIÓN: Verificar disponibilidad del consultorio y conflictos
        validarDisponibilidadConsultorio(esquemaTurno);

        return toDTO(esquemaTurnoRepository.save(esquemaTurno));
    }

    private boolean hayConflictoDeHorarios(List<EsquemaTurno.Horario> horariosExistentes,
            List<EsquemaTurnoDTO.DiaHorarioDTO> nuevosHorarios) {
        return nuevosHorarios.stream()
                .anyMatch(nuevoHorario -> horariosExistentes.stream()
                        .anyMatch(horarioExistente -> nuevoHorario.getDia().equals(horarioExistente.getDia()) &&
                                nuevoHorario.getHoraInicio().isBefore(horarioExistente.getHoraFin()) &&
                                nuevoHorario.getHoraFin().isAfter(horarioExistente.getHoraInicio())));
    }

    /**
     * Valida que el consultorio esté disponible para el esquema de turno.
     * Verifica conflictos de horarios con otros médicos usando el mismo consultorio.
     */
    private void validarDisponibilidadConsultorio(EsquemaTurno esquemaTurno) {
        if (esquemaTurno.getConsultorio() == null) {
            return; // Ya validado en saveOrUpdate
        }
        
        // Obtener esquemas existentes que usan el mismo consultorio
        List<EsquemaTurno> esquemasExistentes = esquemaTurnoRepository.findByConsultorioId(esquemaTurno.getConsultorio().getId());
        
        // Filtrar el esquema actual si está siendo actualizado
        if (esquemaTurno.getId() != null) {
            esquemasExistentes = esquemasExistentes.stream()
                .filter(e -> !e.getId().equals(esquemaTurno.getId()))
                .collect(Collectors.toList());
        }
        
        // Verificar conflictos de horario
        for (EsquemaTurno.Horario nuevoHorario : esquemaTurno.getHorarios()) {
            for (EsquemaTurno esquemaExistente : esquemasExistentes) {
                for (EsquemaTurno.Horario horarioExistente : esquemaExistente.getHorarios()) {
                    if (hayConflictoHorario(nuevoHorario, horarioExistente)) {
                        throw new IllegalStateException(String.format(
                            "Conflicto de horarios: El médico %s ya tiene asignado el consultorio %d " +
                            "el %s de %s a %s. Conflicto con el horario propuesto para %s de %s a %s.",
                            esquemaExistente.getStaffMedico().getMedico().getNombre(),
                            esquemaTurno.getConsultorio().getId(),
                            horarioExistente.getDia(),
                            horarioExistente.getHoraInicio(),
                            horarioExistente.getHoraFin(),
                            nuevoHorario.getDia(),
                            nuevoHorario.getHoraInicio(),
                            nuevoHorario.getHoraFin()
                        ));
                    }
                }
            }
        }
    }
    
    /**
     * Verifica si dos horarios entran en conflicto.
     */
    private boolean hayConflictoHorario(EsquemaTurno.Horario horario1, EsquemaTurno.Horario horario2) {
        // Deben ser el mismo día
        if (!horario1.getDia().equalsIgnoreCase(horario2.getDia())) {
            return false;
        }
        
        // Verificar superposición de horarios
        return horario1.getHoraInicio().isBefore(horario2.getHoraFin()) && 
               horario1.getHoraFin().isAfter(horario2.getHoraInicio());
    }

    @Transactional
    public void deleteById(Integer id) {
        esquemaTurnoRepository.deleteById(id);
    }

    public void deleteAll() {
        esquemaTurnoRepository.deleteAll();
    }

    public List<EsquemaTurnoDTO> findByStaffMedico(Integer staffMedicoId) {
        return esquemaTurnoRepository.findByStaffMedicoId(staffMedicoId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // Nuevos métodos para centros de atención
    public List<EsquemaTurnoDTO> findByCentroAtencion(Integer centroId) {
        return esquemaTurnoRepository.findByCentroAtencionId(centroId)
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EsquemaTurnoDTO> findDisponiblesByCentroAtencion(Integer centroId) {
        // Lógica para obtener esquemas disponibles del centro
        // Por ahora, retornamos todos los esquemas del centro
        return findByCentroAtencion(centroId);
    }

    public List<EsquemaTurnoDTO> search(String term) {
        return esquemaTurnoRepository.findAll()
                .stream()
                .filter(esquema -> 
                    esquema.getStaffMedico().getMedico().getNombre().toLowerCase().contains(term.toLowerCase()) ||
                    esquema.getStaffMedico().getMedico().getApellido().toLowerCase().contains(term.toLowerCase()) ||
                    esquema.getCentroAtencion().getNombre().toLowerCase().contains(term.toLowerCase()) ||
                    esquema.getConsultorio().getNombre().toLowerCase().contains(term.toLowerCase())
                )
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    /**
     * Optimiza la distribución de consultorios para un centro de atención.
     * Este método delega la optimización al ConsultorioDistribucionService.
     */
    public Map<Integer, Integer> optimizarDistribucionConsultorios(Integer centroAtencionId, LocalDate fecha, String diaSemana) {
        return consultorioDistribucionService.distribuirConsultorios(centroAtencionId, fecha, diaSemana);
    }

    /**
     * Verifica si la distribución actual necesita optimización.
     */
    public boolean necesitaOptimizacion(Integer centroAtencionId, LocalDate fecha) {
        return consultorioDistribucionService.necesitaReoptimizacion(centroAtencionId, fecha);
    }

    /**
     * Resuelve conflictos de consultorios aplicando la distribución optimizada.
     */
    public List<String> resolverConflictosConsultorios(Integer centroAtencionId, LocalDate fecha, String diaSemana) {
        Map<Integer, Integer> distribucionOptima = optimizarDistribucionConsultorios(centroAtencionId, fecha, diaSemana);
        List<String> conflictosResueltos = new ArrayList<>();
        
        for (Map.Entry<Integer, Integer> asignacion : distribucionOptima.entrySet()) {
            Integer staffMedicoId = asignacion.getKey();
            Integer consultorioRecomendado = asignacion.getValue();
            
            // Buscar esquemas de este médico
            List<EsquemaTurno> esquemas = esquemaTurnoRepository.findByStaffMedicoId(staffMedicoId);
            
            for (EsquemaTurno esquema : esquemas) {
                if (!esquema.getConsultorio().getId().equals(consultorioRecomendado)) {
                    String mensaje = String.format(
                        "Médico %s: Se recomienda cambiar del consultorio %d al consultorio %d",
                        esquema.getStaffMedico().getMedico().getNombre(),
                        esquema.getConsultorio().getId(),
                        consultorioRecomendado
                    );
                    conflictosResueltos.add(mensaje);
                }
            }
        }
        
        return conflictosResueltos;
    }

    /**
     * Resuelve automáticamente un conflicto de consultorio usando el algoritmo de distribución.
     * @param esquemaTurno El esquema de turno que tiene conflicto
     * @return ID del consultorio alternativo, o null si no se puede resolver
     */
    private Integer resolverConflictoConsultorioAutomaticamente(EsquemaTurno esquemaTurno) {
        try {
            LocalDate hoy = LocalDate.now();
            String diaSemana = hoy.getDayOfWeek().name();
            
            // Usar el algoritmo de distribución para obtener la asignación óptima
            Map<Integer, Integer> distribucionOptima = consultorioDistribucionService.distribuirConsultorios(
                esquemaTurno.getCentroAtencion().getId(), 
                hoy, 
                diaSemana
            );
            
            // Buscar la asignación recomendada para este médico
            Integer staffMedicoId = esquemaTurno.getStaffMedico().getId();
            Integer consultorioRecomendado = distribucionOptima.get(staffMedicoId);
            
            if (consultorioRecomendado != null && !consultorioRecomendado.equals(esquemaTurno.getConsultorio().getId())) {
                // Verificar que el consultorio recomendado no tenga conflictos
                List<EsquemaTurno> esquemasEnConsultorioRecomendado = esquemaTurnoRepository.findByConsultorioId(consultorioRecomendado);
                boolean hayConflictoEnRecomendado = esquemasEnConsultorioRecomendado.stream().anyMatch(existente ->
                        !esquemaTurno.getId().equals(existente.getId()) &&
                        hayConflictoDeHorarios(existente.getHorarios(), 
                                              esquemaTurno.getHorarios().stream()
                                                      .map(h -> {
                                                          EsquemaTurnoDTO.DiaHorarioDTO dto = new EsquemaTurnoDTO.DiaHorarioDTO();
                                                          dto.setDia(h.getDia());
                                                          dto.setHoraInicio(h.getHoraInicio());
                                                          dto.setHoraFin(h.getHoraFin());
                                                          return dto;
                                                      })
                                                      .collect(Collectors.toList())));
                
                if (!hayConflictoEnRecomendado) {
                    return consultorioRecomendado;
                }
            }
            
            // Si el algoritmo no encuentra solución, buscar cualquier consultorio disponible
            List<Integer> consultoriosDisponibles = consultorioRepository.findByCentroAtencionId(esquemaTurno.getCentroAtencion().getId())
                .stream()
                .map(c -> c.getId())
                .filter(consultorioId -> {
                    List<EsquemaTurno> esquemas = esquemaTurnoRepository.findByConsultorioId(consultorioId);
                    return esquemas.stream().noneMatch(existente ->
                            !esquemaTurno.getId().equals(existente.getId()) &&
                            hayConflictoDeHorarios(existente.getHorarios(), 
                                                  esquemaTurno.getHorarios().stream()
                                                          .map(h -> {
                                                              EsquemaTurnoDTO.DiaHorarioDTO dto = new EsquemaTurnoDTO.DiaHorarioDTO();
                                                              dto.setDia(h.getDia());
                                                              dto.setHoraInicio(h.getHoraInicio());
                                                              dto.setHoraFin(h.getHoraFin());
                                                              return dto;
                                                          })
                                                          .collect(Collectors.toList())));
                })
                .collect(Collectors.toList());
            
            return consultoriosDisponibles.isEmpty() ? null : consultoriosDisponibles.get(0);
            
        } catch (Exception e) {
            System.err.println("Error al resolver conflicto automáticamente: " + e.getMessage());
            return null;
        }
    }

    private EsquemaTurnoDTO toDTO(EsquemaTurno esquema) {
        EsquemaTurnoDTO dto = new EsquemaTurnoDTO();
        dto.setId(esquema.getId());
        dto.setIntervalo(esquema.getIntervalo());
        dto.setDisponibilidadMedicoId(esquema.getDisponibilidadMedico().getId());

        dto.setHorarios(esquema.getHorarios().stream().map(horario -> {
            EsquemaTurnoDTO.DiaHorarioDTO diaHorarioDTO = new EsquemaTurnoDTO.DiaHorarioDTO();
            diaHorarioDTO.setDia(horario.getDia());
            diaHorarioDTO.setHoraInicio(horario.getHoraInicio());
            diaHorarioDTO.setHoraFin(horario.getHoraFin());
            return diaHorarioDTO;
        }).collect(Collectors.toList()));

        // Mapear nombres
        dto.setStaffMedicoId(esquema.getStaffMedico().getId());
        dto.setNombreStaffMedico(esquema.getStaffMedico().getMedico().getNombre() + " " +
                esquema.getStaffMedico().getMedico().getApellido());

        dto.setCentroId(esquema.getCentroAtencion().getId());
        dto.setNombreCentro(esquema.getCentroAtencion().getNombre());

        dto.setConsultorioId(esquema.getConsultorio().getId());
        dto.setNombreConsultorio(esquema.getConsultorio().getNombre());

        return dto;
    }

    private EsquemaTurno toEntity(EsquemaTurnoDTO dto) {
        EsquemaTurno esquema = new EsquemaTurno();
        esquema.setId(dto.getId());
        esquema.setIntervalo(dto.getIntervalo());

        DisponibilidadMedico disponibilidad = disponibilidadMedicoRepository.findById(dto.getDisponibilidadMedicoId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "DisponibilidadMedico no encontrada con ID: " + dto.getDisponibilidadMedicoId()));
        esquema.setDisponibilidadMedico(disponibilidad);

        esquema.setStaffMedico(disponibilidad.getStaffMedico());
        esquema.setCentroAtencion(centroAtencionRepository.findById(dto.getCentroId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "CentroAtencion no encontrado con ID: " + dto.getCentroId())));
        esquema.setConsultorio(consultorioRepository.findById(dto.getConsultorioId())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Consultorio no encontrado con ID: " + dto.getConsultorioId())));

        esquema.setHorarios(dto.getHorarios().stream().map(horarioDTO -> {
            EsquemaTurno.Horario horario = new EsquemaTurno.Horario();
            horario.setDia(horarioDTO.getDia());
            horario.setHoraInicio(horarioDTO.getHoraInicio());
            horario.setHoraFin(horarioDTO.getHoraFin());
            return horario;
        }).collect(Collectors.toList()));

        return esquema;
    }
}