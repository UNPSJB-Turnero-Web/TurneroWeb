package unpsjb.labprog.backend.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import unpsjb.labprog.backend.model.CentroAtencion;
import unpsjb.labprog.backend.model.Especialidad;

@Repository

public interface CentroAtencionRepository
        extends JpaRepository<CentroAtencion, Integer> {
    // heredas un List<CentroAtencion> findAll()

    @Query("SELECT c FROM CentroAtencion c WHERE UPPER(c.nombre) LIKE ?1")
    List<CentroAtencion> search(String term);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.nombre = ?1 AND c.direccion = ?2")
    boolean existsByNombreAndDireccion(String nombre, String direccion);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.direccion = ?1")
    boolean existsByDireccion(String direccion);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.nombre = ?1")
    boolean existsByNombre(String nombre);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.direccion = ?1 AND c.id != ?2")
    boolean existsByDireccionAndIdNot(String direccion, Integer id);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.nombre = ?1 AND c.direccion = ?2 AND c.id != ?3")
    boolean existsByNombreAndDireccionAndIdNot(String nombre, String direccion, Integer id);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.nombre = ?1 AND c.id != ?2")
    boolean existsByNombreAndIdNot(String nombre, Integer id);

    @Query("SELECT COUNT(c) > 0 FROM CentroAtencion c WHERE c.latitud = ?1 AND c.longitud = ?2 AND c.id != ?3")
    boolean existsByCoordenadasAndIdNot(Double latitud, Double longitud, Integer id);

    @Query("SELECT e FROM CentroAtencion c JOIN c.especialidades e WHERE c.id = :centroId")
    List<Especialidad> findEspecialidadesByCentroId(@Param("centroId") Integer centroId);

    @Query("SELECT CASE WHEN COUNT(e) > 0 THEN TRUE ELSE FALSE END " +
            "FROM CentroAtencion c JOIN c.especialidades e " +
            "WHERE c.id = :centroId AND e.id = :especialidadId")
    boolean existsEspecialidadInCentro(@Param("centroId") Integer centroId,
            @Param("especialidadId") Integer especialidadId);

    @Query("SELECT c FROM CentroAtencion c WHERE c.nombre = ?1")
    CentroAtencion findByNombre(String nombre);

}