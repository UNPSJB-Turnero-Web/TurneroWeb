package unpsjb.labprog.backend.business.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.Paciente;

@Repository
public interface PacienteRepository extends JpaRepository<Paciente, Integer> {
    boolean existsByDni(Long dni);
    boolean existsByEmail(String email);
    Optional<Paciente> findByDni(Long dni);
    Optional<Paciente> findByEmail(String email);

    /**
     * Método para búsqueda paginada con filtros combinados y ordenamiento dinámico
     * @param nombre Filtro por nombre (LIKE, opcional)
     * @param apellido Filtro por apellido (LIKE, opcional)
     * @param documento Filtro por DNI (LIKE, opcional)
     * @param email Filtro por email (LIKE, opcional)
     * @param estado Filtro por estado (activo/inactivo basado en existencia de usuario, opcional)
     * @param pageable Configuración de paginación y ordenamiento
     * @return Página de pacientes filtrados y ordenados
     */
    @Query("""
        SELECT p FROM Paciente p
        LEFT JOIN User u ON u.email = p.email
        WHERE (:nombre IS NULL OR LOWER(p.nombre) LIKE LOWER(CONCAT('%', :nombre, '%')))
           AND (:apellido IS NULL OR LOWER(p.apellido) LIKE LOWER(CONCAT('%', :apellido, '%')))
           AND (:documento IS NULL OR CAST(p.dni AS string) LIKE CONCAT('%', :documento, '%'))
           AND (:email IS NULL OR LOWER(p.email) LIKE LOWER(CONCAT('%', :email, '%')))
           AND (:estado IS NULL OR
                (:estado = 'activo' AND u IS NOT NULL) OR
                (:estado = 'inactivo' AND u IS NULL))
        """)
    Page<Paciente> findByFiltros(@Param("nombre") String nombre,
                                 @Param("apellido") String apellido,
                                 @Param("documento") String documento,
                                 @Param("email") String email,
                                 @Param("estado") String estado,
                                 Pageable pageable);
}
