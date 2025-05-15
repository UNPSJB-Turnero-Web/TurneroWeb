package unpsjb.labprog.backend.business.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import unpsjb.labprog.backend.model.Especialidad;

public interface EspecialidadRepository extends JpaRepository<Especialidad, Integer> {
    boolean existsByNombre(String nombre);

    // Verifica si existe una especialidad con el nombre (ignorando
    // mayúsculas/minúsculas)
    boolean existsByNombreIgnoreCase(String nombre);

    Especialidad findByNombreIgnoreCase(String nombre);

    // Verifica si existe una especialidad con el nombre (ignorando
    // mayúsculas/minúsculas) excluyendo un ID específico
    boolean existsByNombreIgnoreCaseAndIdNot(String nombre, int id);

  @Query("SELECT DISTINCT s.especialidad FROM StaffMedico s WHERE s.centro.id = :centroId")
    List<Especialidad> findByCentroAtencionId(@Param("centroId") Long centroId);

}
