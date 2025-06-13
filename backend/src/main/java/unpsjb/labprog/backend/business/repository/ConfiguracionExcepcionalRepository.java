package unpsjb.labprog.backend.business.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.repository.CrudRepository;
import org.springframework.data.repository.PagingAndSortingRepository;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.ConfiguracionExcepcional;

@Repository
public interface ConfiguracionExcepcionalRepository extends CrudRepository<ConfiguracionExcepcional, Integer>, 
                                                           PagingAndSortingRepository<ConfiguracionExcepcional, Integer> {
    
    // Buscar todas las configuraciones activas para una fecha
    List<ConfiguracionExcepcional> findByFechaAndActivoTrue(LocalDate fecha);
    
    // Buscar configuraciones por tipo y fecha
    List<ConfiguracionExcepcional> findByTipoAndFechaAndActivoTrue(
        ConfiguracionExcepcional.TipoExcepcion tipo, LocalDate fecha);
    
    // Buscar configuraciones por rango de fechas
    List<ConfiguracionExcepcional> findByFechaBetweenAndActivoTrue(LocalDate fechaInicio, LocalDate fechaFin);
    
    // Buscar configuraciones por centro de atención y fecha
    List<ConfiguracionExcepcional> findByFechaAndCentroAtencion_IdAndActivoTrue(LocalDate fecha, Integer centroId);
    
    // Buscar configuraciones por consultorio y fecha (para mantenimientos)
    List<ConfiguracionExcepcional> findByFechaAndConsultorio_IdAndActivoTrue(LocalDate fecha, Integer consultorioId);
    
    // Buscar configuraciones por esquema de turno y fecha
    List<ConfiguracionExcepcional> findByFechaAndEsquemaTurno_IdAndActivoTrue(LocalDate fecha, Integer esquemaTurnoId);
    
    // Verificar si existe un feriado para una fecha
    boolean existsByFechaAndTipoAndActivoTrue(LocalDate fecha, ConfiguracionExcepcional.TipoExcepcion tipo);
    
    // Buscar por rango de fechas y centro (para filtros en frontend)
    List<ConfiguracionExcepcional> findByFechaBetweenAndCentroAtencion_IdAndActivoTrue(
        LocalDate fechaInicio, LocalDate fechaFin, Integer centroId);
}
