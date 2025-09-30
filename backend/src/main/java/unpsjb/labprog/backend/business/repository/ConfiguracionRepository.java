package unpsjb.labprog.backend.business.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import unpsjb.labprog.backend.model.Configuracion;

public interface ConfiguracionRepository extends JpaRepository<Configuracion, Integer> {

    // Para buscar configuración por clave
    Optional<Configuracion> findByClave(String clave);

    // Para buscar configuraciones por categoría
    List<Configuracion> findByCategoria(String categoria);

    // Para verificar si existe una configuración (evitar duplicados)
    boolean existsByClave(String clave);

    // Para buscar por categoría ordenadas (opcional, mejora UX)
    @Query("SELECT c FROM Configuracion c WHERE c.categoria = :categoria ORDER BY c.clave")
    List<Configuracion> findByCategoriaOrderByClave(@Param("categoria") String categoria);

    // Para obtener todas las categorías disponibles (opcional, para frontend)
    @Query("SELECT DISTINCT c.categoria FROM Configuracion c ORDER BY c.categoria")
    List<String> findDistinctCategorias();
}