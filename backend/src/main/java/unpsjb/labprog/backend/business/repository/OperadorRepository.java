package unpsjb.labprog.backend.business.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.Operador;

@Repository
public interface OperadorRepository extends JpaRepository<Operador, Long> {

    boolean existsByDni(Long dni);

    Optional<Operador> findByDni(Long dni);

    Optional<Operador> findByEmail(String email);

    boolean existsByTelefono(String telefono);

    boolean existsByTelefonoAndIdNot(String telefono, Long id);

    /**
     * Método para búsqueda paginada con filtros opcionales por nombre, email y estado.
     * Utiliza LIKE para búsqueda parcial insensible a mayúsculas/minúsculas.
     */
    @Query("SELECT o FROM Operador o WHERE " +
           "(:nombre IS NULL OR LOWER(o.nombre) LIKE LOWER(CONCAT('%', :nombre, '%'))) AND " +
           "(:email IS NULL OR LOWER(o.email) LIKE LOWER(CONCAT('%', :email, '%'))) AND " +
           "(:estado IS NULL OR o.activo = :estado)")
    Page<Operador> findByFiltros(@Param("nombre") String nombre,
                                 @Param("email") String email,
                                 @Param("estado") Boolean estado,
                                 Pageable pageable);
}