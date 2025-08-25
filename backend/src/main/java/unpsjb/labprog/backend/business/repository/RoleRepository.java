package unpsjb.labprog.backend.business.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import unpsjb.labprog.backend.model.Role;

/**
 * Repositorio para la entidad Role unificada
 */
@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    /**
     * Busca todos los roles activos para un DNI específico
     */
    List<Role> findByDniAndActiveTrue(Long dni);

    /**
     * Busca todos los roles (activos e inactivos) para un DNI específico
     */
    List<Role> findByDni(Long dni);

    /**
     * Busca un rol específico activo para un usuario
     */
    Optional<Role> findByDniAndRoleNameAndActiveTrue(Long dni, String roleName);

    /**
     * Verifica si un usuario tiene un rol específico activo
     */
    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Role r WHERE r.dni = :dni AND r.roleName = :roleName AND r.active = true")
    boolean hasActiveRole(@Param("dni") Long dni, @Param("roleName") String roleName);

    /**
     * Busca todos los usuarios con un rol específico activo
     */
    List<Role> findByRoleNameAndActiveTrue(String roleName);

    /**
     * Busca todos los roles activos
     */
    List<Role> findByActiveTrue();

    /**
     * Busca todos los roles inactivos
     */
    List<Role> findByActiveFalse();

    /**
     * Cuenta cuántos usuarios tienen un rol específico activo
     */
    @Query("SELECT COUNT(DISTINCT r.dni) FROM Role r WHERE r.roleName = :roleName AND r.active = true")
    long countActiveUsersByRole(@Param("roleName") String roleName);

    /**
     * Obtiene todos los DNIs que tienen al menos un rol activo
     */
    @Query("SELECT DISTINCT r.dni FROM Role r WHERE r.active = true")
    List<Long> findAllActiveUserDnis();

    /**
     * Obtiene todos los nombres de roles únicos
     */
    @Query("SELECT DISTINCT r.roleName FROM Role r")
    List<String> findAllRoleNames();

    /**
     * Obtiene todos los nombres de roles activos únicos
     */
    @Query("SELECT DISTINCT r.roleName FROM Role r WHERE r.active = true")
    List<String> findAllActiveRoleNames();

    /**
     * Desactiva todos los roles de un usuario específico
     */
    @Modifying
    @Transactional
    @Query("UPDATE Role r SET r.active = false WHERE r.dni = :dni")
    int deactivateAllRolesByDni(@Param("dni") Long dni);

    /**
     * Desactiva un rol específico de un usuario
     */
    @Modifying
    @Transactional
    @Query("UPDATE Role r SET r.active = false WHERE r.dni = :dni AND r.roleName = :roleName")
    int deactivateRole(@Param("dni") Long dni, @Param("roleName") String roleName);

    /**
     * Reactiva un rol específico de un usuario
     */
    @Modifying
    @Transactional
    @Query("UPDATE Role r SET r.active = true WHERE r.dni = :dni AND r.roleName = :roleName")
    int reactivateRole(@Param("dni") Long dni, @Param("roleName") String roleName);

    /**
     * Busca roles por nombre parcial (útil para búsquedas)
     */
    List<Role> findByRoleNameContainingIgnoreCaseAndActiveTrue(String roleName);

    /**
     * Obtiene estadísticas de roles activos agrupadas por nombre de rol
     */
    @Query("SELECT r.roleName, r.displayName, COUNT(DISTINCT r.dni) as userCount FROM Role r WHERE r.active = true GROUP BY r.roleName, r.displayName ORDER BY r.roleName")
    List<Object[]> getRoleStatistics();

    /**
     * Busca si existe un rol específico (activo o inactivo) para un usuario
     */
    boolean existsByDniAndRoleName(Long dni, String roleName);

    /**
     * Obtiene roles por DNI ordenados por fecha de creación
     */
    List<Role> findByDniOrderByCreatedAtDesc(Long dni);

    /**
     * Obtiene roles activos por DNI ordenados por fecha de creación
     */
    List<Role> findByDniAndActiveTrueOrderByCreatedAtDesc(Long dni);
}