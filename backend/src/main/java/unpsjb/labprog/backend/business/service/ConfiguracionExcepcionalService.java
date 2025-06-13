package unpsjb.labprog.backend.business.service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.business.repository.ConfiguracionExcepcionalRepository;
import unpsjb.labprog.backend.business.repository.CentroAtencionRepository;
import unpsjb.labprog.backend.business.repository.ConsultorioRepository;
import unpsjb.labprog.backend.business.repository.EsquemaTurnoRepository;
import unpsjb.labprog.backend.model.ConfiguracionExcepcional;
import unpsjb.labprog.backend.model.CentroAtencion;
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
    private CentroAtencionRepository centroAtencionRepository;
    
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
                                                      Integer consultorioId, Integer tiempoSanitizacion) {
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
}
