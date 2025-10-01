package unpsjb.labprog.backend.business.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
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

    public List<EsquemaTurnoDTO> findByStaffMedico(Integer staffMedicoId) {
        return esquemaTurnoRepository.findByStaffMedicoId(staffMedicoId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteById(Integer id) {
        esquemaTurnoRepository.deleteById(id);
    }

    public List<EsquemaTurnoDTO> findByCentroAtencion(Integer centroId) {
        return esquemaTurnoRepository.findByCentroAtencionId(centroId).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public List<EsquemaTurnoDTO> findDisponiblesByCentroAtencion(Integer centroId) {
        // Por ahora retornamos todos los esquemas del centro
        // Se puede agregar lógica adicional para filtrar por disponibilidad
        return findByCentroAtencion(centroId);
    }

    public List<EsquemaTurnoDTO> search(String term) {
        // Implementar búsqueda simple por nombre de médico o centro
        return esquemaTurnoRepository.findAll().stream()
                .filter(esquema -> {
                    String medicoNombre = esquema.getStaffMedico().getMedico().getNombre() + " " +
                                        esquema.getStaffMedico().getMedico().getApellido();
                    String centroNombre = esquema.getCentroAtencion().getNombre();
                    String consultorioNombre = esquema.getConsultorio() != null ? 
                                               esquema.getConsultorio().getNombre() : "";
                    
                    return medicoNombre.toLowerCase().contains(term.toLowerCase()) ||
                           centroNombre.toLowerCase().contains(term.toLowerCase()) ||
                           consultorioNombre.toLowerCase().contains(term.toLowerCase());
                })
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public Page<EsquemaTurnoDTO> findByPage(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<EsquemaTurno> esquemaPage = esquemaTurnoRepository.findAll(pageRequest);
        return esquemaPage.map(this::toDTO);
    }

    /**
     * Valida conflictos de un esquema sin guardarlo
     * Útil para validación en tiempo real en el frontend
     */
    public Map<String, Object> validarConflictos(EsquemaTurnoDTO dto) {
        Map<String, Object> resultado = new HashMap<>();
        List<String> conflictos = new ArrayList<>();
        List<String> advertencias = new ArrayList<>();
        
        try {
            // Validación básica
            if (dto.getStaffMedicoId() == null) {
                conflictos.add("El campo staffMedicoId es obligatorio.");
            }
            
            if (dto.getConsultorioId() == null) {
                conflictos.add("El consultorio es obligatorio.");
            }
            
            if (dto.getHorarios() == null || dto.getHorarios().isEmpty()) {
                conflictos.add("Los horarios son obligatorios.");
            }
            
            // Si hay errores básicos, no continuar
            if (!conflictos.isEmpty()) {
                resultado.put("valido", false);
                resultado.put("conflictos", conflictos);
                resultado.put("advertencias", advertencias);
                return resultado;
            }
            
            // Crear esquema temporal para validaciones
            EsquemaTurno esquemaTemporal = toEntity(dto);
            
            // Validar conflictos de horarios para el mismo médico en diferentes consultorios
            List<EsquemaTurno> esquemasDelMedico = esquemaTurnoRepository.findByStaffMedicoId(dto.getStaffMedicoId());
            List<String> conflictosDetallados = validarConflictosMedicoEnConsultorios(esquemasDelMedico, esquemaTemporal, dto.getHorarios());
            conflictos.addAll(conflictosDetallados);
            
            // Validar disponibilidad del médico
            List<DisponibilidadMedico> disponibilidades = disponibilidadMedicoRepository.findByStaffMedicoId(dto.getStaffMedicoId());
            for (EsquemaTurnoDTO.DiaHorarioDTO horario : dto.getHorarios()) {
                boolean disponible = disponibilidades.stream().anyMatch(disponibilidad -> 
                    disponibilidad.getHorarios().stream().anyMatch(diaHorario -> 
                        diaHorario.getDia().equalsIgnoreCase(horario.getDia()) &&
                        (horario.getHoraInicio().equals(diaHorario.getHoraInicio()) || !horario.getHoraInicio().isBefore(diaHorario.getHoraInicio())) &&
                        (horario.getHoraFin().equals(diaHorario.getHoraFin()) || !horario.getHoraFin().isAfter(diaHorario.getHoraFin()))
                    )
                );

                if (!disponible) {
                    conflictos.add("El médico no tiene disponibilidad para el día " + horario.getDia() +
                            " entre " + horario.getHoraInicio() + " y " + horario.getHoraFin() + ".");
                }
            }
            
            // Validar conflictos en el mismo consultorio
            if (dto.getConsultorioId() != null) {
                List<EsquemaTurno> esquemasEnConsultorio = esquemaTurnoRepository.findByConsultorioId(dto.getConsultorioId());
                boolean hayConflictoConsultorio = esquemasEnConsultorio.stream().anyMatch(existente ->
                        !existente.getId().equals(dto.getId()) &&
                        hayConflictoDeHorarios(existente.getHorarios(), dto.getHorarios()));
                
                if (hayConflictoConsultorio) {
                    // Intentar encontrar consultorio alternativo
                    Integer consultorioAlternativo = resolverConflictoConsultorioAutomaticamente(esquemaTemporal);
                    if (consultorioAlternativo != null) {
                        advertencias.add("Conflicto en consultorio " + dto.getConsultorioId() + 
                                       ". Se sugiere consultorio alternativo: " + consultorioAlternativo);
                    } else {
                        conflictos.add("Conflicto de horarios en el consultorio " + dto.getConsultorioId() + 
                                     ". No hay consultorios alternativos disponibles.");
                    }
                }
            }
            
        } catch (Exception e) {
            conflictos.add("Error en validación: " + e.getMessage());
        }
        
        resultado.put("valido", conflictos.isEmpty());
        resultado.put("conflictos", conflictos);
        resultado.put("advertencias", advertencias);
        
        return resultado;
    }

    @Transactional
    public EsquemaTurnoDTO saveOrUpdate(EsquemaTurnoDTO dto) {
        // Validación: Staff Médico
        if (dto.getStaffMedicoId() == null) {
            throw new IllegalArgumentException("El campo staffMedicoId es obligatorio.");
        }

        // Validación: Consultorio (ahora es obligatorio)
        if (dto.getConsultorioId() == null) {
            throw new IllegalArgumentException("El consultorio es obligatorio. Debe seleccionar un consultorio específico.");
        }
        if (!consultorioRepository.existsById(dto.getConsultorioId())) {
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

        // NUEVO: Ajustar automáticamente los horarios del esquema para que encajen en el consultorio
        // El consultorio ahora es obligatorio, por lo que siempre debería estar presente
        if (esquemaTurno.getConsultorio() != null) {
            try {
                System.out.println("🔧 APLICANDO AJUSTE AUTOMÁTICO DE HORARIOS");
                List<String> advertencias = consultorioDistribucionService.ajustarHorariosEsquemaAConsultorio(
                    esquemaTurno.getHorarios(), esquemaTurno.getConsultorio().getId());
                
                if (!advertencias.isEmpty()) {
                    System.out.println("⚠️ ADVERTENCIAS DE AJUSTE:");
                    advertencias.forEach(System.out::println);
                }
            } catch (Exception e) {
                System.err.println("Error al ajustar horarios automáticamente: " + e.getMessage());
                // Continuar con las validaciones normales
            }
        }

        // Validación: Conflictos de horarios en el mismo consultorio
        // Si hay conflicto, intentar usar el algoritmo de distribución automáticamente
        if (esquemaTurno.getConsultorio() != null) {
            List<EsquemaTurno> esquemasEnConsultorio = esquemaTurnoRepository.findByConsultorioId(dto.getConsultorioId());
            boolean hayConflictoConsultorio = esquemasEnConsultorio.stream().anyMatch(existente ->
                    !existente.getId().equals(esquemaTurno.getId()) &&
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
        }

        // Validación: Conflictos de horarios para el mismo médico en diferentes consultorios
        List<EsquemaTurno> esquemasDelMedico = esquemaTurnoRepository.findByStaffMedicoId(dto.getStaffMedicoId());
        List<String> conflictosDetallados = validarConflictosMedicoEnConsultorios(esquemasDelMedico, esquemaTurno, dto.getHorarios());
        
        if (!conflictosDetallados.isEmpty()) {
            String mensajeDetallado = "Conflictos encontrados: " + String.join("; ", conflictosDetallados);
            throw new IllegalStateException(mensajeDetallado);
        }

        // NUEVA VALIDACIÓN: Verificar disponibilidad del consultorio y conflictos
        if (esquemaTurno.getConsultorio() != null) {
            validarDisponibilidadConsultorio(esquemaTurno);
        }

        return toDTO(esquemaTurnoRepository.save(esquemaTurno));
    }

    /**
     * Redistribuir esquemas de turno de un centro según porcentajes configurados
     * También crea esquemas automáticamente para disponibilidades sin esquemas
     */
    @Transactional
    public int redistribuirEsquemasPorCentro(Integer centroId) {
        // Validar que el centro existe
        if (!centroAtencionRepository.existsById(centroId)) {
            throw new IllegalArgumentException("Centro de atención no encontrado con ID: " + centroId);
        }

        int procesados = 0;

        // PASO 1: Redistribuir esquemas existentes
        List<EsquemaTurno> esquemas = esquemaTurnoRepository.findByCentroAtencionId(centroId);
        
        for (EsquemaTurno esquema : esquemas) {
            try {
                Integer nuevoConsultorioId = consultorioDistribucionService
                    .asignarConsultorioSegunPorcentajes(esquema.getStaffMedico().getId(), centroId);
                
                if (nuevoConsultorioId != null) {
                    esquema.setConsultorio(consultorioRepository.findById(nuevoConsultorioId)
                        .orElseThrow(() -> new IllegalArgumentException(
                            "Consultorio no encontrado con ID: " + nuevoConsultorioId)));
                    
                    // AJUSTE AUTOMÁTICO: Ajustar horarios del esquema al consultorio asignado
                    try {
                        List<String> advertencias = consultorioDistribucionService
                            .ajustarHorariosEsquemaAConsultorio(esquema.getHorarios(), nuevoConsultorioId);
                        
                        if (!advertencias.isEmpty()) {
                            System.out.println("🔧 AJUSTES APLICADOS al esquema ID " + esquema.getId() + ":");
                            advertencias.forEach(adv -> System.out.println("  - " + adv));
                        }
                    } catch (Exception adjustError) {
                        System.err.println("Error al ajustar horarios del esquema ID " + esquema.getId() + ": " + adjustError.getMessage());
                        // Continuar sin ajustar horarios
                    }
                    
                    esquemaTurnoRepository.save(esquema);
                    procesados++;
                }
            } catch (Exception e) {
                System.err.println("Error al redistribuir esquema ID " + esquema.getId() + ": " + e.getMessage());
                // Continuar con el siguiente esquema en caso de error
            }
        }

        // PASO 2: Crear esquemas automáticamente para disponibilidades sin esquemas
        try {
            int esquemasCreadosAutomaticamente = crearEsquemasDesdeDisponibilidades(centroId);
            procesados += esquemasCreadosAutomaticamente;
            
            if (esquemasCreadosAutomaticamente > 0) {
                System.out.println("✓ Se crearon automáticamente " + esquemasCreadosAutomaticamente + 
                                 " esquemas desde disponibilidades médicas");
            }
        } catch (Exception e) {
            System.err.println("Error al crear esquemas automáticos: " + e.getMessage());
        }

        return procesados;
    }

    /**
     * Crea esquemas de turno automáticamente desde las disponibilidades médicas que no tienen esquemas asociados
     */
    @Transactional
    public int crearEsquemasDesdeDisponibilidades(Integer centroId) {
        // Obtener todas las disponibilidades médicas del centro
        List<DisponibilidadMedico> disponibilidades = disponibilidadMedicoRepository
            .findByStaffMedico_CentroAtencionId(centroId);
        
        // Obtener IDs de disponibilidades que ya tienen esquemas asociados
        List<EsquemaTurno> esquemas = esquemaTurnoRepository.findByCentroAtencionId(centroId);
        Set<Integer> disponibilidadesConEsquema = esquemas.stream()
            .map(e -> e.getDisponibilidadMedico().getId())
            .collect(Collectors.toSet());
        
        // Filtrar disponibilidades sin esquemas
        List<DisponibilidadMedico> disponibilidadesSinEsquema = disponibilidades.stream()
            .filter(d -> !disponibilidadesConEsquema.contains(d.getId()))
            .collect(Collectors.toList());
        
        int esquemasCreadps = 0;
        
        for (DisponibilidadMedico disponibilidad : disponibilidadesSinEsquema) {
            try {
                // Crear esquema automático con intervalo por defecto de 30 minutos
                EsquemaTurno nuevoEsquema = new EsquemaTurno();
                nuevoEsquema.setDisponibilidadMedico(disponibilidad);
                nuevoEsquema.setStaffMedico(disponibilidad.getStaffMedico());
                nuevoEsquema.setCentroAtencion(centroAtencionRepository.findById(centroId)
                    .orElseThrow(() -> new IllegalArgumentException("Centro no encontrado")));
                nuevoEsquema.setIntervalo(20); // Intervalo por defecto de 20 minutos
                
                // Copiar horarios desde la disponibilidad
                List<EsquemaTurno.Horario> horariosEsquema = disponibilidad.getHorarios().stream()
                    .map(horario -> {
                        EsquemaTurno.Horario nuevoHorario = new EsquemaTurno.Horario();
                        nuevoHorario.setDia(horario.getDia());
                        nuevoHorario.setHoraInicio(horario.getHoraInicio());
                        nuevoHorario.setHoraFin(horario.getHoraFin());
                        return nuevoHorario;
                    })
                    .collect(Collectors.toList());
                
                nuevoEsquema.setHorarios(horariosEsquema);
                
                // Asignar consultorio según porcentajes
                Integer consultorioId = consultorioDistribucionService
                    .asignarConsultorioSegunPorcentajes(disponibilidad.getStaffMedico().getId(), centroId);
                
                if (consultorioId != null) {
                    nuevoEsquema.setConsultorio(consultorioRepository.findById(consultorioId)
                        .orElseThrow(() -> new IllegalArgumentException(
                            "Consultorio no encontrado con ID: " + consultorioId)));
                    
                    // AJUSTE AUTOMÁTICO: Ajustar horarios del esquema al consultorio asignado
                    try {
                        List<String> advertencias = consultorioDistribucionService
                            .ajustarHorariosEsquemaAConsultorio(horariosEsquema, consultorioId);
                        
                        if (!advertencias.isEmpty()) {
                            System.out.println("🔧 AJUSTES APLICADOS al nuevo esquema de " + 
                                             disponibilidad.getStaffMedico().getMedico().getNombre() + ":");
                            advertencias.forEach(adv -> System.out.println("  - " + adv));
                        }
                    } catch (Exception adjustError) {
                        System.err.println("Error al ajustar horarios del nuevo esquema: " + adjustError.getMessage());
                        // Continuar sin ajustar horarios
                    }
                }
                
                // Guardar el nuevo esquema
                esquemaTurnoRepository.save(nuevoEsquema);
                esquemasCreadps++;
                
                System.out.println("✓ Esquema creado automáticamente para " + 
                                 disponibilidad.getStaffMedico().getMedico().getNombre() + " " +
                                 disponibilidad.getStaffMedico().getMedico().getApellido());
                
            } catch (Exception e) {
                System.err.println("Error al crear esquema automático para disponibilidad ID " + 
                                 disponibilidad.getId() + ": " + e.getMessage());
                // Continuar con la siguiente disponibilidad
            }
        }
        
        return esquemasCreadps;
    }

    /**
     * Redistribuir esquemas de turno de un médico específico
     */
    @Transactional
    public int redistribuirEsquemasPorMedico(Integer medicoId) {
        // Obtener todos los esquemas del médico
        List<EsquemaTurno> esquemas = esquemaTurnoRepository.findByStaffMedicoId(medicoId);
        
        if (esquemas.isEmpty()) {
            return 0;
        }

        int procesados = 0;
        Integer centroId = null;
        
        // Obtener el centro del primer esquema (todos deberían ser del mismo centro)
        if (!esquemas.isEmpty()) {
            centroId = esquemas.get(0).getCentroAtencion().getId();
        }

        for (EsquemaTurno esquema : esquemas) {
            try {
                Integer nuevoConsultorioId = consultorioDistribucionService
                    .asignarConsultorioSegunPorcentajes(medicoId, centroId);
                
                if (nuevoConsultorioId != null) {
                    esquema.setConsultorio(consultorioRepository.findById(nuevoConsultorioId)
                        .orElseThrow(() -> new IllegalArgumentException(
                            "Consultorio no encontrado con ID: " + nuevoConsultorioId)));
                    esquemaTurnoRepository.save(esquema);
                    procesados++;
                }
            } catch (Exception e) {
                System.err.println("Error al redistribuir esquema ID " + esquema.getId() + 
                    " del médico " + medicoId + ": " + e.getMessage());
                // Continuar con el siguiente esquema en caso de error
            }
        }

        return procesados;
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

        // Manejar consultorio opcional
        if (esquema.getConsultorio() != null) {
            dto.setConsultorioId(esquema.getConsultorio().getId());
            dto.setNombreConsultorio(esquema.getConsultorio().getNombre());
        } else {
            dto.setConsultorioId(null);
            dto.setNombreConsultorio("Pendiente de asignación");
        }

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
        
        // Manejar consultorio opcional
        if (dto.getConsultorioId() != null) {
            esquema.setConsultorio(consultorioRepository.findById(dto.getConsultorioId())
                    .orElseThrow(() -> new IllegalArgumentException(
                            "Consultorio no encontrado con ID: " + dto.getConsultorioId())));
        } else {
            esquema.setConsultorio(null);
        }

        esquema.setHorarios(dto.getHorarios().stream().map(horarioDTO -> {
            EsquemaTurno.Horario horario = new EsquemaTurno.Horario();
            horario.setDia(horarioDTO.getDia());
            horario.setHoraInicio(horarioDTO.getHoraInicio());
            horario.setHoraFin(horarioDTO.getHoraFin());
            return horario;
        }).collect(Collectors.toList()));

        return esquema;
    }

    /**
     * Valida conflictos específicos para un médico en diferentes consultorios
     * y devuelve una lista detallada de los conflictos encontrados
     */
    private List<String> validarConflictosMedicoEnConsultorios(List<EsquemaTurno> esquemasDelMedico, 
                                                               EsquemaTurno esquemaNuevo, 
                                                               List<EsquemaTurnoDTO.DiaHorarioDTO> nuevosHorarios) {
        List<String> conflictos = new ArrayList<>();
        
        for (EsquemaTurno existente : esquemasDelMedico) {
            // Omitir si es el mismo esquema (caso de actualización)
            if (existente.getId() != null && existente.getId().equals(esquemaNuevo.getId())) {
                continue;
            }
            
            // Verificar conflictos horario por horario
            for (EsquemaTurnoDTO.DiaHorarioDTO nuevoHorario : nuevosHorarios) {
                for (EsquemaTurno.Horario horarioExistente : existente.getHorarios()) {
                    if (hayConflictoHorarioDetallado(nuevoHorario, horarioExistente)) {
                        String consultorioExistente = existente.getConsultorio() != null ? 
                            existente.getConsultorio().getNombre() : "Sin consultorio asignado";
                        String consultorioNuevo = esquemaNuevo.getConsultorio() != null ? 
                            esquemaNuevo.getConsultorio().getNombre() : "Sin consultorio asignado";
                            
                        conflictos.add(String.format(
                            "El médico ya está asignado en '%s' el %s de %s a %s. " +
                            "Conflicto con el horario propuesto para '%s' el %s de %s a %s.",
                            consultorioExistente,
                            horarioExistente.getDia(),
                            horarioExistente.getHoraInicio(),
                            horarioExistente.getHoraFin(),
                            consultorioNuevo,
                            nuevoHorario.getDia(),
                            nuevoHorario.getHoraInicio(),
                            nuevoHorario.getHoraFin()
                        ));
                    }
                }
            }
        }
        
        return conflictos;
    }
    
    /**
     * Verifica si hay conflicto entre un horario nuevo y uno existente
     */
    private boolean hayConflictoHorarioDetallado(EsquemaTurnoDTO.DiaHorarioDTO nuevoHorario, 
                                                EsquemaTurno.Horario horarioExistente) {
        // Deben ser el mismo día
        if (!nuevoHorario.getDia().equalsIgnoreCase(horarioExistente.getDia())) {
            return false;
        }
        
        // Verificar superposición de horarios
        return nuevoHorario.getHoraInicio().isBefore(horarioExistente.getHoraFin()) && 
               nuevoHorario.getHoraFin().isAfter(horarioExistente.getHoraInicio());
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
     * Primero ajusta automáticamente los horarios para que encajen en el consultorio.
     * Luego verifica conflictos de horarios con otros médicos usando el mismo consultorio.
     */
    private void validarDisponibilidadConsultorio(EsquemaTurno esquemaTurno) {
        if (esquemaTurno.getConsultorio() == null) {
            return; // Ya validado en saveOrUpdate
        }
        
        // PASO 1: Ajustar automáticamente los horarios del esquema al consultorio
        List<String> advertencias = consultorioDistribucionService.ajustarHorariosEsquemaAConsultorio(
            esquemaTurno.getHorarios(), 
            esquemaTurno.getConsultorio().getId()
        );
        
        // Mostrar advertencias sobre los ajustes realizados
        if (!advertencias.isEmpty()) {
            System.out.println("🔧 AJUSTES AUTOMÁTICOS REALIZADOS:");
            for (String advertencia : advertencias) {
                System.out.println("  - " + advertencia);
            }
        }
        
        // Verificar que después del ajuste aún queden horarios válidos
        if (esquemaTurno.getHorarios().isEmpty()) {
            throw new IllegalStateException(String.format(
                "Después del ajuste automático no quedaron horarios válidos para el consultorio %s. " +
                "Los horarios del médico no se superponen con los horarios de atención del consultorio.",
                esquemaTurno.getConsultorio().getNombre()
            ));
        }
        
        // PASO 2: Obtener esquemas existentes que usan el mismo consultorio
        List<EsquemaTurno> esquemasExistentes = esquemaTurnoRepository.findByConsultorioId(esquemaTurno.getConsultorio().getId());
        
        // Filtrar el esquema actual si está siendo actualizado
        if (esquemaTurno.getId() != null) {
            esquemasExistentes = esquemasExistentes.stream()
                .filter(e -> !e.getId().equals(esquemaTurno.getId()))
                .collect(Collectors.toList());
        }
        
        // PASO 3: Verificar conflictos de horario con otros médicos
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

    /**
     * Intenta resolver un conflicto de consultorio automáticamente usando el algoritmo de distribución
     */
    private Integer resolverConflictoConsultorioAutomaticamente(EsquemaTurno esquemaTurno) {
        try {
            return consultorioDistribucionService.asignarConsultorioSegunPorcentajes(
                esquemaTurno.getStaffMedico().getId(),
                esquemaTurno.getCentroAtencion().getId()
            );
        } catch (Exception e) {
            System.err.println("Error al resolver conflicto automáticamente: " + e.getMessage());
            return null;
        }
    }
}