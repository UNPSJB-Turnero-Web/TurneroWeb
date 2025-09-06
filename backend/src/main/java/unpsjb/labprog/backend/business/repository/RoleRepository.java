package unpsjb.labprog.backend.business.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import unpsjb.labprog.backend.model.Role;

import java.util.List;
import java.util.Optional;

/**
 * Repositorio para la entidad Role
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    
    /**
     * Busca un rol por nombre (case insensitive)
     */
    Optional<Role> findByNameIgnoreCase(String name);
    
    /**
     * Busca un rol por nombre exacto
     */
    Optional<Role> findByName(String name);
    
    /**
     * Verifica si existe un rol con el nombre dado
     */
    boolean existsByNameIgnoreCase(String name);
    
    /**
     * Obtiene todos los roles activos
     */
    List<Role> findByActiveTrue();
    
    /**
     * Obtiene todos los roles ordenados por nombre
     */
    @Query("SELECT r FROM Role r ORDER BY r.name ASC")
    List<Role> findAllOrderByName();
    
    /**
     * Obtiene roles activos ordenados por nombre
     */
    @Query("SELECT r FROM Role r WHERE r.active = true ORDER BY r.name ASC")
    List<Role> findActiveRolesOrderByName();
    
    /**
     * Busca roles por nombre que contenga el texto dado
     */
    @Query("SELECT r FROM Role r WHERE LOWER(r.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(r.displayName) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Role> findByNameContainingIgnoreCase(@Param("searchTerm") String searchTerm);
}
