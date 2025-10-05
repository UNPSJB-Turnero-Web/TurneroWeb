package unpsjb.labprog.backend.business.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.ObraSocial;

@Repository
public interface ObraSocialRepository extends JpaRepository<ObraSocial, Integer> {
    
    boolean existsByNombre(String nombre);
    
    /**
     * Búsqueda paginada avanzada con filtros combinados y ordenamiento dinámico
     * @param nombre Filtro por nombre de la obra social (LIKE, opcional)
     * @param codigo Filtro por código de la obra social (LIKE, opcional) 
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de obras sociales filtradas y ordenadas
     */
    @Query("""
        SELECT os FROM ObraSocial os
        WHERE (:nombre IS NULL OR 
               LOWER(os.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
           AND (:codigo IS NULL OR 
                LOWER(os.codigo) LIKE LOWER(CONCAT('%', :codigo, '%')))
        """)
    Page<ObraSocial> findByFiltros(@Param("nombre") String nombre,
                                   @Param("codigo") String codigo,
                                   Pageable pageable);
}