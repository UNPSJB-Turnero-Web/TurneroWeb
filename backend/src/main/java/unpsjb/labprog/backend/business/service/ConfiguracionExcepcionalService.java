package unpsjb.labprog.backend.business.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.ConfiguracionExcepcionalRepository;
import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.dto.ConfiguracionExcepcionalDTO;
import unpsjb.labprog.backend.model.ConfiguracionExcepcional;
import unpsjb.labprog.backend.model.Consultorio;
import unpsjb.labprog.backend.model.EsquemaTurno;

/**
 * Servicio para manejar configuraciones excepcionales (feriados, mantenimientos, atención especial).
 * Separado de AgendaService para simplicidad y claridad.
 */
@Service
public class ConfiguracionExcepcionalService {

    @Autowired
    private ConfiguracionExcepcionalRepository repository;
    
    @Autowired
    private ConsultorioRepository consultorioRepository;
    
    @Autowired
    private EsquemaTurnoRepository esquemaTurnoRepository;

    /**
     * Crear un feriado (aplica a todo el sistema)
     */
    @Transactional
    public ConfiguracionExcepcional crearFeriado(LocalDate fecha, String descripcion) {
        ConfiguracionExcepcional config = new ConfiguracionExcepcional();
        config.setFecha(fecha);
        config.setTipo(ConfiguracionExcepcional.TipoExcepcion.FERIADO);
        config.setDescripcion(descripcion);
        config.setActivo(true);
        // centroAtencion, consultorio y esquemaTurno quedan null (aplica globalmente)
        
        return repository.save(config);
    }

    /**
     * Crear un mantenimiento para un consultorio específico
     */
    @Transactional
    public ConfiguracionExcepcional crearMantenimiento(LocalDate fecha, String descripcion, 
                                                      Integer consultorioId, LocalTime horaInicio, 
                                                      Integer tiempoSanitizacion) {
        Optional<Consultorio> consultorio = consultorioRepository.findById(consultorioId);
        if (!consultorio.isPresent()) {
            throw new IllegalArgumentException("Consultorio no encontrado con ID: " + consultorioId);
        }

        ConfiguracionExcepcional config = new ConfiguracionExcepcional();
        config.setFecha(fecha);
        config.setTipo(ConfiguracionExcepcional.TipoExcepcion.MANTENIMIENTO);
        config.setDescripcion(descripcion);
        config.setConsultorio(consultorio.get());
        config.setCentroAtencion(consultorio.get().getCentroAtencion());
        config.setHoraInicio(horaInicio);
        // Para mantenimiento, horaFin se calcula como horaInicio + tiempoSanitizacion
        if (horaInicio != null && tiempoSanitizacion != null) {
            config.setHoraFin(horaInicio.plusMinutes(tiempoSanitizacion));
        }
        config.setTiempoSanitizacion(tiempoSanitizacion);
        config.setActivo(true);
        
        return repository.save(config);
    }

    /**
     * Crear atención especial para un esquema de turno específico
     */
    @Transactional
    public ConfiguracionExcepcional crearAtencionEspecial(LocalDate fecha, String descripcion,
                                                         Integer esquemaTurnoId, LocalTime horaInicio, 
                                                         LocalTime horaFin, Integer tiempoSanitizacion) {
        Optional<EsquemaTurno> esquema = esquemaTurnoRepository.findById(esquemaTurnoId);
        if (!esquema.isPresent()) {
            throw new IllegalArgumentException("EsquemaTurno no encontrado con ID: " + esquemaTurnoId);
        }

        ConfiguracionExcepcional config = new ConfiguracionExcepcional();
        config.setFecha(fecha);
        config.setTipo(ConfiguracionExcepcional.TipoExcepcion.ATENCION_ESPECIAL);
        config.setDescripcion(descripcion);
        config.setEsquemaTurno(esquema.get());
        config.setCentroAtencion(esquema.get().getCentroAtencion());
        config.setConsultorio(esquema.get().getConsultorio());
        config.setHoraInicio(horaInicio);
        config.setHoraFin(horaFin);
        config.setTiempoSanitizacion(tiempoSanitizacion);
        config.setActivo(true);
        
        return repository.save(config);
    }

    /**
     * Verificar si una fecha es feriado
     */
    public boolean esFeriado(LocalDate fecha) {
        return repository.existsByFechaAndTipoAndActivoTrue(
            fecha, ConfiguracionExcepcional.TipoExcepcion.FERIADO);
    }

    /**
     * Verificar si un consultorio tiene mantenimiento en una fecha
     */
    public boolean tieneMantenimiento(LocalDate fecha, Integer consultorioId) {
        List<ConfiguracionExcepcional> mantenimientos = repository
            .findByFechaAndConsultorio_IdAndActivoTrue(fecha, consultorioId);
        
        return mantenimientos.stream()
            .anyMatch(m -> m.getTipo() == ConfiguracionExcepcional.TipoExcepcion.MANTENIMIENTO);
    }

    /**
     * Verificar si un horario específico está en conflicto con un mantenimiento
     */
    public boolean tieneMantenimientoEnHorario(LocalDate fecha, Integer consultorioId, 
                                              LocalTime horaInicio, LocalTime horaFin) {
        List<ConfiguracionExcepcional> mantenimientos = repository
            .findByFechaAndConsultorio_IdAndActivoTrue(fecha, consultorioId);
        
        return mantenimientos.stream()
            .filter(m -> m.getTipo() == ConfiguracionExcepcional.TipoExcepcion.MANTENIMIENTO)
            .anyMatch(m -> hayConflictoHorario(
                horaInicio, horaFin, 
                m.getHoraInicio(), m.getHoraFin()
            ));
    }

    /**
     * Verificar si un turno específico está en conflicto con un mantenimiento
     */
    public boolean turnoEnConflictoConMantenimiento(LocalDate fecha, Integer consultorioId, 
                                                   LocalTime horaTurno, Integer duracionTurno) {
        LocalTime finTurno = horaTurno.plusMinutes(duracionTurno);
        
        List<ConfiguracionExcepcional> mantenimientos = repository
            .findByFechaAndConsultorio_IdAndActivoTrue(fecha, consultorioId);
        
        // Filter maintenance configurations
        List<ConfiguracionExcepcional> mantenimientosReales = mantenimientos.stream()
            .filter(m -> m.getTipo() == ConfiguracionExcepcional.TipoExcepcion.MANTENIMIENTO)
            .collect(Collectors.toList());
        
        // Log only if there are actual maintenance configurations
        if (!mantenimientosReales.isEmpty()) {
            System.out.println("=== MAINTENANCE CHECK ===");
            System.out.println("Checking slot: " + horaTurno + "-" + finTurno + " on " + fecha + " for consultorio " + consultorioId);
            System.out.println("Found " + mantenimientosReales.size() + " maintenance configurations:");
            for (ConfiguracionExcepcional mant : mantenimientosReales) {
                System.out.println("  - Maint ID: " + mant.getId() + ", Consultorio: " + 
                                 (mant.getConsultorio() != null ? mant.getConsultorio().getId() : "NULL") + 
                                 ", Horario: " + mant.getHoraInicio() + "-" + mant.getHoraFin() + 
                                 ", Descripcion: " + mant.getDescripcion());
            }
        }
        
        for (ConfiguracionExcepcional mant : mantenimientosReales) {
            boolean conflict = hayConflictoHorario(horaTurno, finTurno, mant.getHoraInicio(), mant.getHoraFin());
            if (conflict) {
                System.out.println("*** SLOT " + horaTurno + "-" + finTurno + " CONFLICTS WITH MAINTENANCE " + 
                                 mant.getHoraInicio() + "-" + mant.getHoraFin() + " ***");
                return true;
            }
        }
        
        return false; // No conflicts found
    }

    /**
     * Método auxiliar para verificar si dos rangos de horarios se superponen
     */
    private boolean hayConflictoHorario(LocalTime inicio1, LocalTime fin1, 
                                       LocalTime inicio2, LocalTime fin2) {
        if (inicio1 == null || fin1 == null || inicio2 == null || fin2 == null) {
            return false;
        }
        
        // Dos rangos se superponen si:
        // - El inicio del primero es antes del fin del segundo Y
        // - El fin del primero es después del inicio del segundo
        return inicio1.isBefore(fin2) && fin1.isAfter(inicio2);
    }

    /**
     * Obtener configuración de atención especial para un esquema en una fecha
     */
    public Optional<ConfiguracionExcepcional> obtenerAtencionEspecial(LocalDate fecha, Integer esquemaTurnoId) {
        List<ConfiguracionExcepcional> configuraciones = repository
            .findByFechaAndEsquemaTurno_IdAndActivoTrue(fecha, esquemaTurnoId);
        
        return configuraciones.stream()
            .filter(c -> c.getTipo() == ConfiguracionExcepcional.TipoExcepcion.ATENCION_ESPECIAL)
            .findFirst();
    }

    /**
     * Obtener todas las configuraciones para una fecha
     */
    public List<ConfiguracionExcepcional> obtenerConfiguraciones(LocalDate fecha) {
        return repository.findByFechaAndActivoTrue(fecha);
    }

    /**
     * Obtener configuraciones por rango de fechas
     */
    public List<ConfiguracionExcepcional> obtenerConfiguracionesPorRango(LocalDate fechaInicio, LocalDate fechaFin) {
        return repository.findByFechaBetweenAndActivoTrue(fechaInicio, fechaFin);
    }

    /**
     * Obtener configuraciones por rango de fechas y centro
     */
    public List<ConfiguracionExcepcional> obtenerConfiguracionesPorCentro(LocalDate fechaInicio, 
                                                                          LocalDate fechaFin, 
                                                                          Integer centroId) {
        return repository.findByFechaBetweenAndCentroAtencion_IdAndActivoTrue(fechaInicio, fechaFin, centroId);
    }

    /**
     * Eliminar (desactivar) una configuración
     */
    @Transactional
    public void eliminarConfiguracion(Integer configId) {
        Optional<ConfiguracionExcepcional> config = repository.findById(configId);
        if (config.isPresent()) {
            config.get().setActivo(false);
            repository.save(config.get());
        } else {
            throw new IllegalArgumentException("Configuración no encontrada con ID: " + configId);
        }
    }

    /**
     * Encontrar todas las configuraciones
     */
    public List<ConfiguracionExcepcional> findAll() {
        return (List<ConfiguracionExcepcional>) repository.findAll();
    }

    /**
     * Actualizar un feriado existente
     */
    @Transactional
    public ConfiguracionExcepcional actualizarFeriado(Integer configId, LocalDate fecha, String descripcion) {
        Optional<ConfiguracionExcepcional> configOpt = repository.findById(configId);
        if (!configOpt.isPresent()) {
            throw new IllegalArgumentException("Configuración no encontrada con ID: " + configId);
        }
        
        ConfiguracionExcepcional config = configOpt.get();
        if (config.getTipo() != ConfiguracionExcepcional.TipoExcepcion.FERIADO) {
            throw new IllegalArgumentException("La configuración especificada no es un feriado");
        }
        
        config.setFecha(fecha);
        config.setDescripcion(descripcion);
        
        return repository.save(config);
    }

    /**
     * Actualizar un mantenimiento existente
     */
    @Transactional
    public ConfiguracionExcepcional actualizarMantenimiento(Integer configId, LocalDate fecha, String descripcion, 
                                                           Integer consultorioId, LocalTime horaInicio, 
                                                           Integer tiempoSanitizacion) {
        Optional<ConfiguracionExcepcional> configOpt = repository.findById(configId);
        if (!configOpt.isPresent()) {
            throw new IllegalArgumentException("Configuración no encontrada con ID: " + configId);
        }
        
        ConfiguracionExcepcional config = configOpt.get();
        if (config.getTipo() != ConfiguracionExcepcional.TipoExcepcion.MANTENIMIENTO) {
            throw new IllegalArgumentException("La configuración especificada no es un mantenimiento");
        }
        
        Optional<Consultorio> consultorio = consultorioRepository.findById(consultorioId);
        if (!consultorio.isPresent()) {
            throw new IllegalArgumentException("Consultorio no encontrado con ID: " + consultorioId);
        }

        config.setFecha(fecha);
        config.setDescripcion(descripcion);
        config.setConsultorio(consultorio.get());
        config.setCentroAtencion(consultorio.get().getCentroAtencion());
        config.setHoraInicio(horaInicio);
        // Para mantenimiento, horaFin se calcula como horaInicio + tiempoSanitizacion
        if (horaInicio != null && tiempoSanitizacion != null) {
            config.setHoraFin(horaInicio.plusMinutes(tiempoSanitizacion));
        }
        config.setTiempoSanitizacion(tiempoSanitizacion);
        
        return repository.save(config);
    }

    /**
     * Actualizar atención especial existente
     */
    @Transactional
    public ConfiguracionExcepcional actualizarAtencionEspecial(Integer configId, LocalDate fecha, String descripcion,
                                                              Integer esquemaTurnoId, LocalTime horaInicio, 
                                                              LocalTime horaFin, Integer tiempoSanitizacion) {
        Optional<ConfiguracionExcepcional> configOpt = repository.findById(configId);
        if (!configOpt.isPresent()) {
            throw new IllegalArgumentException("Configuración no encontrada con ID: " + configId);
        }
        
        ConfiguracionExcepcional config = configOpt.get();
        if (config.getTipo() != ConfiguracionExcepcional.TipoExcepcion.ATENCION_ESPECIAL) {
            throw new IllegalArgumentException("La configuración especificada no es atención especial");
        }
        
        Optional<EsquemaTurno> esquema = esquemaTurnoRepository.findById(esquemaTurnoId);
        if (!esquema.isPresent()) {
            throw new IllegalArgumentException("EsquemaTurno no encontrado con ID: " + esquemaTurnoId);
        }

        config.setFecha(fecha);
        config.setDescripcion(descripcion);
        config.setEsquemaTurno(esquema.get());
        config.setCentroAtencion(esquema.get().getCentroAtencion());
        config.setConsultorio(esquema.get().getConsultorio());
        config.setHoraInicio(horaInicio);
        config.setHoraFin(horaFin);
        config.setTiempoSanitizacion(tiempoSanitizacion);
        
        return repository.save(config);
    }

    /**
     * Crear o actualizar una configuración excepcional
     */
    @Transactional
    public ConfiguracionExcepcional saveOrUpdate(Integer configId, LocalDate fecha, String tipoExcepcion, 
                                                String descripcion, Integer esquemaTurnoId, 
                                                LocalTime horaInicio, LocalTime horaFin, 
                                                Integer tiempoSanitizacion) {
        
        if (configId != null && configId > 0) {
            // Actualizar existente
            Optional<ConfiguracionExcepcional> existing = repository.findById(configId);
            if (existing.isPresent()) {
                ConfiguracionExcepcional.TipoExcepcion tipo = 
                    ConfiguracionExcepcional.TipoExcepcion.valueOf(tipoExcepcion.toUpperCase());
                
                switch (tipo) {
                    case FERIADO:
                        return actualizarFeriado(configId, fecha, descripcion);
                    case MANTENIMIENTO:
                        if (esquemaTurnoId != null) {
                            EsquemaTurno esquema = esquemaTurnoRepository.findById(esquemaTurnoId)
                                .orElseThrow(() -> new IllegalArgumentException("EsquemaTurno no encontrado"));
                            return actualizarMantenimiento(configId, fecha, descripcion, 
                                esquema.getConsultorio().getId(), horaInicio, tiempoSanitizacion);
                        }
                        break;
                    case ATENCION_ESPECIAL:
                        return actualizarAtencionEspecial(configId, fecha, descripcion, 
                            esquemaTurnoId, horaInicio, horaFin, tiempoSanitizacion);
                }
            }
        }
        
        // Crear nuevo
        ConfiguracionExcepcional.TipoExcepcion tipo = 
            ConfiguracionExcepcional.TipoExcepcion.valueOf(tipoExcepcion.toUpperCase());
        
        switch (tipo) {
            case FERIADO:
                return crearFeriado(fecha, descripcion);
            case MANTENIMIENTO:
                if (esquemaTurnoId != null) {
                    EsquemaTurno esquema = esquemaTurnoRepository.findById(esquemaTurnoId)
                        .orElseThrow(() -> new IllegalArgumentException("EsquemaTurno no encontrado"));
                    return crearMantenimiento(fecha, descripcion, 
                        esquema.getConsultorio().getId(), horaInicio, tiempoSanitizacion);
                }
                break;
            case ATENCION_ESPECIAL:
                return crearAtencionEspecial(fecha, descripcion, 
                    esquemaTurnoId, horaInicio, horaFin, tiempoSanitizacion);
        }
        
        throw new IllegalArgumentException("Tipo de excepción no válido o faltan parámetros requeridos");
    }

    // ==================== MÉTODOS DTO ====================

    /**
     * Crear o actualizar una configuración excepcional usando DTO
     */
    @Transactional
    public ConfiguracionExcepcionalDTO saveOrUpdateDTO(ConfiguracionExcepcionalDTO dto) {
        ConfiguracionExcepcional entity = saveOrUpdate(
            dto.getId(),
            dto.getFecha(),
            dto.getTipo(),
            dto.getDescripcion(),
            dto.getEsquemaTurnoId(),
            dto.getHoraInicio(),
            dto.getHoraFin(),
            dto.getTiempoSanitizacion()
        );
        
        return ConfiguracionExcepcionalDTO.fromEntity(entity);
    }

    /**
     * Crear un feriado usando DTO
     */
    @Transactional
    public ConfiguracionExcepcionalDTO crearFeriadoDTO(LocalDate fecha, String descripcion) {
        ConfiguracionExcepcional entity = crearFeriado(fecha, descripcion);
        return ConfiguracionExcepcionalDTO.fromEntity(entity);
    }

    /**
     * Crear un mantenimiento usando DTO
     */
    @Transactional
    public ConfiguracionExcepcionalDTO crearMantenimientoDTO(LocalDate fecha, String descripcion, 
                                                           Integer consultorioId, LocalTime horaInicio, 
                                                           Integer tiempoSanitizacion) {
        ConfiguracionExcepcional entity = crearMantenimiento(fecha, descripcion, consultorioId, horaInicio, tiempoSanitizacion);
        return ConfiguracionExcepcionalDTO.fromEntity(entity);
    }

    /**
     * Crear atención especial usando DTO
     */
    @Transactional
    public ConfiguracionExcepcionalDTO crearAtencionEspecialDTO(LocalDate fecha, String descripcion,
                                                              Integer esquemaTurnoId, LocalTime horaInicio, 
                                                              LocalTime horaFin, Integer tiempoSanitizacion) {
        ConfiguracionExcepcional entity = crearAtencionEspecial(fecha, descripcion, esquemaTurnoId, horaInicio, horaFin, tiempoSanitizacion);
        return ConfiguracionExcepcionalDTO.fromEntity(entity);
    }

    /**
     * Obtener todas las configuraciones para una fecha como DTO
     */
    public List<ConfiguracionExcepcionalDTO> obtenerConfiguracionesDTO(LocalDate fecha) {
        List<ConfiguracionExcepcional> entities = obtenerConfiguraciones(fecha);
        return entities.stream()
                      .map(ConfiguracionExcepcionalDTO::fromEntity)
                      .collect(Collectors.toList());
    }

    /**
     * Obtener configuraciones por rango de fechas como DTO
     */
    public List<ConfiguracionExcepcionalDTO> obtenerConfiguracionesPorRangoDTO(LocalDate fechaInicio, LocalDate fechaFin) {
        List<ConfiguracionExcepcional> entities = obtenerConfiguracionesPorRango(fechaInicio, fechaFin);
        return entities.stream()
                      .map(ConfiguracionExcepcionalDTO::fromEntity)
                      .collect(Collectors.toList());
    }

    /**
     * Obtener configuraciones por rango de fechas y centro como DTO
     */
    public List<ConfiguracionExcepcionalDTO> obtenerConfiguracionesPorCentroDTO(LocalDate fechaInicio, 
                                                                               LocalDate fechaFin, 
                                                                               Integer centroId) {
        List<ConfiguracionExcepcional> entities = obtenerConfiguracionesPorCentro(fechaInicio, fechaFin, centroId);
        return entities.stream()
                      .map(ConfiguracionExcepcionalDTO::fromEntity)
                      .collect(Collectors.toList());
    }

    /**
     * Obtener todas las configuraciones como DTO
     */
    public List<ConfiguracionExcepcionalDTO> findAllDTO() {
        List<ConfiguracionExcepcional> entities = findAll();
        return entities.stream()
                      .map(ConfiguracionExcepcionalDTO::fromEntity)
                      .collect(Collectors.toList());
    }

    /**
     * Obtener configuración por ID como DTO
     */
    public Optional<ConfiguracionExcepcionalDTO> findByIdDTO(Integer id) {
        Optional<ConfiguracionExcepcional> entity = repository.findById(id);
        return entity.map(ConfiguracionExcepcionalDTO::fromEntity);
    }

    /**
     * Actualizar un feriado usando DTO
     */
    @Transactional
    public ConfiguracionExcepcionalDTO actualizarFeriadoDTO(Integer configId, LocalDate fecha, String descripcion) {
        ConfiguracionExcepcional entity = actualizarFeriado(configId, fecha, descripcion);
        return ConfiguracionExcepcionalDTO.fromEntity(entity);
    }

    /**
     * Actualizar un mantenimiento usando DTO
     */
    @Transactional
    public ConfiguracionExcepcionalDTO actualizarMantenimientoDTO(Integer configId, LocalDate fecha, String descripcion, 
                                                                Integer consultorioId, LocalTime horaInicio, 
                                                                Integer tiempoSanitizacion) {
        ConfiguracionExcepcional entity = actualizarMantenimiento(configId, fecha, descripcion, consultorioId, horaInicio, tiempoSanitizacion);
        return ConfiguracionExcepcionalDTO.fromEntity(entity);
    }

    /**
     * Actualizar atención especial usando DTO
     */
    @Transactional
    public ConfiguracionExcepcionalDTO actualizarAtencionEspecialDTO(Integer configId, LocalDate fecha, String descripcion,
                                                                   Integer esquemaTurnoId, LocalTime horaInicio, 
                                                                   LocalTime horaFin, Integer tiempoSanitizacion) {
        ConfiguracionExcepcional entity = actualizarAtencionEspecial(configId, fecha, descripcion, esquemaTurnoId, horaInicio, horaFin, tiempoSanitizacion);
        return ConfiguracionExcepcionalDTO.fromEntity(entity);
    }
}
